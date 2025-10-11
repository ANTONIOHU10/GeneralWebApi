import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '@core/services/token.service';

export const authGuard: CanActivateFn = () => {
  const token = inject(TokenService);
  const router = inject(Router);

  console.log('🔒 AuthGuard: Checking authentication...');
  console.log('🔒 Token exists:', !!token.getAccessToken());
  console.log('🔒 Token expired:', token.isExpired());
  console.log('🔒 Current URL:', window.location.href);

  if (!token.isAuthenticated() || token.isExpired()) {
    console.log('🔒 AuthGuard: Not authenticated, redirecting to login');
    router.navigate(['/login']).then(success => {
      console.log('🔒 AuthGuard redirect result:', success);
    });
    return false;
  }

  console.log('🔒 AuthGuard: Authenticated, allowing access');
  return true;
};
