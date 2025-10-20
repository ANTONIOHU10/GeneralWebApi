// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/tasks/task-list/task-list.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="task-container">
      <h1>
        <span class="material-icons">task_alt</span>
        Tasks
      </h1>
      <p>Task management functionality coming soon...</p>
    </div>
  `,
  styles: [
    `
      .task-container {
        padding: 2rem;
      }

      h1 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #333;
        margin-bottom: 1rem;
      }

      .material-icons {
        font-size: 1.5rem;
        color: #4caf50;
      }
    `,
  ],
})
export class TaskListComponent {}
