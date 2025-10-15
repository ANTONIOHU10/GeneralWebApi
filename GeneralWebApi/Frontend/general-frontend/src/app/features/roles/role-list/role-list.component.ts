// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/roles/role-list/role-list.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="role-container">
      <h1>🔑 Role Management</h1>
      <p>Role management functionality coming soon...</p>
    </div>
  `,
  styles: [`
    .role-container {
      padding: 2rem;
    }
  `]
})
export class RoleListComponent {}
