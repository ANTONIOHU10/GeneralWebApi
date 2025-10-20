// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/contract-approvals/contract-approval-list/contract-approval-list.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  BasePageHeaderComponent,
  BaseCardComponent,
  BaseButtonComponent,
} from '../../../Shared/components/base';

@Component({
  selector: 'app-contract-approval-list',
  standalone: true,
  imports: [
    CommonModule,
    BasePageHeaderComponent,
    BaseCardComponent,
    BaseButtonComponent,
  ],
  template: `
    <div class="contract-approval-container">
      <app-base-page-header
        title="Contract Approvals"
        subtitle="Contract approval workflow management functionality coming soon..."
        icon="check_circle"
        iconColor="var(--color-success)"
        [showActions]="true"
      >
        <div slot="actions">
          <app-base-button
            text="Filter"
            icon="filter_list"
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

      <div class="content-area">
        <div class="cards-grid">
          <app-base-card
            title="Pending Reviews"
            subtitle="Contracts awaiting your review"
            icon="pending"
            variant="elevated"
          >
            <div class="stat-number">12</div>
            <app-base-button text="Review Now" variant="primary" size="small">
            </app-base-button>
          </app-base-card>

          <app-base-card
            title="Approved This Week"
            subtitle="Contracts approved in the last 7 days"
            icon="check_circle"
            variant="elevated"
          >
            <div class="stat-number">8</div>
            <app-base-button text="View Details" variant="outline" size="small">
            </app-base-button>
          </app-base-card>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .contract-approval-container {
        height: 100%;
        display: flex;
        flex-direction: column;
        background: var(--bg-primary, #f8f9fa);
      }

      .content-area {
        flex: 1;
        padding: 2rem;
      }

      .cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
      }

      .stat-number {
        font-size: 2rem;
        font-weight: bold;
        color: var(--color-primary-500);
        margin: 1rem 0;
      }

      @media (max-width: 768px) {
        .content-area {
          padding: 1rem;
        }

        .cards-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class ContractApprovalListComponent {}
