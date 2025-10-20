import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

export const roleGuard = (required: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const roles = authService.getRolesFromToken();
    return required.some(role => roles.includes(role));
  };
};
