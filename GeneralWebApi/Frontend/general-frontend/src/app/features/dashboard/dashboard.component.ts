// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/dashboard/dashboard.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  BasePageHeaderComponent,
  BaseCardComponent,
  BaseButtonComponent,
} from '../../Shared/components/base';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    BasePageHeaderComponent,
    BaseCardComponent,
    BaseButtonComponent,
  ],
  template: `
    <div class="dashboard-container">
      <app-base-page-header
        title="Dashboard Overview"
        subtitle="Welcome to your management dashboard"
        icon="dashboard"
        iconColor="var(--color-primary-500)"
        [showActions]="true"
      >
        <div slot="actions">
          <app-base-button
            text="Refresh"
            icon="refresh"
            variant="outline"
            size="small"
          >
          </app-base-button>
          <app-base-button
            text="Export"
            icon="download"
            variant="secondary"
            size="small"
          >
          </app-base-button>
        </div>
      </app-base-page-header>

      <div class="stats-grid">
        <app-base-card title="Total Employees" icon="people" variant="elevated">
          <div class="stat-number">{{ totalEmployees() }}</div>
          <app-base-button text="View Details" variant="primary" size="small">
          </app-base-button>
        </app-base-card>

        <app-base-card
          title="Active Contracts"
          icon="description"
          variant="elevated"
        >
          <div class="stat-number">{{ activeContracts() }}</div>
          <app-base-button text="Manage" variant="primary" size="small">
          </app-base-button>
        </app-base-card>

        <app-base-card title="Departments" icon="business" variant="elevated">
          <div class="stat-number">{{ totalDepartments() }}</div>
          <app-base-button text="View All" variant="primary" size="small">
          </app-base-button>
        </app-base-card>

        <app-base-card
          title="Pending Approvals"
          icon="pending_actions"
          variant="elevated"
        >
          <div class="stat-number">{{ pendingApprovals() }}</div>
          <app-base-button text="Review" variant="primary" size="small">
          </app-base-button>
        </app-base-card>
      </div>

      <app-base-card
        title="Recent Activities"
        subtitle="Latest updates and notifications"
        icon="history"
        variant="elevated"
      >
        <div class="activity-list">
          <div
            class="activity-item"
            *ngFor="let activity of recentActivities()"
          >
            <span class="activity-icon material-icons">{{
              activity.icon
            }}</span>
            <span class="activity-text">{{ activity.text }}</span>
            <span class="activity-time">{{ activity.time }}</span>
          </div>
        </div>
        <div slot="footer">
          <app-base-button
            text="View All Activities"
            icon="arrow_forward"
            variant="outline"
            size="small"
          >
          </app-base-button>
        </div>
      </app-base-card>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        height: 100%;
        display: flex;
        flex-direction: column;
        background: var(--bg-primary);
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.5rem;
        margin: 2rem;
        flex: 1;
      }

      .stat-number {
        font-size: 2.5rem;
        font-weight: bold;
        color: var(--color-primary-500);
        margin: 1rem 0;
        text-align: center;
      }

      .activity-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .activity-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.75rem;
        background: var(--bg-secondary);
        border-radius: 6px;
        transition: background-color 0.3s ease;
      }

      .activity-item:hover {
        background: var(--bg-tertiary);
      }

      .activity-icon {
        font-size: 1.2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-tertiary);
      }

      .activity-text {
        flex: 1;
        color: var(--text-primary);
      }

      .activity-time {
        color: var(--text-secondary);
        font-size: 0.9rem;
      }

      @media (max-width: 768px) {
        .stats-grid {
          grid-template-columns: 1fr;
          margin: 1rem;
          gap: 1rem;
        }

        .stat-number {
          font-size: 2rem;
        }
      }
    `,
  ],
})
export class DashboardComponent {
  // Mock data - in real app, these would come from services
  totalEmployees = signal(156);
  activeContracts = signal(142);
  totalDepartments = signal(12);
  pendingApprovals = signal(8);

  recentActivities = signal([
    {
      icon: 'person',
      text: 'New employee John Doe added',
      time: '2 hours ago',
    },
    {
      icon: 'description',
      text: 'Contract for Jane Smith renewed',
      time: '4 hours ago',
    },
    {
      icon: 'business',
      text: 'New department "Marketing" created',
      time: '6 hours ago',
    },
    {
      icon: 'key',
      text: 'Role permissions updated for Admin',
      time: '1 day ago',
    },
    { icon: 'history', text: 'Audit log entry created', time: '1 day ago' },
  ]);
}
