// Path: GeneralWebApi/Frontend/general-frontend/src/app/contracts/notifications/notification.model.ts

/**
 * Notification types - extensible enum for different notification sources
 */
export type NotificationType = 
  | 'approval'           // Contract/other approvals
  | 'task'               // Task reminders and updates
  | 'contract'           // Contract expiration reminders
  | 'system'             // System notifications
  | 'audit'              // Audit and security alerts
  | 'employee';          // Employee-related notifications

/**
 * Notification priority levels
 */
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Notification status
 */
export type NotificationStatus = 'unread' | 'read' | 'archived';

/**
 * Base notification interface - extensible for different notification types
 */
export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  
  // Content
  title: string;
  message: string;
  icon?: string;
  
  // Metadata
  createdAt: string;
  readAt?: string | null;
  archivedAt?: string | null;
  
  // Action data - for navigation and actions
  actionUrl?: string;        // URL to navigate when clicked
  actionLabel?: string;      // Label for action button
  actionData?: Record<string, unknown>; // Additional data for action
  
  // Source reference - link to original entity
  sourceType?: string;      // e.g., 'ContractApproval', 'Task', 'Contract'
  sourceId?: string;        // ID of the source entity
  
  // Optional metadata
  metadata?: Record<string, unknown>;
}

/**
 * Notification filter options
 */
export interface NotificationFilter {
  type?: NotificationType | 'all';
  status?: NotificationStatus | 'all';
  priority?: NotificationPriority | 'all';
  startDate?: string;
  endDate?: string;
}

/**
 * Notification statistics
 */
export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<NotificationPriority, number>;
}

/**
 * Notification provider interface - for extensibility
 * Each notification source (approvals, tasks, contracts) implements this
 */
export interface NotificationProvider {
  /**
   * Get notifications for the current user
   */
  getNotifications(): Promise<Notification[]>;
  
  /**
   * Get notification type
   */
  getType(): NotificationType;
  
  /**
   * Mark notification as read
   */
  markAsRead?(notificationId: string): Promise<void>;
  
  /**
   * Get notification count (for badge)
   */
  getUnreadCount?(): Promise<number>;
}






