// Path: GeneralWebApi/Frontend/general-frontend/src/app/core/services/department.service.ts
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BaseHttpService } from './base-http.service';
import {
  Department,
  BackendDepartment,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  DepartmentSearchParams,
} from 'app/contracts/departments/department.model';
import { ApiResponse } from 'app/contracts/common/api-response';

@Injectable({
  providedIn: 'root',
})
export class DepartmentService extends BaseHttpService {
  private readonly endpoint = `${this.baseUrl}/departments`;

  // Transform backend department data format to frontend format
  private transformBackendDepartment(backendDepartment: BackendDepartment): Department {
    return {
      id: backendDepartment.id.toString(),
      name: backendDepartment.name || '',
      code: backendDepartment.code || '',
      description: backendDepartment.description || '',
      parentDepartmentId: backendDepartment.parentDepartmentId || null,
      parentDepartmentName: backendDepartment.parentDepartmentName || null,
      level: backendDepartment.level || 1,
      path: backendDepartment.path || '',
      createdAt: backendDepartment.createdAt || undefined,
      updatedAt: backendDepartment.updatedAt || null,
    };
  }

  // Get paginated list of departments
  getDepartments(params?: DepartmentSearchParams): Observable<ApiResponse<Department[]>> {
    return this.get<ApiResponse<{ items: BackendDepartment[]; totalCount: number; pageNumber: number; pageSize: number; totalPages: number }>>(
      this.endpoint,
      params as Record<string, unknown>,
      { extractData: false }
    ).pipe(
      map((response: ApiResponse<{ items: BackendDepartment[]; totalCount: number; pageNumber: number; pageSize: number; totalPages: number }>) => {
        if (!response.data) {
          throw new Error(response.message || 'Response data is missing');
        }
        return {
          ...response,
          data: response.data.items.map((item: BackendDepartment) =>
            this.transformBackendDepartment(item)
          ),
          pagination: {
            totalItems: response.data.totalCount,
            currentPage: response.data.pageNumber,
            pageSize: response.data.pageSize,
            totalPages: response.data.totalPages,
          },
        };
      })
    );
  }

  // Get department by ID
  getDepartmentById(id: string): Observable<Department> {
    return this.get<BackendDepartment>(`${this.endpoint}/${id}`).pipe(
      map(backendDepartment => this.transformBackendDepartment(backendDepartment))
    );
  }

  // Create department
  createDepartment(department: CreateDepartmentRequest): Observable<Department> {
    return this.post<BackendDepartment>(this.endpoint, department).pipe(
      map(backendDepartment => this.transformBackendDepartment(backendDepartment))
    );
  }

  // Transform frontend Department format to backend UpdateDepartmentDto format
  private transformDepartmentToUpdateDto(
    id: string,
    department: Partial<Department>
  ): UpdateDepartmentRequest {
    return {
      Id: parseInt(id, 10),
      Name: department.name || '',
      Code: department.code || '',
      Description: department.description || '',
      ParentDepartmentId: department.parentDepartmentId ?? null,
      Level: department.level || 1,
      Path: department.path || '',
    };
  }

  // Update department
  updateDepartment(
    id: string,
    department: Partial<Department>
  ): Observable<Department> {
    const updateDto = this.transformDepartmentToUpdateDto(id, department);
    return this.put<BackendDepartment>(`${this.endpoint}/${id}`, updateDto).pipe(
      map(backendDepartment => this.transformBackendDepartment(backendDepartment))
    );
  }

  // Delete department
  deleteDepartment(id: string): Observable<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }

  // Get department hierarchy
  getDepartmentHierarchy(): Observable<Department[]> {
    return this.get<BackendDepartment[]>(`${this.endpoint}/hierarchy`).pipe(
      map(backendDepartments =>
        backendDepartments.map(item => this.transformBackendDepartment(item))
      )
    );
  }

  // Get departments by parent
  getDepartmentsByParent(parentId: number): Observable<Department[]> {
    return this.get<BackendDepartment[]>(`${this.endpoint}/parent/${parentId}`).pipe(
      map(backendDepartments =>
        backendDepartments.map(item => this.transformBackendDepartment(item))
      )
    );
  }
}

