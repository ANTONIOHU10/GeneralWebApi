// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/education/education-list/education-list.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-education-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="education-container">
      <h1>🎓 Education Background</h1>
      <p>Education background management functionality coming soon...</p>
    </div>
  `,
  styles: [
    `
      .education-container {
        padding: 2rem;
      }
    `,
  ],
})
export class EducationListComponent {}
