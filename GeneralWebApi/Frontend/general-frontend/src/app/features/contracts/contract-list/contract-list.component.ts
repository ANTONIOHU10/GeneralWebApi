// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/contracts/contract-list/contract-list.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contract-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="contract-container">
      <h1>📋 Contract Management</h1>
      <p>Contract management functionality coming soon...</p>
    </div>
  `,
  styles: [`
    .contract-container {
      padding: 2rem;
    }
  `]
})
export class ContractListComponent {}
