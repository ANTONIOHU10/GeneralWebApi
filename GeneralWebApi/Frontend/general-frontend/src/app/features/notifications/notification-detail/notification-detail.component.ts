// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/notifications/notification-detail/notification-detail.component.ts
import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, EMPTY } from 'rxjs';
import { takeUntil, catchError, switchMap } from 'rxjs/operators';
import {
  BasePrivatePageContainerComponent,
  BaseCardComponent,
  BaseBadgeComponent,
  BaseButtonComponent,
  BaseLoadingComponent,
  BaseErrorComponent,
  BadgeVariant,
} from '../../../Shared/components/base';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationCenterService } from '../../../core/services/notification-center.service';
import { TranslationService } from '@core/services/translation.service';
import { TranslatePipe } from '@core/pipes/translate.pipe';
import { Notification, NotificationType, NotificationPriority } from 'app/contracts/notifications/notification.model';

@Component({
  selector: 'app-notification-detail',
  standalone: true,
  imports: [
    CommonModule,
    BasePrivatePageContainerComponent,
    BaseCardComponent,
    BaseBadgeComponent,
    BaseButtonComponent,
    BaseLoadingComponent,
    BaseErrorComponent,
    TranslatePipe,
  ],
  templateUrl: './notification-detail.component.html',
  styleUrls: ['./notification-detail.component.scss'],
})
export class NotificationDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private notificationCenterService = inject(NotificationCenterService);
  private translationService = inject(TranslationService);
  private destroy$ = new Subject<void>();

  // Notification state
  notification = signal<Notification | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    // Get notification ID from route params
    this.route.params.pipe(
      switchMap(params => {
        const id = params['id'];
        if (!id) {
          this.error.set('Notification ID is required');
          this.loading.set(false);
          return EMPTY;
        }

        // Convert string ID to number for API call
        const notificationId = parseInt(id, 10);
        if (isNaN(notificationId)) {
          this.error.set('Invalid notification ID');
          this.loading.set(false);
          return EMPTY;
        }

        // Load notification by ID
        this.loading.set(true);
        this.error.set(null);
        
        return this.notificationService.getNotificationById(notificationId).pipe(
          catchError((error) => {
            this.error.set(error.message || 'Failed to load notification');
            this.loading.set(false);
            return EMPTY;
          })
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (backendNotification) => {
        // Transform backend DTO to frontend Notification model
        const notification = this.notificationService.transformToNotification(backendNotification);
        this.notification.set(notification);
        this.loading.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Get priority variant for badge
   */
  getPriorityVariant(priority: NotificationPriority): BadgeVariant {
    switch (priority) {
      case 'urgent':
        return 'danger';
      case 'high':
        return 'warning';
      case 'medium':
        return 'primary';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  /**
   * Get type icon
   */
  getTypeIcon(type: NotificationType): string {
    const icons: Record<NotificationType, string> = {
      approval: 'check_circle',
      task: 'task_alt',
      contract: 'description',
      system: 'settings',
      audit: 'security',
      employee: 'person',
    };
    return icons[type] || 'notifications';
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  /**
   * Get time ago string
   */
  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  /**
   * Toggle notification read status
   */
  toggleReadStatus(): void {
    const notification = this.notification();
    if (!notification) return;

    const notificationId = parseInt(notification.id, 10);
    if (isNaN(notificationId)) return;

    // Optimistically update UI
    const currentNotification = notification;
    const newStatus = notification.status === 'read' ? 'unread' : 'read';
    
    this.notification.set({
      ...currentNotification,
      status: newStatus,
      readAt: newStatus === 'read' ? new Date().toISOString() : undefined
    });

    // Call API
    this.notificationCenterService.toggleReadStatus(notification).pipe(
      takeUntil(this.destroy$),
      catchError((error) => {
        // Revert on error
        this.notification.set(currentNotification);
        return EMPTY;
      })
    ).subscribe();
  }

  /**
   * Delete notification
   */
  deleteNotification(): void {
    const notification = this.notification();
    if (!notification) return;

    this.notificationCenterService.deleteNotification(notification).pipe(
      takeUntil(this.destroy$),
      catchError((error) => {
        return EMPTY;
      })
    ).subscribe({
      next: () => {
        // Navigate back to notification center after deletion
        this.router.navigate(['/private/notifications']);
      }
    });
  }

  /**
   * Navigate back to notification center
   */
  goBack(): void {
    this.router.navigate(['/private/notifications']);
  }

  /**
   * Retry load
   */
  onRetryLoad(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      const notificationId = parseInt(id, 10);
      if (!isNaN(notificationId)) {
        this.loading.set(true);
        this.error.set(null);
        
        this.notificationService.getNotificationById(notificationId).pipe(
          takeUntil(this.destroy$),
          catchError((error) => {
            this.error.set(error.message || 'Failed to load notification');
            this.loading.set(false);
            return EMPTY;
          })
        ).subscribe({
          next: (backendNotification) => {
            const notification = this.notificationService.transformToNotification(backendNotification);
            this.notification.set(notification);
            this.loading.set(false);
          }
        });
      }
    }
  }
}




