// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/permissions/permission-list/permission-list.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-permission-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="permission-container">
      <h1>🛡️ Permission Management</h1>
      <p>Permission management functionality coming soon...</p>
    </div>
  `,
  styles: [`
    .permission-container {
      padding: 2rem;
    }
  `]
})
export class PermissionListComponent {}
