// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/contract-approvals/contract-approval-list/contract-approval-list.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contract-approval-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="contract-approval-container">
      <h1>
        <span class="material-icons">check_circle</span>
        Contract Approvals
      </h1>
      <p>Contract approval workflow management functionality coming soon...</p>
    </div>
  `,
  styles: [`
    .contract-approval-container {
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
      color: #4CAF50;
    }
  `]
})
export class ContractApprovalListComponent {}
