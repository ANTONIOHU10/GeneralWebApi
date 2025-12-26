// Path: GeneralWebApi/Frontend/general-frontend/src/app/Shared/components/header/components/notification-dropdown/components/notification-item/notification-item.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Notification } from 'app/contracts/notifications/notification.model';

@Component({
  standalone: true,
  selector: 'app-notification-item',
  templateUrl: './notification-item.component.html',
  styleUrls: ['./notification-item.component.scss'],
  imports: [CommonModule],
})
export class NotificationItemComponent {
  @Input() notification!: Notification;
  @Output() itemClick = new EventEmitter<Notification>();

  /**
   * Get notification icon based on type
   */
  getNotificationIcon(type: string): string {
    const iconMap: Record<string, string> = {
      approval: 'check_circle',
      task: 'assignment',
      contract: 'description',
      system: 'settings',
      audit: 'history',
      employee: 'people',
    };
    return iconMap[type] || 'notifications';
  }

  /**
   * Get time ago string
   */
  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    }
  }

  /**
   * Handle item click
   */
  onItemClick(): void {
    this.itemClick.emit(this.notification);
  }
}

