// Path: GeneralWebApi/Frontend/general-frontend/src/app/core/services/notification-center.service.ts
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Subject, Observable, combineLatest, from, of, EMPTY, forkJoin } from 'rxjs';
import { 
  map, 
  catchError, 
  tap, 
  shareReplay,
  distinctUntilChanged,
  switchMap
} from 'rxjs/operators';
import { 
  Notification, 
  NotificationFilter, 
  NotificationStats, 
  NotificationProvider,
  NotificationType,
  NotificationPriority,
  NotificationStatus
} from 'app/contracts/notifications/notification.model';
import { NotificationService, BackendNotificationListDto } from './notification.service';

/**
 * Notification Center Service
 * Modern Observable-based service for managing notifications from multiple providers
 * 
 * Features:
 * - Fully reactive with RxJS Observables
 * - Clean, composable code with modern operators
 * - Type-safe and error-resilient
 * - Automatic state management
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationCenterService {
  // Registered providers
  private readonly providers = new Map<NotificationType, NotificationProvider>();
  
  // Backend notification service
  private readonly notificationService = inject(NotificationService);
  
  // State management with BehaviorSubject (reactive and Observable-compatible)
  private readonly notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  
  // Notification count refresh trigger - emits when notification status changes
  private readonly notificationCountRefreshSubject = new Subject<void>();
  public readonly notificationCountRefresh$ = this.notificationCountRefreshSubject.asObservable();

  // Public readonly observables
  public readonly notifications$ = this.notificationsSubject.asObservable().pipe(
    distinctUntilChanged(),
    shareReplay(1)
  );

  public readonly loading$ = this.loadingSubject.asObservable().pipe(
    distinctUntilChanged(),
    shareReplay(1)
  );

  public readonly error$ = this.errorSubject.asObservable().pipe(
    distinctUntilChanged(),
    shareReplay(1)
  );

  // Computed observables for derived state
  public readonly unreadCount$ = this.notifications$.pipe(
    map(notifications => notifications.filter(n => n.status === 'unread').length),
    distinctUntilChanged(),
    shareReplay(1)
  );

  public readonly stats$ = this.notifications$.pipe(
    map(notifications => this.calculateStats(notifications)),
    shareReplay(1)
  );

  /**
   * Register a notification provider
   */
  registerProvider(provider: NotificationProvider): void {
    if (!this.providers.has(provider.getType())) {
      this.providers.set(provider.getType(), provider);
    }
  }

  /**
   * Unregister a notification provider
   */
  unregisterProvider(type: NotificationType): void {
    this.providers.delete(type);
  }

  /**
   * Load all notifications from backend API
   * Uses modern RxJS operators for clean, composable code
   */
  loadNotifications(): Observable<Notification[]> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    // Load from backend API
    return this.notificationService.getNotifications({
      pageNumber: 1,
      pageSize: 100, // Load first 100 notifications
      includeExpired: false,
    }).pipe(
      map((response: { items: BackendNotificationListDto[]; totalCount: number; pageNumber: number; pageSize: number }) => {
        // Transform backend DTOs to frontend Notification models
        const notifications = response.items.map((dto: BackendNotificationListDto) => 
          this.notificationService.transformToNotification(dto)
        );
        
        // Sort notifications
        const sorted = this.sortNotifications(notifications);
        
        this.notificationsSubject.next(sorted);
        this.loadingSubject.next(false);
        // Trigger notification count refresh when notifications are loaded
        this.notificationCountRefreshSubject.next();
        return sorted;
      }),
      catchError(error => {
        this.errorSubject.next(error.message || 'Failed to load notifications');
        this.loadingSubject.next(false);
        return of([]);
      })
    );
  }

  /**
   * Fetch notifications from a single provider (for generating new notifications)
   * Converts Promise to Observable using modern RxJS
   * Note: This is kept for backward compatibility, but notifications should be loaded from backend
   */
  private fetchFromProvider(provider: NotificationProvider): Observable<Notification[]> {
    return from(provider.getNotifications()).pipe(
      catchError(error => {
        console.error(`Provider ${provider.getType()} error:`, error);
        return of([]);
      })
    );
  }

  /**
   * Sort notifications by priority, status, and date
   */
  private sortNotifications(notifications: Notification[]): Notification[] {
    const priorityOrder: Record<NotificationPriority, number> = {
      urgent: 0,
      high: 1,
      medium: 2,
      low: 3,
    };

    return [...notifications].sort((a, b) => {
      // Sort by priority first
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by unread status (unread first)
      if (a.status === 'unread' && b.status !== 'unread') return -1;
      if (a.status !== 'unread' && b.status === 'unread') return 1;
      
      // Finally by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  /**
   * Filter notifications reactively
   */
  filterNotifications(filter: NotificationFilter): Observable<Notification[]> {
    return this.notifications$.pipe(
      map(notifications => {
        let filtered = [...notifications];

        if (filter.type && filter.type !== 'all') {
          filtered = filtered.filter(n => n.type === filter.type);
        }

        if (filter.status && filter.status !== 'all') {
          filtered = filtered.filter(n => n.status === filter.status);
        }

        if (filter.priority && filter.priority !== 'all') {
          filtered = filtered.filter(n => n.priority === filter.priority);
        }

        if (filter.startDate) {
          filtered = filtered.filter(n => new Date(n.createdAt) >= new Date(filter.startDate!));
        }

        if (filter.endDate) {
          filtered = filtered.filter(n => new Date(n.createdAt) <= new Date(filter.endDate!));
        }

        return filtered;
      })
    );
  }

  /**
   * Get notification statistics (reactive)
   */
  getStats(): Observable<NotificationStats> {
    return this.stats$;
  }

  /**
   * Calculate statistics from notifications
   */
  private calculateStats(notifications: Notification[]): NotificationStats {
    const stats: NotificationStats = {
      total: notifications.length,
      unread: notifications.filter(n => n.status === 'unread').length,
      byType: {
        approval: 0,
        task: 0,
        contract: 0,
        system: 0,
        audit: 0,
        employee: 0,
      },
      byPriority: {
        urgent: 0,
        high: 0,
        medium: 0,
        low: 0,
      },
    };

    notifications.forEach(notification => {
      stats.byType[notification.type]++;
      stats.byPriority[notification.priority]++;
    });

    return stats;
  }

  /**
   * Toggle notification read status (read <-> unread)
   * Modern Observable-based implementation with optimistic updates
   */
  toggleReadStatus(notification: Notification): Observable<void> {
    const notificationId = parseInt(notification.id, 10);
    
    if (isNaN(notificationId)) {
      // If ID is not a number (e.g., "approval-123"), it's from a provider
      // Update local state only
      const newStatus = notification.status === 'read' ? 'unread' : 'read';
      this.updateNotificationStatus(notification.id, newStatus);
      // Trigger notification count refresh
      this.notificationCountRefreshSubject.next();
      return of(void 0);
    }

    // Determine new status
    const newStatus: NotificationStatus = notification.status === 'read' ? 'unread' : 'read';
    
    // Optimistic update: update local state immediately
    this.updateNotificationStatus(notification.id, newStatus);
    // Trigger notification count refresh
    this.notificationCountRefreshSubject.next();

    // Call backend API
    return this.notificationService.toggleReadStatus(notificationId).pipe(
      catchError(error => {
        // Revert on error
        this.updateNotificationStatus(notification.id, notification.status);
        // Trigger refresh again to revert the count
        this.notificationCountRefreshSubject.next();
        console.error(`Failed to toggle notification ${notification.id} read status:`, error);
        return EMPTY;
      }),
      map(() => {
        // Trigger refresh after successful API call
        this.notificationCountRefreshSubject.next();
        return void 0;
      })
    );
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): Observable<void> {
    const notifications = this.notificationsSubject.value;
    const unreadNotifications = notifications.filter(n => n.status === 'unread');
    
    if (unreadNotifications.length === 0) {
      return of(void 0);
    }

    // Update all locally (optimistic update)
    const updated = notifications.map(n =>
      n.status === 'unread'
        ? { ...n, status: 'read' as NotificationStatus, readAt: new Date().toISOString() }
        : n
    );
    this.notificationsSubject.next(updated);
    // Trigger notification count refresh
    this.notificationCountRefreshSubject.next();

    // Call backend API
    return this.notificationService.markAllAsRead().pipe(
      catchError(error => {
        // Revert on error
        this.notificationsSubject.next(notifications);
        // Trigger refresh again to revert the count
        this.notificationCountRefreshSubject.next();
        console.error('Failed to mark all notifications as read:', error);
        return EMPTY;
      }),
      map(() => {
        // Trigger refresh after successful API call
        this.notificationCountRefreshSubject.next();
        return void 0;
      })
    );
  }

  /**
   * Get unread count (reactive)
   * Can use either computed observable or backend API
   */
  getUnreadCount(): Observable<number> {
    // Option 1: Use computed from local state (faster, but may be stale)
    // return this.unreadCount$;
    
    // Option 2: Fetch from backend (always accurate)
    return this.notificationService.getUnreadCount().pipe(
      catchError(error => {
        console.error('Failed to get unread count:', error);
        // Fallback to local count
        return this.unreadCount$;
      })
    );
  }

  /**
   * Delete notification (archive it)
   */
  deleteNotification(notification: Notification): Observable<void> {
    const notificationId = parseInt(notification.id, 10);
    
    if (isNaN(notificationId)) {
      // If ID is not a number, it's from a provider - just remove locally
      const notifications = this.notificationsSubject.value;
      const updated = notifications.filter(n => n.id !== notification.id);
      this.notificationsSubject.next(updated);
      // Trigger notification count refresh
      this.notificationCountRefreshSubject.next();
      return of(void 0);
    }

    // Optimistic update: remove from local state immediately
    const notifications = this.notificationsSubject.value;
    const updated = notifications.filter(n => n.id !== notification.id);
    this.notificationsSubject.next(updated);
    // Trigger notification count refresh
    this.notificationCountRefreshSubject.next();

    // Call backend API
    return this.notificationService.deleteNotification(notificationId).pipe(
      catchError(error => {
        // Revert on error
        this.notificationsSubject.next(notifications);
        // Trigger refresh again to revert the count
        this.notificationCountRefreshSubject.next();
        console.error(`Failed to delete notification ${notification.id}:`, error);
        return EMPTY;
      }),
      map(() => {
        // Trigger refresh after successful API call
        this.notificationCountRefreshSubject.next();
        return void 0;
      })
    );
  }

  /**
   * Clear all notifications
   */
  clearAll(): Observable<void> {
    this.notificationsSubject.next([]);
    return of(void 0);
  }

  /**
   * Helper: Update notification status
   */
  private updateNotificationStatus(notificationId: string, status: NotificationStatus): void {
    const notifications = this.notificationsSubject.value;
    const updated = notifications.map(n =>
      n.id === notificationId
        ? { 
            ...n, 
            status, 
            readAt: status === 'read' ? new Date().toISOString() : (status === 'unread' ? undefined : n.readAt)
          }
        : n
    );
    this.notificationsSubject.next(updated);
  }

  /**
   * Get current notifications (synchronous access)
   */
  getNotifications(): Notification[] {
    return this.notificationsSubject.value;
  }

  /**
   * Get loading state (synchronous access)
   */
  isLoading(): boolean {
    return this.loadingSubject.value;
  }

  /**
   * Get error state (synchronous access)
   */
  getError(): string | null {
    return this.errorSubject.value;
  }
}
