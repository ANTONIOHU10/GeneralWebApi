// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/approvals/approval-list/approval-list.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  BasePageHeaderComponent,
  BaseCardComponent,
  BaseButtonComponent,
} from '../../../Shared/components/base';

@Component({
  selector: 'app-approval-list',
  standalone: true,
  imports: [
    CommonModule,
    BasePageHeaderComponent,
    BaseCardComponent,
    BaseButtonComponent,
  ],
  template: `
    <div class="approval-container">
      <app-base-page-header
        title="Contract Approvals"
        subtitle="Contract approval management functionality coming soon..."
        icon="approval"
        iconColor="var(--color-warning)"
        [showActions]="true"
      >
        <div slot="actions">
          <app-base-button
            text="New Approval"
            icon="add"
            variant="primary"
            size="small"
          >
          </app-base-button>
        </div>
      </app-base-page-header>

      <div class="content-area">
        <app-base-card
          title="Approval Queue"
          subtitle="Pending approvals requiring your attention"
          icon="pending_actions"
          variant="elevated"
        >
          <p>No pending approvals at this time.</p>
        </app-base-card>
      </div>
    </div>
  `,
  styles: [
    `
      .approval-container {
        height: 100%;
        display: flex;
        flex-direction: column;
        background: var(--bg-primary, #f8f9fa);
      }

      .content-area {
        flex: 1;
        padding: 2rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      @media (max-width: 768px) {
        .content-area {
          padding: 1rem;
        }
      }
    `,
  ],
})
export class ApprovalListComponent {}
