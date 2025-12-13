// Path: GeneralWebApi/Frontend/general-frontend/src/app/contracts/tasks/task.model.ts

// Backend task data format - matches TaskDto
export interface BackendTask {
  id: number;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDate?: string | null;
  completedAt?: string | null;
  userId: string;
  category?: string | null;
  estimatedHours?: number | null;
  actualHours?: number | null;
  createdAt: string;
  createdBy: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

// Frontend task data format
export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: 'Pending' | 'InProgress' | 'Completed' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  dueDate?: string | null;
  completedAt?: string | null;
  userId: string;
  category?: string | null;
  estimatedHours?: number | null;
  actualHours?: number | null;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
  isOverdue?: boolean;
}

// Request DTO for creating task - matches backend CreateTaskDto
export interface CreateTaskRequest {
  title: string;
  description?: string | null;
  status?: string;
  priority?: string;
  dueDate?: string | null;
  category?: string | null;
  estimatedHours?: number | null;
}

// Request DTO for updating task - matches backend UpdateTaskDto
export interface UpdateTaskRequest {
  id: number;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDate?: string | null;
  completedAt?: string | null;
  category?: string | null;
  estimatedHours?: number | null;
  actualHours?: number | null;
}

// Search parameters - matches backend TaskSearchDto
export interface TaskSearchParams {
  searchTerm?: string;
  status?: string;
  priority?: string;
  category?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  sortBy?: string;
  sortDescending?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

// Task list DTO - matches backend TaskListDto
export interface TaskListDto {
  id: number;
  title: string;
  status: string;
  priority: string;
  dueDate?: string | null;
  category?: string | null;
  createdAt: string;
  isOverdue: boolean;
}

