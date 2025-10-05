import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { TokenService } from "@core/services/token.service";

export const authGuard: CanActivateFn = () => {
    const token = inject(TokenService);
    const router = inject(Router);

    if(token.isAuthenticated()) {
        return true;
    }

    router.navigate(['/login']);
    return false;
    
}