import { Injectable } from '@angular/core';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';


@Injectable({ providedIn: 'root' })
export class TokenService {

    // CRUD operations for the tokens

    setAccessToken(token: string) {
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
    }

    getAccessToken(): string | null {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    }

    clearAccessToken() {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
    }

    setRefreshToken(token: string) {
        localStorage.setItem(REFRESH_TOKEN_KEY, token);
    }

    getRefreshToken() {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    }

    clearRefreshToken() {
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    }

    clearAllTokens() {
        this.clearAccessToken();
        this.clearRefreshToken();
    }

    isAuthenticated(): boolean {
        return !!this.getAccessToken();
    }
}