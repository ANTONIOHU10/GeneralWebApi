// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/tasks/task-list/task-list.component.ts
import { Component, OnInit, OnDestroy, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, BehaviorSubject, of, combineLatest } from 'rxjs';
import { catchError, finalize, takeUntil, map, startWith } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Task, CreateTaskRequest, UpdateTaskRequest, TaskSearchParams } from 'app/contracts/tasks/task.model';
import { TaskService } from '@core/services/task.service';
import { DialogService, NotificationService } from '../../../Shared/services';
import {
  BasePrivatePageContainerComponent,
  BaseButtonComponent,
  BaseInputComponent,
  BaseCardComponent,
  BaseBadgeComponent,
  BaseAsyncStateComponent,
} from '../../../Shared/components/base';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BasePrivatePageContainerComponent,
    BaseButtonComponent,
    BaseInputComponent,
    BaseCardComponent,
    BaseBadgeComponent,
    BaseAsyncStateComponent,
  ],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
})
export class TaskListComponent implements OnInit, OnDestroy {
  private taskService = inject(TaskService);
  private dialogService = inject(DialogService);
  private notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();
  private destroyRef = inject(DestroyRef);

  // State
  tasks$ = new BehaviorSubject<Task[]>([]);
  loading$ = new BehaviorSubject<boolean>(false);
  error$ = new BehaviorSubject<string | null>(null);
  
  // UI State
  showCreateForm = signal<boolean>(false);
  editingTask: Task | null = null;
  filterStatus = signal<string>('all'); // 'all', 'Pending', 'InProgress', 'Completed', 'Cancelled'

  // Filtered tasks Observable - initialized in constructor using toObservable
  filteredTasks$ = combineLatest([
    this.tasks$.asObservable().pipe(startWith([])),
    toObservable(this.filterStatus).pipe(startWith('all'))
  ]).pipe(
    map(([tasks, status]) => {
      if (status === 'all') {
        return tasks;
      }
      return tasks.filter((t) => t.status === status);
    }),
    takeUntilDestroyed(this.destroyRef)
  );

  // Form data - simplified
  taskForm = {
    title: '',
    description: '',
    status: 'Pending' as Task['status'],
    priority: 'Medium' as Task['priority'],
  };

  ngOnInit(): void {
    this.loadTasks();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load tasks from API
   */
  loadTasks(): void {
    this.loading$.next(true);
    this.error$.next(null);

    const params: TaskSearchParams = {
      pageNumber: 1,
      pageSize: 100,
      status: this.filterStatus() !== 'all' ? this.filterStatus() : undefined,
    };

    this.taskService
      .getTasks(params)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          this.error$.next(error.message || 'Failed to load tasks');
          this.notificationService.error('Error', 'Failed to load tasks');
          return of(null);
        }),
        finalize(() => this.loading$.next(false))
      )
      .subscribe({
        next: (response) => {
          console.log('TaskListComponent: Received response:', response);
          if (response?.data) {
            console.log('TaskListComponent: Tasks data:', response.data);
            this.tasks$.next(response.data);
          } else {
            console.warn('TaskListComponent: No data in response:', response);
          }
        },
      });
  }

  /**
   * Create new task
   */
  onCreateTask(): void {
    if (!this.taskForm.title.trim()) {
      this.notificationService.error('Validation Error', 'Title is required');
      return;
    }

    const createRequest: CreateTaskRequest = {
      title: this.taskForm.title.trim(),
      description: this.taskForm.description.trim() || null,
      status: this.taskForm.status,
      priority: this.taskForm.priority,
    };

    this.loading$.next(true);
    this.taskService
      .createTask(createRequest)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          this.notificationService.error('Error', error.message || 'Failed to create task');
          return of(null);
        }),
        finalize(() => this.loading$.next(false))
      )
      .subscribe({
        next: (task) => {
          if (task) {
            this.notificationService.success('Success', 'Task created successfully');
            this.resetForm();
            this.showCreateForm.set(false);
            this.loadTasks();
          }
        },
      });
  }

  /**
   * Update task status
   */
  onUpdateTaskStatus(task: Task, newStatus: Task['status']): void {
    const updateRequest: Omit<UpdateTaskRequest, 'id'> = {
      title: task.title,
      description: task.description || null,
      status: newStatus,
      priority: task.priority,
      dueDate: null,
      completedAt: newStatus === 'Completed' ? new Date().toISOString() : null,
      category: null,
      estimatedHours: null,
      actualHours: null,
    };

    this.loading$.next(true);
    this.taskService
      .updateTask(task.id, updateRequest)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          this.notificationService.error('Error', error.message || 'Failed to update task');
          return of(null);
        }),
        finalize(() => this.loading$.next(false))
      )
      .subscribe({
        next: (updatedTask) => {
          if (updatedTask) {
            this.loadTasks();
          }
        },
      });
  }

  /**
   * Delete task
   */
  onDeleteTask(task: Task): void {
    this.dialogService
      .confirmDelete(`Are you sure you want to delete "${task.title}"?`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (confirmed: boolean) => {
          if (confirmed) {
            this.loading$.next(true);
            this.taskService
              .deleteTask(task.id)
              .pipe(
                takeUntil(this.destroy$),
                catchError((error) => {
                  this.notificationService.error('Error', error.message || 'Failed to delete task');
                  return of(null);
                }),
                finalize(() => this.loading$.next(false))
              )
              .subscribe({
                next: () => {
                  this.notificationService.success('Success', 'Task deleted successfully');
                  this.loadTasks();
                },
              });
          }
        },
      });
  }

  /**
   * Start editing task
   */
  onEditTask(task: Task): void {
    this.editingTask = { ...task };
    this.taskForm = {
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
    };
    this.showCreateForm.set(true);
  }

  /**
   * Save edited task
   */
  onSaveTask(): void {
    if (!this.editingTask) return;

    if (!this.taskForm.title.trim()) {
      this.notificationService.error('Validation Error', 'Title is required');
      return;
    }

    const updateRequest: Omit<UpdateTaskRequest, 'id'> = {
      title: this.taskForm.title.trim(),
      description: this.taskForm.description.trim() || null,
      status: this.taskForm.status,
      priority: this.taskForm.priority,
      dueDate: null,
      completedAt: this.taskForm.status === 'Completed' && !this.editingTask.completedAt
        ? new Date().toISOString() : null,
      category: null,
      estimatedHours: null,
      actualHours: null,
    };

    this.loading$.next(true);
    this.taskService
      .updateTask(this.editingTask.id, updateRequest)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          this.notificationService.error('Error', error.message || 'Failed to update task');
          return of(null);
        }),
        finalize(() => this.loading$.next(false))
      )
      .subscribe({
        next: (updatedTask) => {
          if (updatedTask) {
            this.notificationService.success('Success', 'Task updated successfully');
            this.resetForm();
            this.editingTask = null;
            this.showCreateForm.set(false);
            this.loadTasks();
          }
        },
      });
  }

  /**
   * Cancel editing
   */
  onCancelEdit(): void {
    this.resetForm();
    this.editingTask = null;
    this.showCreateForm.set(false);
  }

  /**
   * Reset form
   */
  resetForm(): void {
    this.taskForm = {
      title: '',
      description: '',
      status: 'Pending',
      priority: 'Medium',
    };
  }

  /**
   * Get status variant for badge
   */
  getStatusVariant(status: string): 'primary' | 'success' | 'warning' | 'danger' | 'secondary' {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'InProgress':
        return 'primary';
      case 'Pending':
        return 'warning';
      case 'Cancelled':
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  /**
   * Get priority variant for badge
   */
  getPriorityVariant(priority: string): 'primary' | 'success' | 'warning' | 'danger' | 'secondary' {
    switch (priority) {
      case 'Urgent':
        return 'danger';
      case 'High':
        return 'warning';
      case 'Medium':
        return 'primary';
      case 'Low':
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  /**
   * Retry loading
   */
  onRetryLoad = (): void => {
    this.loadTasks();
  };

  /**
   * Handle empty action - show create form
   */
  onEmptyAction = (): void => {
    this.showCreateForm.set(true);
  };
}
