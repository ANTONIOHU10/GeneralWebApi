// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/users/user-list/user-list.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="user-container">
      <h1>👤 User Management</h1>
      <p>User management functionality coming soon...</p>
    </div>
  `,
  styles: [
    `
      .user-container {
        padding: 2rem;
      }
    `,
  ],
})
export class UserListComponent {}
