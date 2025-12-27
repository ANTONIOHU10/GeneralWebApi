// Path: GeneralWebApi/Frontend/general-frontend/src/app/core/services/notification.service.ts
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseHttpService } from './base-http.service';
import { 
  Notification, 
  NotificationFilter, 
  NotificationStats,
  NotificationStatus
} from 'app/contracts/notifications/notification.model';

/**
 * Backend Notification DTO for list view (from NotificationListDto)
 * Matches the backend NotificationListDto structure
 */
export interface BackendNotificationListDto {
  id: number;
  type: string;
  priority: string;
  status: string;
  title: string;
  message: string;
  icon?: string | null;
  actionUrl?: string | null;
  actionLabel?: string | null;
  createdAt: string;
  readAt?: string | null;
  isExpired: boolean;
}

/**
 * Backend Notification DTO for detail view (from NotificationDto)
 * Matches the backend NotificationDto structure
 */
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

/**
 * Paged notification response from backend
 * Matches PagedResult<NotificationListDto> structure
 */
export interface PagedNotificationResponse {
  items: BackendNotificationListDto[]; // Backend returns NotificationListDto, not NotificationDto
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
  // baseUrl already includes '/api/v1', so endpoint should be relative
  protected endpoint = '/notifications';

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
   * Toggle notification read status (read <-> unread)
   */
  toggleReadStatus(id: number): Observable<void> {
    return this.post<void>(`${this.endpoint}/${id}/toggle-read-status`, {});
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
   * Transform backend NotificationListDto to frontend Notification model
   * Handles the list DTO which has fewer fields than the detail DTO
   */
  transformToNotification(dto: BackendNotificationListDto | BackendNotificationDto): Notification {
    // Check if it's a list DTO (missing userId) or detail DTO
    const isListDto = !('userId' in dto);
    
    if (isListDto) {
      const listDto = dto as BackendNotificationListDto;
      return {
        id: listDto.id.toString(),
        type: listDto.type as Notification['type'],
        priority: listDto.priority as Notification['priority'],
        status: listDto.status as NotificationStatus,
        title: listDto.title,
        message: listDto.message,
        icon: listDto.icon || undefined,
        createdAt: listDto.createdAt,
        readAt: listDto.readAt || undefined,
        archivedAt: undefined, // Not available in list DTO
        actionUrl: this.normalizeActionUrl(listDto.actionUrl),
        actionLabel: listDto.actionLabel || undefined,
        actionData: undefined, // Not available in list DTO
        sourceType: undefined, // Not available in list DTO
        sourceId: undefined, // Not available in list DTO
        metadata: undefined, // Not available in list DTO
      };
    } else {
      const detailDto = dto as BackendNotificationDto;
      return {
        id: detailDto.id.toString(),
        type: detailDto.type as Notification['type'],
        priority: detailDto.priority as Notification['priority'],
        status: detailDto.status as NotificationStatus,
        title: detailDto.title,
        message: detailDto.message,
        icon: detailDto.icon || undefined,
        createdAt: detailDto.createdAt,
        readAt: detailDto.readAt || undefined,
        archivedAt: detailDto.archivedAt || undefined,
        actionUrl: this.normalizeActionUrl(detailDto.actionUrl),
        actionLabel: detailDto.actionLabel || undefined,
        actionData: detailDto.metadata || undefined,
        sourceType: detailDto.sourceType || undefined,
        sourceId: detailDto.sourceId || undefined,
        metadata: detailDto.metadata || undefined,
      };
    }
  }

  /**
   * Normalize action URL to include /private prefix and handle detail routes
   */
  private normalizeActionUrl(actionUrl?: string | null): string | undefined {
    if (!actionUrl) return undefined;
    
    // If already has /private prefix, return as is
    if (actionUrl.startsWith('/private/')) {
      return actionUrl;
    }
    
    // Add /private prefix if missing
    let normalized = actionUrl.startsWith('/') ? actionUrl : `/${actionUrl}`;
    if (!normalized.startsWith('/private/')) {
      normalized = `/private${normalized}`;
    }
    
    // Handle contract-approvals detail routes
    // Backend sends /contract-approvals/{id}, but frontend doesn't have detail route
    // Convert to list route with query parameter
    const contractApprovalMatch = normalized.match(/^\/private\/contract-approvals\/(\d+)$/);
    if (contractApprovalMatch) {
      const approvalId = contractApprovalMatch[1];
      return `/private/contract-approvals?approvalId=${approvalId}`;
    }
    
    return normalized;
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

