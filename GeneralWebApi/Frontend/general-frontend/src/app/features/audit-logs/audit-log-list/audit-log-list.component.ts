// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/audit-logs/audit-log-list/audit-log-list.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-audit-log-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="audit-log-container">
      <h1>📝 Audit Logs</h1>
      <p>Audit log management functionality coming soon...</p>
    </div>
  `,
  styles: [
    `
      .audit-log-container {
        padding: 2rem;
      }
    `,
  ],
})
export class AuditLogListComponent {}
