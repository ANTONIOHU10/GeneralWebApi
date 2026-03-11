// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/notifications/notification-center/notification-center.component.ts
import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, interval, EMPTY } from 'rxjs';
import { takeUntil, catchError, startWith, switchMap, filter, distinctUntilChanged } from 'rxjs/operators';
import {
  BadgeVariant,
  BaseCardComponent,
  BaseBadgeComponent,
  BaseButtonComponent,
  BaseEmptyComponent,
  BaseLoadingComponent,
  BaseErrorComponent,
  BasePrivatePageContainerComponent,
  BaseFilterContainerComponent,
  type BaseFilterField,
  SelectOption,
} from '../../../Shared/components/base';
import { NotificationService } from '../../../Shared/services';
import { NotificationCenterService } from '../../../core/services/notification-center.service';
import { TranslationService } from '@core/services/translation.service';
import { TokenService } from '@core/services/token.service';
import { TranslatePipe } from '@core/pipes/translate.pipe';
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
    BasePrivatePageContainerComponent,
    BaseCardComponent,
    BaseBadgeComponent,
    BaseButtonComponent,
    BaseEmptyComponent,
    BaseLoadingComponent,
    BaseErrorComponent,
    BaseFilterContainerComponent,
    TranslatePipe,
  ],
  templateUrl: './notification-center.component.html',
  styleUrls: ['./notification-center.component.scss'],
})
export class NotificationCenterComponent implements OnInit, OnDestroy {
  private notificationCenterService = inject(NotificationCenterService);
  private notificationService = inject(NotificationService);
  private translationService = inject(TranslationService);
  private tokenService = inject(TokenService);
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

  // Filter options for select components - will be initialized in ngOnInit
  typeFilterOptions: SelectOption[] = [];
  statusFilterOptions: SelectOption[] = [];
  priorityFilterOptions: SelectOption[] = [];

  // Base filter container - configuration-driven
  notificationFilterFields: BaseFilterField[] = [];
  notificationFilterValue: Record<string, unknown> = { type: 'all', status: 'all', priority: 'all' };

  // Computed values
  filteredNotifications = computed(() => {
    const all = this.notifications();
    const filter = this.activeFilter();
    let filtered = [...all];

    // Apply type filter
    if (filter.type && filter.type !== 'all') {
      filtered = filtered.filter(n => n.type === filter.type);
    }

    // Apply status filter
    if (filter.status && filter.status !== 'all') {
      filtered = filtered.filter(n => n.status === filter.status);
    }

    // Apply priority filter
    if (filter.priority && filter.priority !== 'all') {
      filtered = filtered.filter(n => n.priority === filter.priority);
    }

    return filtered;
  });

  // Check if any filters are active
  hasActiveFilters = computed(() => {
    const filter = this.activeFilter();
    return (
      (filter.type && filter.type !== 'all') ||
      (filter.status && filter.status !== 'all') ||
      (filter.priority && filter.priority !== 'all')
    );
  });

  unreadCount = computed(() => this.stats()?.unread || 0);
  totalCount = computed(() => this.stats()?.total || 0);

  ngOnInit(): void {
    // Wait for translations to load before initializing filter options
    this.translationService.getTranslationsLoaded$().pipe(
      distinctUntilChanged(),
      filter(loaded => loaded),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.initializeFilterOptions();
    });

    // Register notification providers
    this.registerProviders();
    
    // Load notifications
    this.loadNotifications();
    
    // Auto-refresh every 30 seconds
    // Only refresh if user is authenticated
    interval(30000)
      .pipe(
        takeUntil(this.destroy$),
        startWith(0),
        filter(() => this.tokenService.isAuthenticated() && !this.tokenService.isExpired())
      )
      .subscribe(() => {
        this.loadNotifications();
      });
  }

  /**
   * Initialize filter options with translations
   */
  private initializeFilterOptions(): void {
    this.typeFilterOptions = [
      { value: 'all', label: this.translationService.translate('notifications.filters.allTypes') },
      { value: 'approval', label: this.translationService.translate('notifications.types.approval') },
      { value: 'task', label: this.translationService.translate('notifications.types.task') },
      { value: 'contract', label: this.translationService.translate('notifications.types.contract') },
      { value: 'system', label: this.translationService.translate('notifications.types.system') },
      { value: 'audit', label: this.translationService.translate('notifications.types.audit') },
      { value: 'employee', label: this.translationService.translate('notifications.types.employee') },
    ];

    this.statusFilterOptions = [
      { value: 'all', label: this.translationService.translate('notifications.filters.allStatus') },
      { value: 'unread', label: this.translationService.translate('notifications.unread') },
      { value: 'read', label: this.translationService.translate('notifications.read') },
      { value: 'archived', label: this.translationService.translate('notifications.archived') },
    ];

    this.priorityFilterOptions = [
      { value: 'all', label: this.translationService.translate('notifications.filters.allPriorities') },
      { value: 'urgent', label: this.translationService.translate('notifications.priorities.urgent') },
      { value: 'high', label: this.translationService.translate('notifications.priorities.high') },
      { value: 'medium', label: this.translationService.translate('notifications.priorities.medium') },
      { value: 'low', label: this.translationService.translate('notifications.priorities.low') },
    ];

    // Build base filter container fields from select options
    this.notificationFilterFields = [
      {
        key: 'type',
        type: 'select',
        label: this.translationService.translate('notifications.filters.type'),
        options: this.typeFilterOptions.map(o => ({ value: String(o.value), label: o.label })),
      },
      {
        key: 'status',
        type: 'select',
        label: this.translationService.translate('notifications.filters.status'),
        options: this.statusFilterOptions.map(o => ({ value: String(o.value), label: o.label })),
      },
      {
        key: 'priority',
        type: 'select',
        label: this.translationService.translate('notifications.filters.priority'),
        options: this.priorityFilterOptions.map(o => ({ value: String(o.value), label: o.label })),
      },
    ];
    this.notificationFilterValue = {
      type: this.activeFilter().type || 'all',
      status: this.activeFilter().status || 'all',
      priority: this.activeFilter().priority || 'all',
    };
  }

  /**
   * Handle filter change from base filter container
   */
  onNotificationFilterChange(value: Record<string, unknown>): void {
    const type = (value['type'] as string) || 'all';
    const status = (value['status'] as string) || 'all';
    const priority = (value['priority'] as string) || 'all';
    this.notificationFilterValue = { type, status, priority };
    this.activeFilter.set({
      type: type as NotificationType,
      status: status as NotificationStatus,
      priority: priority as NotificationPriority,
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
   * Only loads if user is authenticated
   */
  loadNotifications(): void {
    // Don't load notifications if user is not authenticated
    if (!this.tokenService.isAuthenticated() || this.tokenService.isExpired()) {
      this.notifications.set([]);
      this.notificationsData$.next([]);
      this.loading$.next(false);
      this.error$.next(null);
      return;
    }

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
   * Navigate to notification detail page
   */
  onNotificationClick(notification: Notification): void {
    // Navigate to notification detail page
    this.router.navigate(['/private/notifications', notification.id]);
  }

  /**
   * Toggle notification read status (read <-> unread)
   */
  toggleReadStatus(notification: Notification, event?: Event): void {
    // Prevent event bubbling to avoid triggering onNotificationClick
    if (event) {
      event.stopPropagation();
    }
    // Save current state for potential rollback
    const currentNotifications = this.notifications();
    const currentStats = this.stats();
    const newStatus: NotificationStatus = notification.status === 'read' ? 'unread' : 'read';
    
    // Optimistically update UI immediately for better UX
    const updatedNotifications = currentNotifications.map(n => 
      n.id === notification.id 
        ? { 
            ...n, 
            status: newStatus,
            readAt: newStatus === 'read' ? new Date().toISOString() : undefined
          }
        : n
    );
    this.notifications.set(updatedNotifications);
    
    // Update stats optimistically
    if (currentStats) {
      const updatedStats = { ...currentStats };
      if (newStatus === 'read') {
        updatedStats.unread = Math.max(0, updatedStats.unread - 1);
      } else {
        updatedStats.unread = updatedStats.unread + 1;
      }
      this.stats.set(updatedStats);
    }
    
    // Call backend API - service also performs optimistic update
    // Keep the optimistic update in component, don't override it after success
    // Only reload stats to ensure consistency with backend
    this.notificationCenterService.toggleReadStatus(notification).pipe(
      takeUntil(this.destroy$),
      catchError((error) => {
        // Revert optimistic update on error
        this.notifications.set(currentNotifications);
        if (currentStats) {
          this.stats.set(currentStats);
        }
        this.notificationService.error('Error', 'Failed to toggle notification read status', { duration: 3000 });
        return EMPTY;
      })
    ).subscribe({
      next: () => {
        // API call successful - optimistic update is already applied
        // Only reload stats to ensure consistency with backend
        // Don't reload notifications to avoid overriding the optimistic update
        this.loadStats();
      }
    });
  }

  /**
   * Handle action button click
   * Removed navigation functionality - no longer navigates to routes
   */
  onActionClick(notification: Notification, event?: Event): void {
    // Prevent event bubbling to avoid triggering onNotificationClick
    if (event) {
      event.stopPropagation();
    }
    // Navigation functionality removed
    // Action button no longer navigates anywhere
  }

  /**
   * Mark all as read
   */
  markAllAsRead(): void {
    this.notificationCenterService.markAllAsRead().pipe(
      takeUntil(this.destroy$),
      catchError((error) => {
        this.notificationService.error('Error', 'Failed to mark all as read', { duration: 3000 });
        return EMPTY;
      })
    ).subscribe({
      next: () => {
        // Reload notifications to get updated status from backend
        this.loadNotifications();
        this.loadStats();
      }
    });
  }

  /**
   * Delete notification
   */
  deleteNotification(notification: Notification, event?: Event): void {
    // Prevent event bubbling to avoid triggering onNotificationClick
    if (event) {
      event.stopPropagation();
    }
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
   * Clear all filters
   */
  clearFilters(): void {
    this.activeFilter.set({
      type: 'all',
      status: 'all',
      priority: 'all',
    });
    this.notificationFilterValue = { type: 'all', status: 'all', priority: 'all' };
  }

  /**
   * Get notification card CSS class
   */
  getNotificationCardClass(notification: Notification): string {
    const classes = ['notification-card'];
    if (notification.status === 'unread') {
      classes.push('unread');
    } else if (notification.status === 'read') {
      classes.push('read');
    }
    if (notification.priority === 'urgent' || notification.priority === 'high') {
      classes.push('priority-high');
    }
    return classes.join(' ');
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

  /**
   * Format read time for display
   */
  formatReadTime(readAt: string | null | undefined): string {
    if (!readAt) return '';
    const date = new Date(readAt);
    return date.toLocaleString();
  }

  /**
   * Get empty state config
   */
  getEmptyStateConfig(): any {
    return {
      type: 'data',
      size: 'md',
      showIcon: true,
      showActionButton: this.hasActiveFilters(),
      actionButtonText: this.translationService.translate('notifications.clearFilters'),
      centered: true,
      fullHeight: false
    };
  }
}
