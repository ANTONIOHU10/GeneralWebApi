// Path: GeneralWebApi/Frontend/general-frontend/src/app/core/services/notification-center.service.ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, forkJoin, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { 
  Notification, 
  NotificationFilter, 
  NotificationStats, 
  NotificationProvider,
  NotificationType,
  NotificationPriority,
  NotificationStatus
} from 'app/contracts/notifications/notification.model';

/**
 * Notification Center Service
 * Aggregates notifications from multiple sources and provides unified interface
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationCenterService {
  // Registered notification providers
  private providers: NotificationProvider[] = [];
  
  // Notification state
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public readonly notifications$ = this.notificationsSubject.asObservable();
  
  // Loading state
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public readonly loading$ = this.loadingSubject.asObservable();
  
  // Error state
  private errorSubject = new BehaviorSubject<string | null>(null);
  public readonly error$ = this.errorSubject.asObservable();

  /**
   * Register a notification provider
   */
  registerProvider(provider: NotificationProvider): void {
    if (!this.providers.find(p => p.getType() === provider.getType())) {
      this.providers.push(provider);
    }
  }

  /**
   * Unregister a notification provider
   */
  unregisterProvider(type: NotificationType): void {
    this.providers = this.providers.filter(p => p.getType() !== type);
  }

  /**
   * Load all notifications from registered providers
   */
  loadNotifications(): Observable<Notification[]> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    if (this.providers.length === 0) {
      this.loadingSubject.next(false);
      this.notificationsSubject.next([]);
      return of([]);
    }

    // Fetch from all providers in parallel
    const providerObservables = this.providers.map(provider =>
      this.fetchFromProvider(provider)
    );

    return combineLatest(providerObservables).pipe(
      map((results) => {
        // Flatten and merge all notifications
        const allNotifications = results.flat();
        
        // Sort by priority and creation date (urgent first, then by date)
        const sorted = this.sortNotifications(allNotifications);
        
        this.notificationsSubject.next(sorted);
        this.loadingSubject.next(false);
        return sorted;
      }),
      catchError((error) => {
        this.errorSubject.next(error.message || 'Failed to load notifications');
        this.loadingSubject.next(false);
        return of([]);
      })
    );
  }

  /**
   * Fetch notifications from a single provider
   */
  private fetchFromProvider(provider: NotificationProvider): Observable<Notification[]> {
    return new Observable<Notification[]>((subscriber) => {
      provider.getNotifications()
        .then((notifications) => {
          subscriber.next(notifications);
          subscriber.complete();
        })
        .catch((error) => {
          console.error(`Failed to fetch notifications from ${provider.getType()}:`, error);
          subscriber.next([]); // Return empty array on error, don't fail entire load
          subscriber.complete();
        });
    });
  }

  /**
   * Sort notifications by priority and date
   */
  private sortNotifications(notifications: Notification[]): Notification[] {
    const priorityOrder: Record<NotificationPriority, number> = {
      urgent: 0,
      high: 1,
      medium: 2,
      low: 3,
    };

    return [...notifications].sort((a, b) => {
      // First sort by priority
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
   * Filter notifications
   */
  filterNotifications(filter: NotificationFilter): Observable<Notification[]> {
    return this.notifications$.pipe(
      map((notifications) => {
        let filtered = [...notifications];

        // Filter by type
        if (filter.type && filter.type !== 'all') {
          filtered = filtered.filter(n => n.type === filter.type);
        }

        // Filter by status
        if (filter.status && filter.status !== 'all') {
          filtered = filtered.filter(n => n.status === filter.status);
        }

        // Filter by priority
        if (filter.priority && filter.priority !== 'all') {
          filtered = filtered.filter(n => n.priority === filter.priority);
        }

        // Filter by date range
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
   * Get notification statistics
   */
  getStats(): Observable<NotificationStats> {
    return this.notifications$.pipe(
      map((notifications) => {
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

        notifications.forEach((notification) => {
          stats.byType[notification.type]++;
          stats.byPriority[notification.priority]++;
        });

        return stats;
      })
    );
  }

  /**
   * Mark notification as read
   */
  markAsRead(notification: Notification): Observable<void> {
    // Find the provider for this notification
    const provider = this.providers.find(p => p.getType() === notification.type);
    
    if (provider && provider.markAsRead) {
      return new Observable<void>((subscriber) => {
        provider.markAsRead!(notification.id)
          .then(() => {
            // Update local state
            const notifications = this.notificationsSubject.value;
            const updated = notifications.map(n =>
              n.id === notification.id
                ? { ...n, status: 'read' as NotificationStatus, readAt: new Date().toISOString() }
                : n
            );
            this.notificationsSubject.next(updated);
            subscriber.next();
            subscriber.complete();
          })
          .catch((error) => {
            subscriber.error(error);
          });
      });
    } else {
      // If provider doesn't support markAsRead, just update local state
      const notifications = this.notificationsSubject.value;
      const updated = notifications.map(n =>
        n.id === notification.id
          ? { ...n, status: 'read' as NotificationStatus, readAt: new Date().toISOString() }
          : n
      );
      this.notificationsSubject.next(updated);
      return of(void 0);
    }
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

    // Mark all as read locally
    const updated = notifications.map(n =>
      n.status === 'unread'
        ? { ...n, status: 'read' as NotificationStatus, readAt: new Date().toISOString() }
        : n
    );
    this.notificationsSubject.next(updated);

    // Optionally notify providers (if they support batch operations)
    // For now, we'll just update local state
    return of(void 0);
  }

  /**
   * Get unread count
   */
  getUnreadCount(): Observable<number> {
    return this.notifications$.pipe(
      map((notifications) => notifications.filter(n => n.status === 'unread').length)
    );
  }

  /**
   * Delete notification (archive it)
   */
  deleteNotification(notification: Notification): Observable<void> {
    const notifications = this.notificationsSubject.value;
    const updated = notifications.filter(n => n.id !== notification.id);
    this.notificationsSubject.next(updated);
    return of(void 0);
  }

  /**
   * Clear all notifications
   */
  clearAll(): Observable<void> {
    this.notificationsSubject.next([]);
    return of(void 0);
  }
}

