// Path: GeneralWebApi/Frontend/general-frontend/src/app/core/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
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
} from 'app/contracts/auth/auth.models';
import { decodeJwt } from '@core/utils/jwt.util';

@Injectable({ providedIn: 'root' })
export class AuthService extends BaseHttpService {
  private token = inject(TokenService);
  private readonly endpoint = `${this.baseUrl}/auth`;

  // Login - automatically extracts data and handles token storage
  login(payload: LoginRequest): Observable<LoginData> {
    console.log('AuthService: Starting login request...', payload);

    return this.post<LoginData>(`${this.endpoint}/login`, payload).pipe(
      tap(data => {
        console.log('AuthService: Login response received:', data);

        // Extract token from response data
        const tokenData = data?.token;
        console.log('AuthService: Token data:', tokenData);

        if (tokenData?.accessToken) {
          console.log('AuthService: Setting access token...');
          this.token.setAccessToken(tokenData.accessToken);
          console.log(
            'AuthService: Access token set, verifying...',
            localStorage.getItem('access_token')
          );
        } else {
          console.error('AuthService: No access token in response!');
        }

        if (tokenData?.refreshToken) {
          console.log('AuthService: Setting refresh token...');
          this.token.setRefreshToken(tokenData.refreshToken);
        }
      })
    );
  }

  // Refresh token - automatically extracts data and handles token storage
  refreshToken(payload: RefreshTokenRequest): Observable<RefreshTokenData> {
    return this.post<RefreshTokenData>(`${this.endpoint}/refresh`, payload).pipe(
      tap(data => {
        // Extract token from response data
        const tokenData = data?.token;

        if (tokenData?.accessToken) {
          this.token.setAccessToken(tokenData.accessToken);
        }
        if (tokenData?.refreshToken) {
          this.token.setRefreshToken(tokenData.refreshToken);
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
      return this.post<LogoutData>(`${this.endpoint}/logout`, payload).pipe(
        tap(() => this.token.clearAllTokens())
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
}
