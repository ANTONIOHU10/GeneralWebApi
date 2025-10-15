// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/identity-documents/identity-document-list/identity-document-list.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-identity-document-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="identity-document-container">
      <h1>🆔 Identity Documents</h1>
      <p>Identity document management functionality coming soon...</p>
    </div>
  `,
  styles: [`
    .identity-document-container {
      padding: 2rem;
    }
  `]
})
export class IdentityDocumentListComponent {}
