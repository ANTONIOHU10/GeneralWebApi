import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { TokenService } from './token.service';
// which improt? test or prod?
import { environment } from '@environments/environment';
import { catchError, map, of, tap, throwError } from 'rxjs';
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
import { ApiResponse } from 'app/contracts/common/api-response';
import { decodeJwt } from '@core/utils/jwt.util';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private token = inject(TokenService);
  private base = environment.apiUrl;

  // without the usage of response.success, we handle all the errors in the interceptor
  // it will create a problem if the backend return a 201 but the response is not successful

  // src/app/core/services/auth.service.ts
  login(payload: LoginRequest) {
    console.log('AuthService: Starting login request...', payload);

    return this.http
      .post<ApiResponse<LoginData>>(`${this.base}/auth/login`, payload)
      .pipe(
        tap(res => {
          console.log('AuthService: Login response received:', res);

          // 修复：从 res.data.token 中获取 token
          const tokenData = res.data?.token;
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
        }),
        map(res => res.data), // 返回整个 data 对象
        catchError(err => {
          console.error('AuthService: Login error:', err);
          const message = err?.error?.message ?? 'Login failed';
          return throwError(() => new Error(message));
        })
      );
  }

  // src/app/core/services/auth.service.ts
  refreshToken(payload: RefreshTokenRequest) {
    return this.http
      .post<ApiResponse<RefreshTokenData>>(`${this.base}/auth/refresh`, payload)
      .pipe(
        tap(res => {
          // 修复：从 res.data.token 中获取 token
          const tokenData = res.data?.token;

          if (tokenData?.accessToken) {
            this.token.setAccessToken(tokenData.accessToken);
          }
          if (tokenData?.refreshToken) {
            this.token.setRefreshToken(tokenData.refreshToken);
          }
        }),
        map(res => res.data),
        catchError(err => {
          const message = err?.error?.message ?? 'Token refresh failed';
          return throwError(() => new Error(message));
        })
      );
  }

  getUserInfo(payload: UserInfoRequest) {
    return this.http
      .post<ApiResponse<UserInfoData>>(`${this.base}/auth/userinfo`, payload)
      .pipe(
        map(res => res.data),
        catchError(err => {
          const message = err?.error?.message ?? 'Failed to get user info';
          return throwError(() => new Error(message));
        })
      );
  }

  logout(payload?: LogoutRequest) {
    if (payload) {
      // Call backend logout if refresh token provided
      return this.http
        .post<ApiResponse<LogoutData>>(`${this.base}/auth/logout`, payload)
        .pipe(
          tap(() => this.token.clearAllTokens()),
          map(res => res.data),
          catchError(() => {
            // Even if backend fails, clear local tokens
            this.token.clearAllTokens();
            return throwError(() => new Error('Logout failed'));
          })
        );
    } else {
      // Local logout only
      this.token.clearAllTokens();
      // return an <Observable<void>>
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
