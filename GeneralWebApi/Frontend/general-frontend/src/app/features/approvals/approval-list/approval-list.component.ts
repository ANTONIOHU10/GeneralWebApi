// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/approvals/approval-list/approval-list.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-approval-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="approval-container">
      <h1>✅ Contract Approvals</h1>
      <p>Contract approval management functionality coming soon...</p>
    </div>
  `,
  styles: [`
    .approval-container {
      padding: 2rem;
    }
  `]
})
export class ApprovalListComponent {}
