import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../Shared/services/notification.service';

@Component({
  selector: 'app-notification-demo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-demo.component.html',
  styleUrls: ['./notification-demo.component.scss'],
})
export class NotificationDemoComponent {
  private notificationService = inject(NotificationService);

  // Basic notification methods
  showSuccess(): void {
    this.notificationService.success(
      'Operation Successful',
      'Your operation has been completed successfully!'
    );
  }

  showError(): void {
    this.notificationService.error(
      'Operation Failed',
      'Sorry, an error occurred during the operation. Please try again.'
    );
  }

  showWarning(): void {
    this.notificationService.warning(
      'Warning',
      'Please note that this operation may affect system performance.'
    );
  }

  showInfo(): void {
    this.notificationService.info(
      'Information',
      'This is an information notification to convey important information to the user.'
    );
  }

  showWithActions(): void {
    const notificationId = this.notificationService.show({
      title: 'Confirm Operation',
      message:
        'Are you sure you want to perform this operation? This action cannot be undone.',
      type: 'warning',
      duration: 0, // No auto-close
      persistent: true,
      actions: [
        {
          id: 'confirm',
          label: 'Confirm',
          action: () => this.handleConfirm(notificationId),
          variant: 'primary',
        },
        {
          id: 'cancel',
          label: 'Cancel',
          action: () => this.handleCancel(notificationId),
          variant: 'secondary',
        },
      ],
    });
  }

  showCustomNotification(): void {
    this.notificationService.show({
      title: 'Custom Notification',
      message:
        'This is a custom notification with specific styling and behavior.',
      type: 'info',
      duration: 6000,
      priority: 'high',
      customClass: 'custom-notification',
      icon: 'star',
    });
  }

  showCriticalNotification(): void {
    const notificationId = this.notificationService.show({
      title: 'Critical Alert',
      message: 'System requires immediate attention!',
      type: 'error',
      duration: 0,
      persistent: true,
      priority: 'critical',
      closable: false,
      actions: [
        {
          id: 'acknowledge',
          label: 'Acknowledge',
          action: () => this.handleAcknowledge(notificationId),
          variant: 'danger',
        },
      ],
    });
  }

  // API simulation methods
  simulateApiSuccess(): void {
    this.notificationService.show({
      title: 'API Success',
      message: 'Data has been successfully saved to the server.',
      type: 'success',
      duration: 3000,
      icon: 'cloud_done',
    });
  }

  simulateApiError(): void {
    this.notificationService.show({
      title: 'API Error',
      message:
        'Failed to connect to the server. Please check your internet connection.',
      type: 'error',
      duration: 5000,
      priority: 'high',
      icon: 'cloud_off',
    });
  }

  simulateApiLoading(): void {
    const loadingId = this.notificationService.show({
      title: 'Loading...',
      message: 'Please wait while we process your request.',
      type: 'info',
      duration: 0,
      persistent: true,
      icon: 'hourglass_empty',
    });

    // Simulate API call
    setTimeout(() => {
      this.notificationService.remove(loadingId);
      this.notificationService.success(
        'Complete',
        'Your request has been processed successfully!'
      );
    }, 3000);
  }

  clearAll(): void {
    this.notificationService.clearAll();
  }

  private handleConfirm(notificationId: string): void {
    console.log('Operation confirmed');
    this.notificationService.remove(notificationId);
    this.notificationService.success(
      'Confirmed',
      'Operation has been confirmed and executed.'
    );
  }

  private handleCancel(notificationId: string): void {
    console.log('Operation cancelled');
    this.notificationService.remove(notificationId);
    this.notificationService.info('Cancelled', 'Operation has been cancelled.');
  }

  private handleAcknowledge(notificationId: string): void {
    console.log('Critical alert acknowledged');
    this.notificationService.remove(notificationId);
    this.notificationService.success(
      'Acknowledged',
      'Critical alert has been acknowledged.'
    );
  }
}
