// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/auth/contact-admin/contact-admin.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BaseButtonComponent } from '../../../Shared/components/base';
import { TranslatePipe } from '@core/pipes/translate.pipe';

@Component({
  selector: 'app-contact-admin',
  standalone: true,
  imports: [
    CommonModule,
    BaseButtonComponent,
    TranslatePipe,
  ],
  templateUrl: './contact-admin.component.html',
  styleUrl: './contact-admin.component.scss',
})
export class ContactAdminComponent {
  private router = inject(Router);

  /**
   * Navigate back to login
   */
  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  /**
   * Copy contact information to clipboard
   */
  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      // You can add a toast notification here if needed
      console.log('Copied to clipboard:', text);
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  }
}

