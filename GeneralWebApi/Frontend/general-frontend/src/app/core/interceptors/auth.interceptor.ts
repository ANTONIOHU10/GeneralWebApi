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

  // send a new value (the current request with the new access token) to the next interceptor
  // if this is the last interceptor, the request will be sent to the backend
  return next(authReq).pipe(
    // if from backend we get a 401 error, we need to refresh the token
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isRefreshCall) {
        const refresh = tokenService.getRefreshToken();
        // if we don't have a refresh token, and we are not calling the refresh endpoint,
        // we need to clear the tokens and return the error
        if (!refresh) {
          tokenService.clearAllTokens();
          return throwError(() => error);
        }
        // if we have a refresh token, we need to refresh the token
        // call the refresh endpoint
        return authService.refreshToken({ refreshToken: refresh }).pipe(
          // if the refresh is successful, we need to update the access token
          // the data is the return datas, it contain refresh token and access token
          switchMap(data => {
            // create a new request with the new access token
            // send a new value (the current request with the new access token) to the next interceptor
            // if this is the last interceptor, the request will be sent to the backend
            const retried = request.clone({
              setHeaders: { Authorization: `Bearer ${data.token.accessToken}` },
            });
            return next(retried); // send a new value (the current request with the new access token) to the next interceptor
          })
        );
      }
      return throwError(() => error); // return the error
    })
  );
};
