// Path: GeneralWebApi/Frontend/general-frontend/src/app/core/services/notification-providers/contract-notification.provider.ts
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { 
  Notification, 
  NotificationProvider, 
  NotificationType,
  NotificationPriority 
} from 'app/contracts/notifications/notification.model';
import { ContractService } from '../contract.service';
import { Contract } from 'app/contracts/contracts/contract.model';

/**
 * Contract Notification Provider
 * Provides notifications for contract expiration reminders
 */
@Injectable({
  providedIn: 'root',
})
export class ContractNotificationProvider implements NotificationProvider {
  private contractService = inject(ContractService);

  getType(): NotificationType {
    return 'contract';
  }

  async getNotifications(): Promise<Notification[]> {
    try {
      // Get expiring contracts (within 30 days)
      const expiringResponse = await firstValueFrom(
        this.contractService.getExpiringContracts(30)
      );

      // Get expired contracts
      const expiredResponse = await firstValueFrom(
        this.contractService.getExpiredContracts()
      );

      const notifications: Notification[] = [];
      const now = new Date();

      // Process expiring contracts
      if (expiringResponse && expiringResponse.length > 0) {
        expiringResponse.forEach((contract) => {
          if (contract.endDate) {
            const endDate = new Date(contract.endDate);
            const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysUntilExpiry > 0 && daysUntilExpiry <= 30) {
              notifications.push(this.createExpiringNotification(contract, daysUntilExpiry));
            }
          }
        });
      }

      // Process expired contracts
      if (expiredResponse && expiredResponse.length > 0) {
        expiredResponse.forEach((contract) => {
          if (contract.endDate) {
            const endDate = new Date(contract.endDate);
            const daysOverdue = Math.ceil((now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));
            notifications.push(this.createExpiredNotification(contract, daysOverdue));
          }
        });
      }

      return notifications;
    } catch (error) {
      console.error('Failed to fetch contract notifications:', error);
      return [];
    }
  }

  /**
   * Create notification for expiring contract
   */
  private createExpiringNotification(contract: Contract, daysUntilExpiry: number): Notification {
    let priority: NotificationPriority = 'medium';
    let message = '';

    if (daysUntilExpiry <= 7) {
      priority = 'urgent';
      message = `Contract for ${contract.employeeName || 'employee'} expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}. Please prepare renewal documents.`;
    } else if (daysUntilExpiry <= 15) {
      priority = 'high';
      message = `Contract for ${contract.employeeName || 'employee'} expires in ${daysUntilExpiry} days. Renewal preparation needed.`;
    } else {
      priority = 'medium';
      message = `Contract for ${contract.employeeName || 'employee'} expires in ${daysUntilExpiry} days.`;
    }

    return {
      id: `contract-expiring-${contract.id}`,
      type: 'contract',
      priority,
      status: 'unread',
      title: `Contract Expiring: ${contract.employeeName || `Contract #${contract.id}`}`,
      message,
      icon: 'event',
      createdAt: new Date().toISOString(),
      actionUrl: `/private/contracts`,
      actionLabel: 'View Contract',
      actionData: {
        contractId: contract.id,
      },
      sourceType: 'Contract',
      sourceId: contract.id.toString(),
      metadata: {
        employeeName: contract.employeeName,
        contractType: contract.contractType,
        endDate: contract.endDate,
        daysUntilExpiry,
      },
    };
  }

  /**
   * Create notification for expired contract
   */
  private createExpiredNotification(contract: Contract, daysOverdue: number): Notification {
    return {
      id: `contract-expired-${contract.id}`,
      type: 'contract',
      priority: 'urgent',
      status: 'unread',
      title: `Contract Expired: ${contract.employeeName || `Contract #${contract.id}`}`,
      message: `Contract for ${contract.employeeName || 'employee'} expired ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} ago. Immediate action required.`,
      icon: 'warning',
      createdAt: new Date().toISOString(),
      actionUrl: `/private/contracts`,
      actionLabel: 'View Contract',
      actionData: {
        contractId: contract.id,
      },
      sourceType: 'Contract',
      sourceId: contract.id.toString(),
      metadata: {
        employeeName: contract.employeeName,
        contractType: contract.contractType,
        endDate: contract.endDate,
        daysOverdue,
      },
    };
  }

  async markAsRead(notificationId: string): Promise<void> {
    // Contract notifications are ephemeral, no need to persist read status
    return Promise.resolve();
  }

  async getUnreadCount(): Promise<number> {
    try {
      const expiringResponse = await firstValueFrom(
        this.contractService.getExpiringContracts(30)
      );
      const expiredResponse = await firstValueFrom(
        this.contractService.getExpiredContracts()
      );

      const now = new Date();
      let count = 0;

      // Count expiring contracts (within 30 days)
      if (expiringResponse) {
        expiringResponse.forEach((contract) => {
          if (contract.endDate) {
            const endDate = new Date(contract.endDate);
            const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            if (daysUntilExpiry > 0 && daysUntilExpiry <= 30) {
              count++;
            }
          }
        });
      }

      // Count expired contracts
      if (expiredResponse) {
        count += expiredResponse.length;
      }

      return count;
    } catch (error) {
      return 0;
    }
  }
}

