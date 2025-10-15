// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/settings/settings.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="settings-container">
      <h1>⚙️ System Settings</h1>
      <p>System settings functionality coming soon...</p>
    </div>
  `,
  styles: [`
    .settings-container {
      padding: 2rem;
    }
  `]
})
export class SettingsComponent {}
