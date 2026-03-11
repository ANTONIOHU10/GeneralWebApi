// Path: GeneralWebApi/Frontend/general-frontend/src/app/Shared/components/header/components/header-brand/header-brand.component.ts
import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-header-brand',
  templateUrl: './header-brand.component.html',
  styleUrls: ['./header-brand.component.scss'],
  imports: [CommonModule],
})
export class HeaderBrandComponent {
  @Input() brandTitle = 'GeneralWebApi';
  @Input() logoText = 'GW';

  private router = inject(Router);

  /**
   * Navigate to main overview/dashboard when brand is clicked
   */
  onBrandClick(): void {
    this.router.navigate(['/private', 'dashboard']);
  }
}

