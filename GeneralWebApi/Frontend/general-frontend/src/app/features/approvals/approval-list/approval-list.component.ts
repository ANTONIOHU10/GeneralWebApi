// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/approvals/approval-list/approval-list.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-approval-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="approval-container">
      <h1>
        <span class="material-icons">approval</span>
        Contract Approvals
      </h1>
      <p>Contract approval management functionality coming soon...</p>
    </div>
  `,
  styles: [`
    .approval-container {
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
      color: #FF9800;
    }
  `]
})
export class ApprovalListComponent {}
