import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter, firstValueFrom } from 'rxjs';
import { NotificationContainerComponent } from './Shared/components/notification-container/notification-container.component';
import { DialogContainerComponent } from './Shared/components/dialog-container/dialog-container.component';
import { TokenService } from './core/services/token.service';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NotificationContainerComponent, DialogContainerComponent],
  template: `
    <!--<h1>Welcome to {{ title }}!</h1>-->

    <router-outlet />

    <!-- Global notification container -->
    <app-notification-container></app-notification-container>

    <!-- Global dialog container -->
    <app-dialog-container></app-dialog-container>
  `,
  styles: [],
})
export class AppComponent implements OnInit {
  title = 'general-frontend';
  private tokenService = inject(TokenService);
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    // Attempt auto-login on app startup
    this.attemptAutoLogin();

    // Listen to navigation events to handle token refresh on route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        // Check if token needs refresh on route navigation
        if (this.tokenService.isAuthenticated() && this.tokenService.isExpired()) {
          this.attemptTokenRefresh();
        }
      });
  }

  /**
   * Attempt automatic login using refresh token if available
   * Note: Auto-login on login page is handled by LoginComponent
   */
  private async attemptAutoLogin(): Promise<void> {
    // Skip auto-login if we're on the login page (handled by LoginComponent)
    if (window.location.pathname === '/login' || window.location.pathname.startsWith('/login')) {
      return;
    }

    const refreshToken = this.tokenService.getRefreshToken();
    const accessToken = this.tokenService.getAccessToken();

    // If we have a refresh token but no valid access token, try to refresh
    if (refreshToken && (!accessToken || this.tokenService.isExpired())) {
      console.log('🔄 AppComponent: Attempting auto-login with refresh token...');
      try {
        await firstValueFrom(
          this.authService.refreshToken({ refreshToken })
        );
        console.log('✅ AppComponent: Auto-login successful');
      } catch (error) {
        console.error('❌ AppComponent: Auto-login failed', error);
        // Clear tokens if refresh fails
        this.tokenService.clearAllTokens();
        // Only redirect to login if we're trying to access a protected route
        if (window.location.pathname.startsWith('/private')) {
          this.router.navigate(['/login']);
        }
      }
    }
  }

  /**
   * Attempt to refresh the access token
   */
  private async attemptTokenRefresh(): Promise<void> {
    const refreshToken = this.tokenService.getRefreshToken();
    if (refreshToken) {
      try {
        await firstValueFrom(
          this.authService.refreshToken({ refreshToken })
        );
        console.log('✅ AppComponent: Token refreshed successfully');
      } catch (error) {
        console.error('❌ AppComponent: Token refresh failed', error);
        this.tokenService.clearAllTokens();
        if (window.location.pathname.startsWith('/private')) {
          this.router.navigate(['/login']);
        }
      }
    }
  }
}
