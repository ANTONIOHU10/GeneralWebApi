// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/employees/employee-module/employee-module.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-employee-module',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="employee-module">
      <div class="content-area">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [
    `
      .employee-module {
        height: 100%;
        display: flex;
        flex-direction: column;
        background: var(--bg-primary);
      }

      .content-area {
        flex: 1;
        padding: 0;
        overflow-y: auto;
        background: var(--bg-primary);
        position: relative;
      }
    `,
  ],
})
export class EmployeeModuleComponent {}
