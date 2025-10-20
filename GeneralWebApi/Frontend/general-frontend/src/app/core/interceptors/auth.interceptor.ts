import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '@core/services/token.service';
import { AuthService } from '@core/services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);

  const token = tokenService.getAccessToken();
  const authReq = token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;

  // Avoid refresh loop on refresh endpoint
  const isRefreshCall = request.url.includes('/auth/refresh');

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isRefreshCall) {
        const refresh = tokenService.getRefreshToken();
        if (!refresh) {
          tokenService.clearAllTokens();
          return throwError(() => error);
        }
        return authService.refreshToken({ refreshToken: refresh }).pipe(
          switchMap(data => {
            const retried = request.clone({
              setHeaders: { Authorization: `Bearer ${data.token.accessToken}` },
            });
            return next(retried);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
