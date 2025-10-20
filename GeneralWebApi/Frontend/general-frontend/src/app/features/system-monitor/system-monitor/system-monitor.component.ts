// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/system-monitor/system-monitor/system-monitor.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-system-monitor',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="system-monitor-container">
      <h1>📊 System Monitor</h1>
      <p>System monitoring functionality coming soon...</p>
    </div>
  `,
  styles: [
    `
      .system-monitor-container {
        padding: 2rem;
      }
    `,
  ],
})
export class SystemMonitorComponent {}
