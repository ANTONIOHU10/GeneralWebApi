import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { TokenService } from "./token.service";
// which improt? test or prod?
import { environment } from "@environments/environment";
import { catchError, map, tap, throwError } from "rxjs";
import { 
  LoginRequest, LoginData, 
  RefreshTokenRequest, RefreshTokenData,
  LogoutRequest, LogoutData,
  UserInfoRequest, UserInfoData 
} from "app/contracts/auth/auth.models";
import { ApiResponse } from "app/contracts/common/api-response";
import { decodeJwt } from "@core/utils/jwt.util";

@Injectable({ providedIn: 'root' })
export class AuthService {
    private http = inject(HttpClient);
    private token = inject(TokenService);
    private base = environment.apiUrl;

    // without the usage of response.success, we handle all the errors in the interceptor
    // it will create a problem if the backend return a 201 but the response is not successful

    login(payload: LoginRequest) {
        // return an <Observable<ApiResponse<LoginData>>>
        return this.http.post<ApiResponse<LoginData>>(`${this.base}/auth/login`, payload).pipe(
            tap(res => {
                const data = res.data;
                this.token.setAccessToken(data.accessToken);
                if (data.refreshToken) {
                    this.token.setRefreshToken(data.refreshToken);
                }
            }),
            map(res => res.data),
            catchError(err => {
                const message = err?.error?.message ?? 'Login failed';
                return throwError(() => new Error(message));
            })
        )
    }

    refreshToken(payload: RefreshTokenRequest) {
        return this.http.post<ApiResponse<RefreshTokenData>>(`${this.base}/auth/refresh`, payload).pipe(
            tap(res => {
                const data = res.data;
                this.token.setAccessToken(data.accessToken);
                if (data.refreshToken) {
                    this.token.setRefreshToken(data.refreshToken);
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
        return this.http.post<ApiResponse<UserInfoData>>(`${this.base}/auth/userinfo`, payload).pipe(
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
            return this.http.post<ApiResponse<LogoutData>>(`${this.base}/auth/logout`, payload).pipe(
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
            return Promise.resolve();
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
    getUserFromToken(): { id?: string; username?: string; email?: string } | null {
        const token = this.token.getAccessToken();
        const decoded = token ? decodeJwt(token) : null;
        if (!decoded) return null;
        
        return {
            id: decoded.sub,
            username: decoded.name,
            email: decoded.email
        };
    }

}