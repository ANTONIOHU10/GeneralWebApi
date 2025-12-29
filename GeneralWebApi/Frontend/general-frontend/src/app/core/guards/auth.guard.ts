import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '@core/services/token.service';
import { AuthService } from '@core/services/auth.service';
import { firstValueFrom } from 'rxjs';

export const authGuard: CanActivateFn = async () => {
  const token = inject(TokenService);
  const router = inject(Router);
  const auth = inject(AuthService);

  console.log('🔒 AuthGuard: Checking authentication...');
  console.log('🔒 Token exists:', !!token.getAccessToken());
  console.log('🔒 Token expired:', token.isExpired());
  console.log('🔒 Current URL:', window.location.href);

  // If no token at all, redirect to login
  if (!token.isAuthenticated()) {
    console.log('🔒 AuthGuard: No token found, redirecting to login');
    router.navigate(['/login']).then(success => {
      console.log('🔒 AuthGuard redirect result:', success);
    });
    return false;
  }

  // If token is expired, try to refresh it
  if (token.isExpired()) {
    console.log('🔒 AuthGuard: Token expired, attempting to refresh...');
    const refreshToken = token.getRefreshToken();

    if (refreshToken) {
      try {
        const refreshData = await firstValueFrom(
          auth.refreshToken({ refreshToken })
        );
        console.log('🔒 AuthGuard: Token refreshed successfully');
        return true;
      } catch (error) {
        console.error('🔒 AuthGuard: Token refresh failed', error);
        // Clear all tokens and redirect to login
        token.clearAllTokens();
        router.navigate(['/login']).then(success => {
          console.log('🔒 AuthGuard redirect result:', success);
        });
        return false;
      }
    } else {
      console.log('🔒 AuthGuard: No refresh token, redirecting to login');
      token.clearAllTokens();
      router.navigate(['/login']).then(success => {
        console.log('🔒 AuthGuard redirect result:', success);
      });
      return false;
    }
  }

  console.log('🔒 AuthGuard: Authenticated, allowing access');
  return true;
};
