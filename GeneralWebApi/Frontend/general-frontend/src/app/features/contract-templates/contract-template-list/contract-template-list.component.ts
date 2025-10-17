// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/contract-templates/contract-template-list/contract-template-list.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contract-template-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="contract-template-container">
      <h1>📝 Contract Templates</h1>
      <p>Contract template management functionality coming soon...</p>
    </div>
  `,
  styles: [
    `
      .contract-template-container {
        padding: 2rem;
      }
    `,
  ],
})
export class ContractTemplateListComponent {}
