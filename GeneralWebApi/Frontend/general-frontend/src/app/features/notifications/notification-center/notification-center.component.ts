// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/notifications/notification-center/notification-center.component.ts
import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, interval } from 'rxjs';
import { takeUntil, catchError, startWith, switchMap } from 'rxjs/operators';
import {
  BadgeVariant,
} from '../../../Shared/components/base';
import { NotificationService } from '../../../Shared/services';
import { NotificationCenterService } from '../../../core/services/notification-center.service';
import { ApprovalNotificationProvider } from '../../../core/services/notification-providers/approval-notification.provider';
import { TaskNotificationProvider } from '../../../core/services/notification-providers/task-notification.provider';
import { ContractNotificationProvider } from '../../../core/services/notification-providers/contract-notification.provider';
import {
  Notification,
  NotificationFilter,
  NotificationStats,
  NotificationType,
  NotificationPriority,
  NotificationStatus,
} from 'app/contracts/notifications/notification.model';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './notification-center.component.html',
  styleUrls: ['./notification-center.component.scss'],
})
export class NotificationCenterComponent implements OnInit, OnDestroy {
  private notificationCenterService = inject(NotificationCenterService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private approvalProvider = inject(ApprovalNotificationProvider);
  private taskProvider = inject(TaskNotificationProvider);
  private contractProvider = inject(ContractNotificationProvider);
  private destroy$ = new Subject<void>();

  // Notification state
  notifications = signal<Notification[]>([]);
  loading$ = new BehaviorSubject<boolean>(false);
  error$ = new BehaviorSubject<string | null>(null);
  notificationsData$ = new BehaviorSubject<Notification[] | null>(null);

  // Filter state
  activeFilter = signal<NotificationFilter>({
    type: 'all',
    status: 'all',
    priority: 'all',
  });

  // Statistics
  stats = signal<NotificationStats | null>(null);

  // Filter options
  typeOptions: (NotificationType | 'all')[] = ['all', 'approval', 'task', 'contract', 'system', 'audit', 'employee'];
  statusOptions: (NotificationStatus | 'all')[] = ['all', 'unread', 'read', 'archived'];
  priorityOptions: (NotificationPriority | 'all')[] = ['all', 'urgent', 'high', 'medium', 'low'];

  // Computed values
  filteredNotifications = computed(() => {
    const all = this.notifications();
    const filter = this.activeFilter();
    let filtered = [...all];

    if (filter.type && filter.type !== 'all') {
      filtered = filtered.filter(n => n.type === filter.type);
    }
    if (filter.status && filter.status !== 'all') {
      filtered = filtered.filter(n => n.status === filter.status);
    }
    if (filter.priority && filter.priority !== 'all') {
      filtered = filtered.filter(n => n.priority === filter.priority);
    }

    return filtered;
  });

  unreadCount = computed(() => this.stats()?.unread || 0);
  totalCount = computed(() => this.stats()?.total || 0);

  ngOnInit(): void {
    // Register notification providers
    this.registerProviders();
    
    // Load notifications
    this.loadNotifications();
    
    // Auto-refresh every 30 seconds
    interval(30000)
      .pipe(
        takeUntil(this.destroy$),
        startWith(0)
      )
      .subscribe(() => {
        this.loadNotifications();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Register all notification providers
   */
  private registerProviders(): void {
    // Register approval notifications
    this.notificationCenterService.registerProvider(this.approvalProvider);

    // Register task notifications
    this.notificationCenterService.registerProvider(this.taskProvider);

    // Register contract notifications
    this.notificationCenterService.registerProvider(this.contractProvider);

    // Future providers can be registered here:
    // - SystemNotificationProvider
    // - AuditNotificationProvider
    // - EmployeeNotificationProvider
  }

  /**
   * Load notifications from all providers
   */
  loadNotifications(): void {
    this.loading$.next(true);
    this.error$.next(null);

    this.notificationCenterService.loadNotifications().pipe(
      takeUntil(this.destroy$),
      catchError((error) => {
        this.error$.next(error.message || 'Failed to load notifications');
        this.loading$.next(false);
        return [];
      })
    ).subscribe({
      next: (notifications) => {
        this.notifications.set(notifications);
        this.notificationsData$.next(notifications);
        this.loading$.next(false);
        this.loadStats();
      }
    });
  }

  /**
   * Load notification statistics
   */
  private loadStats(): void {
    this.notificationCenterService.getStats().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (stats) => {
        this.stats.set(stats);
      }
    });
  }

  /**
   * Handle notification click
   */
  onNotificationClick(notification: Notification): void {
    // Mark as read
    this.markAsRead(notification);

    // Navigate to action URL if available
    if (notification.actionUrl) {
      this.router.navigate([notification.actionUrl]);
    }
  }

  /**
   * Mark notification as read
   */
  markAsRead(notification: Notification): void {
    this.notificationCenterService.markAsRead(notification).pipe(
      takeUntil(this.destroy$),
      catchError((error) => {
        this.notificationService.error('Error', 'Failed to mark notification as read', { duration: 3000 });
        return [];
      })
    ).subscribe({
      next: () => {
        // Update local state
        const updated = this.notifications().map(n =>
          n.id === notification.id
            ? { ...n, status: 'read' as NotificationStatus, readAt: new Date().toISOString() }
            : n
        );
        this.notifications.set(updated);
        this.notificationsData$.next(updated);
        this.loadStats();
      }
    });
  }

  /**
   * Mark all as read
   */
  markAllAsRead(): void {
    this.notificationCenterService.markAllAsRead().pipe(
      takeUntil(this.destroy$),
      catchError((error) => {
        this.notificationService.error('Error', 'Failed to mark all as read', { duration: 3000 });
        return [];
      })
    ).subscribe({
      next: () => {
        this.loadNotifications();
      }
    });
  }

  /**
   * Delete notification
   */
  deleteNotification(notification: Notification): void {
    this.notificationCenterService.deleteNotification(notification).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        const updated = this.notifications().filter(n => n.id !== notification.id);
        this.notifications.set(updated);
        this.notificationsData$.next(updated);
        this.loadStats();
      }
    });
  }

  /**
   * Update filter
   */
  onFilterChange(filter: Partial<NotificationFilter>): void {
    this.activeFilter.set({
      ...this.activeFilter(),
      ...filter,
    });
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
   * Format time ago
   */
  getTimeAgo(date: string): string {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return then.toLocaleDateString();
  }

  /**
   * Retry load
   */
  onRetryLoad = (): void => {
    this.loadNotifications();
  };
}
