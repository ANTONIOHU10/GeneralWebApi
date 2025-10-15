// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/notifications/notification-center/notification-center.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container">
      <h1>🔔 Notifications</h1>
      <p>Notification center functionality coming soon...</p>
    </div>
  `,
  styles: [`
    .notification-container {
      padding: 2rem;
    }
  `]
})
export class NotificationCenterComponent {}
