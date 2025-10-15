// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/contract-approvals/contract-approval-list/contract-approval-list.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contract-approval-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="contract-approval-container">
      <h1>✅ Contract Approvals</h1>
      <p>Contract approval workflow management functionality coming soon...</p>
    </div>
  `,
  styles: [`
    .contract-approval-container {
      padding: 2rem;
    }
  `]
})
export class ContractApprovalListComponent {}
