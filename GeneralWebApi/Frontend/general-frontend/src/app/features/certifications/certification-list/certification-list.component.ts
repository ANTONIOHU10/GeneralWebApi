// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/certifications/certification-list/certification-list.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-certification-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="certification-container">
      <h1>🏆 Professional Certifications</h1>
      <p>Professional certification management functionality coming soon...</p>
    </div>
  `,
  styles: [`
    .certification-container {
      padding: 2rem;
    }
  `]
})
export class CertificationListComponent {}
