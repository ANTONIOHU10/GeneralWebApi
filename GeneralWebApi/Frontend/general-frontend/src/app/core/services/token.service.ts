import { Injectable } from '@angular/core';
import { decodeJwt } from '@core/utils/jwt.util';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const REMEMBERED_USERNAME_KEY = 'remembered_username';
const REMEMBER_ME_KEY = 'remember_me';
const REFRESH_TOKEN_EXPIRES_AT_KEY = 'refresh_token_expires_at';

@Injectable({ providedIn: 'root' })
export class TokenService {
  // CRUD operations for the tokens

  /**
   * Set access token with storage strategy based on rememberMe
   * @param token Access token
   * @param rememberMe If true, use localStorage (persistent), else use sessionStorage (session-only)
   */
  setAccessToken(token: string, rememberMe: boolean = false): void {
    if (rememberMe) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
      // Also clear from sessionStorage if exists
      sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    } else {
      sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
      // Also clear from localStorage if exists
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  }

  /**
   * Get access token from either localStorage or sessionStorage
   */
  getAccessToken(): string | null {
    // Check localStorage first (for rememberMe), then sessionStorage
    return localStorage.getItem(ACCESS_TOKEN_KEY) || sessionStorage.getItem(ACCESS_TOKEN_KEY);
  }

  clearAccessToken(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  }

  /**
   * Set refresh token with storage strategy based on rememberMe
   * @param token Refresh token
   * @param rememberMe If true, use localStorage (persistent), else use sessionStorage (session-only)
   */
  setRefreshToken(token: string, rememberMe: boolean = false): void {
    if (rememberMe) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
      // Also clear from sessionStorage if exists
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    } else {
      sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
      // Also clear from localStorage if exists
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }

  /**
   * Get refresh token from either localStorage or sessionStorage
   */
  getRefreshToken(): string | null {
    // Check localStorage first (for rememberMe), then sessionStorage
    return localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY);
  }

  clearRefreshToken(): void {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  clearAllTokens(): void {
    this.clearAccessToken();
    this.clearRefreshToken();
    this.clearRememberedUsername();
    this.clearRememberMe();
    this.clearRefreshTokenExpiresAt();
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

  /**
   * Save remembered username for auto-fill on next login
   */
  setRememberedUsername(username: string): void {
    localStorage.setItem(REMEMBERED_USERNAME_KEY, username);
  }

  /**
   * Get remembered username
   */
  getRememberedUsername(): string | null {
    return localStorage.getItem(REMEMBERED_USERNAME_KEY);
  }

  /**
   * Clear remembered username
   */
  clearRememberedUsername(): void {
    localStorage.removeItem(REMEMBERED_USERNAME_KEY);
  }

  /**
   * Save remember me preference
   */
  setRememberMe(rememberMe: boolean): void {
    if (rememberMe) {
      localStorage.setItem(REMEMBER_ME_KEY, 'true');
    } else {
      localStorage.removeItem(REMEMBER_ME_KEY);
    }
  }

  /**
   * Get remember me preference
   */
  getRememberMe(): boolean {
    return localStorage.getItem(REMEMBER_ME_KEY) === 'true';
  }

  /**
   * Clear remember me preference
   */
  clearRememberMe(): void {
    localStorage.removeItem(REMEMBER_ME_KEY);
  }

  /**
   * Save refresh token expiration time
   */
  setRefreshTokenExpiresAt(expiresAt: string): void {
    localStorage.setItem(REFRESH_TOKEN_EXPIRES_AT_KEY, expiresAt);
  }

  /**
   * Get refresh token expiration time
   */
  getRefreshTokenExpiresAt(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_EXPIRES_AT_KEY);
  }

  /**
   * Clear refresh token expiration time
   */
  clearRefreshTokenExpiresAt(): void {
    localStorage.removeItem(REFRESH_TOKEN_EXPIRES_AT_KEY);
  }

  /**
   * Check if refresh token is expired
   */
  isRefreshTokenExpired(): boolean {
    const expiresAt = this.getRefreshTokenExpiresAt();
    if (!expiresAt) {
      // If no expiration time stored, assume expired if no refresh token exists
      return !this.getRefreshToken();
    }

    try {
      const expirationDate = new Date(expiresAt);
      return expirationDate <= new Date();
    } catch {
      // If parsing fails, assume expired
      return true;
    }
  }
}
