import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface NotificationConfig {
  id?: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  closable?: boolean;
  persistent?: boolean;
  actions?: NotificationAction[];
  priority?: 'low' | 'normal' | 'high' | 'critical';
  clickable?: boolean;
  dismissible?: boolean;
  autoClose?: boolean;
  maxWidth?: string;
  customClass?: string;
  icon?: string;
}

export interface NotificationAction {
  id: string;
  label: string;
  action: () => void | Promise<void>;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  icon?: string;
  disabled?: boolean;
}

export interface NotificationData extends NotificationConfig {
  id: string;
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<NotificationData[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private notificationId = 0;

  // Predefined notification configurations
  private readonly defaultConfigs = {
    success: {
      duration: 3000,
      closable: true,
      autoClose: true,
      priority: 'normal' as const,
    },
    error: {
      duration: 5000,
      closable: true,
      autoClose: true,
      priority: 'high' as const,
    },
    warning: {
      duration: 4000,
      closable: true,
      autoClose: true,
      priority: 'normal' as const,
    },
    info: {
      duration: 3000,
      closable: true,
      autoClose: true,
      priority: 'normal' as const,
    },
  };

  // Quick methods for common notification types
  success(
    title: string,
    message: string,
    options?: Partial<NotificationConfig>
  ): string {
    return this.show({
      title,
      message,
      type: 'success',
      ...this.defaultConfigs.success,
      ...options,
    });
  }

  error(
    title: string,
    message: string,
    options?: Partial<NotificationConfig>
  ): string {
    return this.show({
      title,
      message,
      type: 'error',
      ...this.defaultConfigs.error,
      ...options,
    });
  }

  warning(
    title: string,
    message: string,
    options?: Partial<NotificationConfig>
  ): string {
    return this.show({
      title,
      message,
      type: 'warning',
      ...this.defaultConfigs.warning,
      ...options,
    });
  }

  info(
    title: string,
    message: string,
    options?: Partial<NotificationConfig>
  ): string {
    return this.show({
      title,
      message,
      type: 'info',
      ...this.defaultConfigs.info,
      ...options,
    });
  }

  // Generic show method
  show(config: NotificationConfig): string {
    const id = config.id || this.generateId();
    const notification: NotificationData = {
      ...config,
      id,
      timestamp: Date.now(),
    };

    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, notification]);

    return id;
  }

  // Remove notification
  remove(id: string): void {
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next(
      currentNotifications.filter(n => n.id !== id)
    );
  }

  // Clear all notifications
  clearAll(): void {
    this.notificationsSubject.next([]);
  }

  // Clear notifications by type
  clearByType(type: NotificationConfig['type']): void {
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next(
      currentNotifications.filter(n => n.type !== type)
    );
  }

  // Get current notifications
  getNotifications(): NotificationData[] {
    return this.notificationsSubject.value;
  }

  private generateId(): string {
    return `notification-${++this.notificationId}`;
  }
}
