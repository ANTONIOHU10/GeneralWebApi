// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/onboarding/onboarding-list/onboarding-list.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-onboarding-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="onboarding-container">
      <h1>📝 Onboarding</h1>
      <p>
        Employee onboarding and offboarding management functionality coming
        soon...
      </p>
    </div>
  `,
  styles: [
    `
      .onboarding-container {
        padding: 2rem;
      }
    `,
  ],
})
export class OnboardingListComponent {}
