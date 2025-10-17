// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/notifications/notification-center/notification-center.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container">
      <h1>
        <span class="material-icons">notifications</span>
        Notifications
      </h1>
      <p>Notification center functionality coming soon...</p>
    </div>
  `,
  styles: [
    `
      .notification-container {
        padding: 2rem;
      }

      h1 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #333;
        margin-bottom: 1rem;
      }

      .material-icons {
        font-size: 1.5rem;
        color: #2196f3;
      }
    `,
  ],
})
export class NotificationCenterComponent {}
