// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/backup/backup/backup.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-backup',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="backup-container">
      <h1>💾 Backup & Recovery</h1>
      <p>Data backup and recovery functionality coming soon...</p>
    </div>
  `,
  styles: [
    `
      .backup-container {
        padding: 2rem;
      }
    `,
  ],
})
export class BackupComponent {}
