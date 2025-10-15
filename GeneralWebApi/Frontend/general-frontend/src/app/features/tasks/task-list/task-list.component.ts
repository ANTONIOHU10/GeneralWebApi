// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/tasks/task-list/task-list.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="task-container">
      <h1>✅ Tasks</h1>
      <p>Task management functionality coming soon...</p>
    </div>
  `,
  styles: [`
    .task-container {
      padding: 2rem;
    }
  `]
})
export class TaskListComponent {}
