import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { TokenService } from "@core/services/token.service";

export const authInterceptor: HttpInterceptorFn = (request, next) => {
    const tokenService = inject(TokenService);
    const token = tokenService.getAccessToken();

    const authReq = token ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request;

    return next(authReq);

}