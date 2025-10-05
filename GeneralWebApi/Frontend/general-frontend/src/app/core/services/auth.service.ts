import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { TokenService } from "./token.service";
// which improt? test or prod?
import { environment } from "@environments/environment";
import { map, tap } from "rxjs";

interface LoginReq {
    username: string;
    password: string;
}

interface LoginRes {
    acessToken: string;
    refreshToken: string;
    roles?: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private http = inject(HttpClient);
    private token = inject(TokenService);
    private base = environment.apiUrl;


    login(payload: LoginReq) {
        return this.http.post<LoginRes>(`${this.base}/auth/login`, payload).pipe(
            tap(res => {
                this.token.setAccessToken(res.acessToken);
                if (res.refreshToken) {
                    this.token.setRefreshToken(res.refreshToken);
                }
            }),
            map(res => ({ roles: res.roles ?? []} ))
        )
    }

    logout () {
        this. token.clearAllTokens();
    }

}