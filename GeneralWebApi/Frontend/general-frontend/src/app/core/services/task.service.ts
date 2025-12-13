// Path: GeneralWebApi/Frontend/general-frontend/src/app/core/services/task.service.ts
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BaseHttpService } from './base-http.service';
import {
  Task,
  BackendTask,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskSearchParams,
  TaskListDto,
} from 'app/contracts/tasks/task.model';
import { ApiResponse } from 'app/contracts/common/api-response';
import { PagedResult } from 'app/contracts/contracts/contract.model';

@Injectable({
  providedIn: 'root',
})
export class TaskService extends BaseHttpService {
  private readonly endpoint = `${this.baseUrl}/tasks`;

  // Transform backend data format to frontend format
  private transformBackendTask(backendTask: BackendTask): Task {
    return {
      id: backendTask.id.toString(),
      title: backendTask.title,
      description: backendTask.description || null,
      status: backendTask.status as Task['status'],
      priority: backendTask.priority as Task['priority'],
      dueDate: backendTask.dueDate || null,
      completedAt: backendTask.completedAt || null,
      userId: backendTask.userId,
      category: backendTask.category || null,
      estimatedHours: backendTask.estimatedHours || null,
      actualHours: backendTask.actualHours || null,
      createdAt: backendTask.createdAt,
      createdBy: backendTask.createdBy,
      updatedAt: backendTask.updatedAt || null,
      updatedBy: backendTask.updatedBy || null,
    };
  }

  // Get paginated list of tasks
  getTasks(params?: TaskSearchParams): Observable<ApiResponse<Task[]>> {
    return this.get<ApiResponse<PagedResult<TaskListDto>>>(
      this.endpoint,
      params as Record<string, unknown>,
      { extractData: false } // Don't extract data, need to handle pagination
    ).pipe(
      map((response: ApiResponse<PagedResult<TaskListDto>>) => {
        if (!response.data) {
          throw new Error(response.message || 'Response data is missing');
        }
        // Transform TaskListDto to Task format
        const tasks: Task[] = response.data.items.map((item: TaskListDto) => ({
          id: item.id.toString(),
          title: item.title,
          description: null, // Not in TaskListDto, will be null
          status: item.status as Task['status'],
          priority: item.priority as Task['priority'],
          dueDate: item.dueDate || null,
          completedAt: null, // Not in TaskListDto
          userId: '', // Not in TaskListDto
          category: item.category || null,
          estimatedHours: null, // Not in TaskListDto
          actualHours: null, // Not in TaskListDto
          createdAt: item.createdAt,
          createdBy: '', // Not in TaskListDto
          updatedAt: null, // Not in TaskListDto
          updatedBy: null, // Not in TaskListDto
          isOverdue: item.isOverdue,
        }));
        return {
          ...response,
          data: tasks,
          pagination: {
            totalItems: response.data.totalCount,
            currentPage: response.data.pageNumber,
            pageSize: response.data.pageSize,
            totalPages: Math.ceil(response.data.totalCount / response.data.pageSize),
          },
        };
      })
    );
  }

  // Get task by ID
  getTaskById(id: string): Observable<Task> {
    return this.get<BackendTask>(`${this.endpoint}/${id}`).pipe(
      map(backendTask => this.transformBackendTask(backendTask))
    );
  }

  // Create new task
  createTask(task: CreateTaskRequest): Observable<Task> {
    return this.post<BackendTask>(this.endpoint, task).pipe(
      map(backendTask => this.transformBackendTask(backendTask))
    );
  }

  // Update task
  updateTask(id: string, task: Omit<UpdateTaskRequest, 'id'>): Observable<Task> {
    const updateRequest: UpdateTaskRequest = {
      id: parseInt(id, 10),
      ...task,
    };
    return this.put<BackendTask>(`${this.endpoint}/${id}`, updateRequest).pipe(
      map(backendTask => this.transformBackendTask(backendTask))
    );
  }

  // Delete task
  deleteTask(id: string): Observable<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }
}

