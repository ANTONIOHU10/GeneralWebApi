// Path: GeneralWebApi/Frontend/general-frontend/src/app/core/services/notification-providers/approval-notification.provider.ts
import { Injectable, inject } from '@angular/core';
import { firstValueFrom, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { 
  Notification, 
  NotificationProvider, 
  NotificationType,
  NotificationPriority 
} from 'app/contracts/notifications/notification.model';
import { ContractApprovalService } from '../contract-approval.service';
import { ContractApproval } from 'app/contracts/contract-approvals/contract-approval.model';
import { NotificationService } from '../notification.service';
import { AuthService } from '../auth.service';

/**
 * Approval Notification Provider
 * Provides notifications for contract approvals
 */
@Injectable({
  providedIn: 'root',
})
export class ApprovalNotificationProvider implements NotificationProvider {
  private contractApprovalService = inject(ContractApprovalService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  getType(): NotificationType {
    return 'approval';
  }

  async getNotifications(): Promise<Notification[]> {
    try {
      // Get current user ID
      const userInfo = await firstValueFrom(
        this.authService.getCurrentUser().pipe(
          catchError(() => of({ userId: null }))
        )
      );

      if (!userInfo?.userId) {
        console.warn('Cannot get notifications: User ID not available');
        return [];
      }

      // Get pending approvals
      const response = await firstValueFrom(
        this.contractApprovalService.getPendingApprovals({ pageNumber: 1, pageSize: 50 })
      );

      if (!response?.data || response.data.length === 0) {
        return [];
      }

      // Transform to notifications and ensure they exist in backend
      const notifications = await Promise.all(
        response.data.map(async (approval) => {
          const notification = this.transformToNotification(approval, userInfo.userId!);
          
          // Check if notification already exists in backend
          // If not, create it
          try {
            const notificationId = parseInt(notification.id, 10);
            if (!isNaN(notificationId)) {
              // ID is numeric, notification exists in backend
              return notification;
            }
          } catch {
            // ID is not numeric, need to create in backend
          }

          // Create notification in backend
          try {
            const created = await firstValueFrom(
              this.notificationService.createNotification(
                this.notificationService.transformToRequest(notification, userInfo.userId!)
              )
            );
            return this.notificationService.transformToNotification(created);
          } catch (error) {
            console.error('Failed to create notification in backend:', error);
            return notification; // Return local notification anyway
          }
        })
      );

      return notifications;
    } catch (error) {
      console.error('Failed to fetch approval notifications:', error);
      return [];
    }
  }

  /**
   * Transform ContractApproval to Notification
   */
  private transformToNotification(approval: ContractApproval, userId: string): Notification {
    // Determine priority based on due date
    let priority: NotificationPriority = 'medium';
    const currentStep = approval.approvalSteps.find(
      step => step.status === 'Pending' && step.stepOrder === approval.currentApprovalLevel
    );
    
    if (currentStep?.dueDate) {
      const daysUntilDue = Math.ceil(
        (new Date(currentStep.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilDue < 1) priority = 'urgent';
      else if (daysUntilDue < 3) priority = 'high';
      else if (daysUntilDue < 7) priority = 'medium';
      else priority = 'low';
    }

    // Build title and message
    const employeeName = approval.contractEmployeeName || `Contract #${approval.contractId}`;
    const title = `Contract Approval Required: ${employeeName}`;
    const message = `You have a pending contract approval for ${employeeName}. Current step: ${approval.currentApprovalLevel}/${approval.maxApprovalLevel}`;

    return {
      id: `approval-${approval.id}`, // Temporary ID, will be replaced with backend ID
      type: 'approval',
      priority,
      status: 'unread',
      title,
      message,
      icon: 'check_circle',
      createdAt: approval.requestedAt,
      actionUrl: `/private/contract-approvals`,
      actionLabel: 'Review Approval',
      actionData: {
        approvalId: approval.id,
        contractId: approval.contractId,
      },
      sourceType: 'ContractApproval',
      sourceId: approval.id.toString(),
      metadata: {
        contractEmployeeName: approval.contractEmployeeName,
        currentStep: approval.currentApprovalLevel,
        totalSteps: approval.maxApprovalLevel,
        dueDate: currentStep?.dueDate,
      },
    };
  }

  async markAsRead(notificationId: string): Promise<void> {
    const id = parseInt(notificationId, 10);
    if (!isNaN(id)) {
      // Notification exists in backend, call toggle API
      // Note: This will toggle the status, so if already read, it will become unread
      // For providers, we assume we want to mark as read
      await firstValueFrom(
        this.notificationService.toggleReadStatus(id).pipe(
          catchError(error => {
            console.error('Failed to toggle notification read status:', error);
            return of(void 0);
          })
        )
      );
    }
    // If ID is not numeric, it's a temporary ID - nothing to persist
  }

  async getUnreadCount(): Promise<number> {
    try {
      const response = await firstValueFrom(
        this.contractApprovalService.getPendingApprovals({ pageNumber: 1, pageSize: 1 })
      );
      return response?.data?.length || 0;
    } catch (error) {
      return 0;
    }
  }
}

