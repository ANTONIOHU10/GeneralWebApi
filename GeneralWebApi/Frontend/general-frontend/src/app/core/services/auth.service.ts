// Path: GeneralWebApi/Frontend/general-frontend/src/app/core/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { BaseHttpService } from './base-http.service';
import { TokenService } from './token.service';
import {
  LoginRequest,
  LoginData,
  RefreshTokenRequest,
  RefreshTokenData,
  LogoutRequest,
  LogoutData,
  UserInfoRequest,
  UserInfoData,
  UpdatePasswordRequest,
  UpdatePasswordData,
} from 'app/contracts/auth/auth.models';
import { ApiResponse } from 'app/contracts/common/api-response';
import { decodeJwt } from '@core/utils/jwt.util';

@Injectable({ providedIn: 'root' })
export class AuthService extends BaseHttpService {
  private token = inject(TokenService);
  private readonly endpoint = `${this.baseUrl}/auth`;

  // Login - automatically extracts data and handles token storage
  login(payload: LoginRequest): Observable<LoginData> {
    console.log('AuthService: Starting login request...', payload);

    const rememberMe = payload.rememberMe ?? false;

    return this.post<LoginData>(`${this.endpoint}/login`, payload).pipe(
      tap(data => {
        console.log('AuthService: Login response received:', data);

        // Extract token from response data
        const tokenData = data?.token;
        console.log('AuthService: Token data:', tokenData);

        if (tokenData?.accessToken) {
          console.log('AuthService: Setting access token...');
          // Use rememberMe to determine storage strategy
          this.token.setAccessToken(tokenData.accessToken, rememberMe);
          console.log(
            'AuthService: Access token set, verifying...',
            this.token.getAccessToken()
          );
        } else {
          console.error('AuthService: No access token in response!');
        }

        if (tokenData?.refreshToken) {
          console.log('AuthService: Setting refresh token...');
          // Use rememberMe to determine storage strategy
          this.token.setRefreshToken(tokenData.refreshToken, rememberMe);
        }

        // Save refresh token expiration time if provided
        if (tokenData?.refreshTokenExpiresAt) {
          this.token.setRefreshTokenExpiresAt(tokenData.refreshTokenExpiresAt);
        }

        // Save remember me preference
        this.token.setRememberMe(rememberMe);
      })
    );
  }

  // Refresh token - automatically extracts data and handles token storage
  refreshToken(payload: RefreshTokenRequest): Observable<RefreshTokenData> {
    // Get rememberMe preference to maintain storage strategy
    const rememberMe = this.token.getRememberMe();

    return this.post<RefreshTokenData>(`${this.endpoint}/refresh`, payload).pipe(
      tap(data => {
        // Extract token from response data
        const tokenData = data?.token;

        if (tokenData?.accessToken) {
          // Use rememberMe to maintain storage strategy
          this.token.setAccessToken(tokenData.accessToken, rememberMe);
        }
        if (tokenData?.refreshToken) {
          // Use rememberMe to maintain storage strategy
          this.token.setRefreshToken(tokenData.refreshToken, rememberMe);
        }

        // Update refresh token expiration time if provided
        if (tokenData?.refreshTokenExpiresAt) {
          this.token.setRefreshTokenExpiresAt(tokenData.refreshTokenExpiresAt);
        }
      })
    );
  }

  // Get user info - automatically extracts data
  getUserInfo(payload: UserInfoRequest): Observable<UserInfoData> {
    return this.post<UserInfoData>(`${this.endpoint}/userinfo`, payload);
  }

  // Logout - handles both backend and local logout
  logout(payload?: LogoutRequest): Observable<LogoutData | void> {
    if (payload) {
      // Call backend logout if refresh token provided
      // Note: logout API may return data: null, so we use http.post directly
      // to avoid extractData validation that requires data to be non-null
      return this.http.post<ApiResponse<LogoutData>>(`${this.endpoint}/logout`, payload).pipe(
        map((response: ApiResponse<LogoutData>) => {
          // Extract message from ApiResponse
          // Logout API may return { success: true, message: "Logout successful", data: null }
          const message = response.message || 'Logout successful';
          return { message } as LogoutData;
        }),
        tap(() => this.token.clearAllTokens()),
        catchError((error) => {
          // Even if API call fails, clear tokens locally
          this.token.clearAllTokens();
          // Re-throw error for component to handle
          return throwError(() => error);
        })
      );
    } else {
      // Local logout only
      this.token.clearAllTokens();
      return of(void 0);
    }
  }

  // Get roles from JWT token
  getRolesFromToken(): string[] {
    const token = this.token.getAccessToken();
    const decoded = token ? decodeJwt(token) : null;
    const roles = decoded?.roles;
    if (!roles) return [];
    return Array.isArray(roles) ? roles : [String(roles)];
  }

  // Get user info from JWT token
  getUserFromToken(): {
    id?: string;
    username?: string;
    email?: string;
  } | null {
    const token = this.token.getAccessToken();
    const decoded = token ? decodeJwt(token) : null;
    if (!decoded) return null;

    return {
      id: decoded.sub,
      username: decoded.name,
      email: decoded.email,
    };
  }

  // Get current user info from API endpoint
  // BaseHttpService automatically unwraps ApiResponse<T> to T
  getCurrentUser(): Observable<{
    userId?: string;
    username?: string;
    email?: string;
    roles?: string[];
  }> {
    return this.get<{
      userId?: string;
      username?: string;
      email?: string;
      roles?: string[];
    }>(`${this.endpoint}/me`);
  }

  // Update password - automatically extracts data
  updatePassword(payload: UpdatePasswordRequest): Observable<UpdatePasswordData> {
    return this.put<UpdatePasswordData>(`${this.endpoint}/update-password`, payload);
  }
}
