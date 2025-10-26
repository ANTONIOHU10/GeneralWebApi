import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import {
  NotificationService,
  NotificationData,
} from '../../services/notification.service';
import { BaseNotificationComponent } from '../base/base-notification/base-notification.component';

@Component({
  selector: 'app-notification-container',
  standalone: true,
  imports: [CommonModule, BaseNotificationComponent],
  templateUrl: './notification-container.component.html',
  styleUrls: ['./notification-container.component.scss'],
})
export class NotificationContainerComponent implements OnInit, OnDestroy {
  notifications: NotificationData[] = [];
  private subscription?: Subscription;
  private notificationService = inject(NotificationService);

  ngOnInit(): void {
    this.subscription = this.notificationService.notifications$.subscribe(
      notifications => (this.notifications = notifications)
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  onNotificationClose(id: string): void {
    this.notificationService.remove(id);
  }

  // onActionClick(action: any): void {
  //   // Action is handled in the BaseNotificationComponent
  // }

  onNotificationClick(notification: NotificationData): void {
    console.log('Notification clicked:', notification);
  }

  trackByNotificationId(index: number, notification: NotificationData): string {
    return notification.id;
  }
}
