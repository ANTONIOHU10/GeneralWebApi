// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/contract-reminders/contract-reminder-list/contract-reminder-list.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contract-reminder-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="contract-reminder-container">
      <h1>⏰ Expiry Reminders</h1>
      <p>Contract expiry reminder functionality coming soon...</p>
    </div>
  `,
  styles: [
    `
      .contract-reminder-container {
        padding: 2rem;
      }
    `,
  ],
})
export class ContractReminderListComponent {}
