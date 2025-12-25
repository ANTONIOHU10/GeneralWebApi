// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/header/header.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { TokenService } from '@core/services/token.service';
import { NotificationService } from '@core/services/notification.service';
import { catchError, of, interval, Subject } from 'rxjs';
import { takeUntil, startWith, switchMap } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [CommonModule, RouterLink],
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() isDarkMode = false;
  @Input() showSidebarToggle = false;
  @Input() brandTitle = 'GeneralWebApi';
  @Input() showLoginButton = false;

  @Output() themeToggle = new EventEmitter<void>();
  @Output() sidebarToggle = new EventEmitter<void>();
  @Output() notificationClick = new EventEmitter<void>();
  @Output() profileClick = new EventEmitter<void>();
  @Output() settingsClick = new EventEmitter<void>();

  private authService = inject(AuthService);
  private tokenService = inject(TokenService);
  private notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();

  notificationCount = 0;
  userProfile = {
    name: 'Guest',
    role: 'User',
  };

  /**
   * Handle theme toggle button click
   */
  onThemeToggle(): void {
    this.themeToggle.emit();
  }

  /**
   * Handle sidebar toggle button click
   */
  onSidebarToggle(): void {
    this.sidebarToggle.emit();
  }

  /**
   * Handle notification button click
   */
  onNotificationClick(): void {
    this.notificationClick.emit();
  }

  /**
   * Handle profile button click
   */
  onProfileClick(): void {
    this.profileClick.emit();
  }

  /**
   * Handle settings button click
   */
  onSettingsClick(): void {
    this.settingsClick.emit();
  }

  /**
   * Initialize user profile from token and load notification count
   */
  ngOnInit(): void {
    this.loadUserProfile();
    this.loadNotificationCount();
    this.startNotificationCountPolling();
  }

  /**
   * Cleanup subscriptions
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load notification count from backend
   * Public method to allow external refresh
   */
  loadNotificationCount(): void {
    this.notificationService.getUnreadCount().pipe(
      takeUntil(this.destroy$),
      catchError((error) => {
        console.error('Failed to load notification count:', error);
        return of(0);
      })
    ).subscribe({
      next: (count) => {
        this.notificationCount = count;
      }
    });
  }

  /**
   * Start polling for notification count updates (every 30 seconds)
   */
  private startNotificationCountPolling(): void {
    interval(30000).pipe(
      startWith(0),
      switchMap(() => this.notificationService.getUnreadCount()),
      takeUntil(this.destroy$),
      catchError((error) => {
        console.error('Failed to poll notification count:', error);
        return of(0);
      })
    ).subscribe({
      next: (count) => {
        this.notificationCount = count;
      }
    });
  }

  /**
   * Load user profile from API or JWT token
   */
  private loadUserProfile(): void {
    // Try to get user info from API first
    this.authService.getCurrentUser().pipe(
      catchError(() => {
        // If API call fails, fallback to token
        return of(null);
      })
    ).subscribe({
      next: (userInfo) => {
        if (userInfo) {
          // Use API response
          this.userProfile.name = userInfo.username || userInfo.email || 'User';
          this.userProfile.role = userInfo.roles && userInfo.roles.length > 0
            ? this.formatRole(userInfo.roles[0])
            : 'User';
        } else {
          // Fallback to token
          this.loadUserProfileFromToken();
        }
      },
      error: () => {
        // If API call fails, fallback to token
        this.loadUserProfileFromToken();
      }
    });
  }

  /**
   * Load user profile from JWT token (fallback)
   */
  private loadUserProfileFromToken(): void {
    const userFromToken = this.authService.getUserFromToken();
    const roles = this.authService.getRolesFromToken();

    if (userFromToken) {
      // Use username as display name, or email if username not available
      this.userProfile.name = userFromToken.username || userFromToken.email || 'User';
      
      // Get the first role, or default to 'User'
      this.userProfile.role = roles.length > 0 
        ? this.formatRole(roles[0])
        : 'User';
    } else {
      // Fallback if no token or token invalid
      this.userProfile.name = 'Guest';
      this.userProfile.role = 'User';
    }
  }

  /**
   * Format role name for display
   */
  private formatRole(role: string): string {
    if (!role) return 'User';
    // Convert "Admin" -> "Administrator", "User" -> "User", etc.
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  }
}
