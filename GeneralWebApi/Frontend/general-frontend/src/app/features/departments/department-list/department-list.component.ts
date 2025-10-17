// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/departments/department-list/department-list.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="department-container">
      <h1>🏢 Department Management</h1>
      <p>Department management functionality coming soon...</p>
    </div>
  `,
  styles: [
    `
      .department-container {
        padding: 2rem;
      }
    `,
  ],
})
export class DepartmentListComponent {}
