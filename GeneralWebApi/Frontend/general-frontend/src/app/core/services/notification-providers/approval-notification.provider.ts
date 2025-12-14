// Path: GeneralWebApi/Frontend/general-frontend/src/app/core/services/notification-providers/approval-notification.provider.ts
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { 
  Notification, 
  NotificationProvider, 
  NotificationType,
  NotificationPriority 
} from 'app/contracts/notifications/notification.model';
import { ContractApprovalService } from '../contract-approval.service';
import { ContractApproval } from 'app/contracts/contract-approvals/contract-approval.model';

/**
 * Approval Notification Provider
 * Provides notifications for contract approvals
 */
@Injectable({
  providedIn: 'root',
})
export class ApprovalNotificationProvider implements NotificationProvider {
  private contractApprovalService = inject(ContractApprovalService);

  getType(): NotificationType {
    return 'approval';
  }

  async getNotifications(): Promise<Notification[]> {
    try {
      const response = await firstValueFrom(
        this.contractApprovalService.getPendingApprovals({ pageNumber: 1, pageSize: 50 })
      );

      if (!response?.data || response.data.length === 0) {
        return [];
      }

      return response.data.map((approval) => this.transformToNotification(approval));
    } catch (error) {
      console.error('Failed to fetch approval notifications:', error);
      return [];
    }
  }

  /**
   * Transform ContractApproval to Notification
   */
  private transformToNotification(approval: ContractApproval): Notification {
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
      id: `approval-${approval.id}`,
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
    // For now, we don't persist read status on backend
    // This could be implemented later with a notification read status table
    return Promise.resolve();
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

