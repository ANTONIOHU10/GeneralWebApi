import { Injectable } from '@angular/core';
import { decodeJwt } from '@core/utils/jwt.util';

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

  isExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;
    try {
      const payload = decodeJwt(token);
      return payload?.exp ? Date.now() / 1000 >= payload.exp : true;
    } catch {
      return true;
    }
  }
}
