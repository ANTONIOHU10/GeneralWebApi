// Path: GeneralWebApi/Frontend/general-frontend/src/app/core/services/notification.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from './base-http.service';
import { 
  Notification, 
  NotificationFilter, 
  NotificationStats,
  NotificationStatus
} from 'app/contracts/notifications/notification.model';

export interface BackendNotificationDto {
  id: number;
  userId: string;
  type: string;
  priority: string;
  status: string;
  title: string;
  message: string;
  icon?: string | null;
  actionUrl?: string | null;
  actionLabel?: string | null;
  sourceType?: string | null;
  sourceId?: string | null;
  metadata?: Record<string, unknown> | null;
  expiresAt?: string | null;
  createdAt: string;
  readAt?: string | null;
  archivedAt?: string | null;
}

export interface CreateNotificationRequest {
  userId: string;
  type: string;
  priority: string;
  title: string;
  message: string;
  icon?: string;
  actionUrl?: string;
  actionLabel?: string;
  sourceType?: string;
  sourceId?: string;
  metadata?: Record<string, unknown>;
  expiresAt?: string;
}

export interface NotificationSearchRequest {
  type?: string;
  status?: string;
  priority?: string;
  startDate?: string;
  endDate?: string;
  includeExpired?: boolean;
  sortBy?: string;
  sortDescending?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export interface PagedNotificationResponse {
  items: BackendNotificationDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

/**
 * Notification Service
 * Handles all notification-related API calls
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationService extends BaseHttpService {
  protected endpoint = '/api/v1/notifications';

  /**
   * Get paginated notifications
   * BaseHttpService automatically unwraps ApiResponse<T> to T
   */
  getNotifications(searchParams?: NotificationSearchRequest): Observable<PagedNotificationResponse> {
    return this.get<PagedNotificationResponse>(this.endpoint, searchParams as Record<string, unknown>);
  }

  /**
   * Get notification by ID
   */
  getNotificationById(id: number): Observable<BackendNotificationDto> {
    return this.get<BackendNotificationDto>(`${this.endpoint}/${id}`);
  }

  /**
   * Get unread count
   */
  getUnreadCount(): Observable<number> {
    return this.get<number>(`${this.endpoint}/unread-count`);
  }

  /**
   * Create a notification
   */
  createNotification(notification: CreateNotificationRequest): Observable<BackendNotificationDto> {
    return this.post<BackendNotificationDto>(this.endpoint, notification);
  }

  /**
   * Mark notification as read
   */
  markAsRead(id: number): Observable<void> {
    return this.post<void>(`${this.endpoint}/${id}/mark-read`, {});
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): Observable<void> {
    return this.post<void>(`${this.endpoint}/mark-all-read`, {});
  }

  /**
   * Mark notification as archived
   */
  markAsArchived(id: number): Observable<void> {
    return this.post<void>(`${this.endpoint}/${id}/archive`, {});
  }

  /**
   * Delete notification
   */
  deleteNotification(id: number): Observable<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Transform backend DTO to frontend Notification model
   */
  transformToNotification(dto: BackendNotificationDto): Notification {
    return {
      id: dto.id.toString(),
      type: dto.type as Notification['type'],
      priority: dto.priority as Notification['priority'],
      status: dto.status as NotificationStatus,
      title: dto.title,
      message: dto.message,
      icon: dto.icon || undefined,
      createdAt: dto.createdAt,
      readAt: dto.readAt || undefined,
      archivedAt: dto.archivedAt || undefined,
      actionUrl: dto.actionUrl || undefined,
      actionLabel: dto.actionLabel || undefined,
      actionData: dto.metadata || undefined,
      sourceType: dto.sourceType || undefined,
      sourceId: dto.sourceId || undefined,
      metadata: dto.metadata || undefined,
    };
  }

  /**
   * Transform frontend Notification to backend request
   */
  transformToRequest(notification: Partial<Notification>, userId: string): CreateNotificationRequest {
    return {
      userId,
      type: notification.type || '',
      priority: notification.priority || 'medium',
      title: notification.title || '',
      message: notification.message || '',
      icon: notification.icon,
      actionUrl: notification.actionUrl,
      actionLabel: notification.actionLabel,
      sourceType: notification.sourceType,
      sourceId: notification.sourceId,
      metadata: notification.metadata,
    };
  }
}

