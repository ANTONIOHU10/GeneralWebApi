// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/positions/position-list/position-list.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-position-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="position-container">
      <h1>💼 Position Management</h1>
      <p>Position management functionality coming soon...</p>
    </div>
  `,
  styles: [
    `
      .position-container {
        padding: 2rem;
      }
    `,
  ],
})
export class PositionListComponent {}
