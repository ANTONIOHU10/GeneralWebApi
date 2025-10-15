// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/company-documents/company-document-list/company-document-list.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-company-document-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="company-document-container">
      <h1>📚 Company Documents</h1>
      <p>Company document management functionality coming soon...</p>
    </div>
  `,
  styles: [`
    .company-document-container {
      padding: 2rem;
    }
  `]
})
export class CompanyDocumentListComponent {}
