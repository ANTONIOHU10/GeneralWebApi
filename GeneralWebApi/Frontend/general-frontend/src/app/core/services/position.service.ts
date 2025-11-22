// Path: GeneralWebApi/Frontend/general-frontend/src/app/core/services/position.service.ts
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BaseHttpService } from './base-http.service';
import {
  Position,
  BackendPosition,
  CreatePositionRequest,
  UpdatePositionRequest,
  PositionSearchParams,
} from 'app/contracts/positions/position.model';
import { ApiResponse } from 'app/contracts/common/api-response';

@Injectable({
  providedIn: 'root',
})
export class PositionService extends BaseHttpService {
  private readonly endpoint = `${this.baseUrl}/positions`;

  // Transform backend position data format to frontend format
  private transformBackendPosition(backendPosition: BackendPosition): Position {
    return {
      id: backendPosition.id.toString(),
      title: backendPosition.title || '',
      code: backendPosition.code || '',
      description: backendPosition.description || '',
      departmentId: backendPosition.departmentId || 0,
      departmentName: backendPosition.departmentName || null,
      level: backendPosition.level || 1,
      parentPositionId: backendPosition.parentPositionId || null,
      parentPositionTitle: backendPosition.parentPositionTitle || null,
      minSalary: backendPosition.minSalary || null,
      maxSalary: backendPosition.maxSalary || null,
      isManagement: backendPosition.isManagement || false,
      createdAt: backendPosition.createdAt || undefined,
      updatedAt: backendPosition.updatedAt || null,
    };
  }

  // Get paginated list of positions
  getPositions(params?: PositionSearchParams): Observable<ApiResponse<Position[]>> {
    return this.get<ApiResponse<{ items: BackendPosition[]; totalCount: number; pageNumber: number; pageSize: number; totalPages: number }>>(
      this.endpoint,
      params as Record<string, unknown>,
      { extractData: false }
    ).pipe(
      map((response: ApiResponse<{ items: BackendPosition[]; totalCount: number; pageNumber: number; pageSize: number; totalPages: number }>) => {
        if (!response.data) {
          throw new Error(response.message || 'Response data is missing');
        }
        return {
          ...response,
          data: response.data.items.map((item: BackendPosition) =>
            this.transformBackendPosition(item)
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

  // Get position by ID
  getPositionById(id: string): Observable<Position> {
    return this.get<BackendPosition>(`${this.endpoint}/${id}`).pipe(
      map(backendPosition => this.transformBackendPosition(backendPosition))
    );
  }

  // Create position
  createPosition(position: CreatePositionRequest): Observable<Position> {
    return this.post<BackendPosition>(this.endpoint, position).pipe(
      map(backendPosition => this.transformBackendPosition(backendPosition))
    );
  }

  // Transform frontend Position format to backend UpdatePositionDto format
  private transformPositionToUpdateDto(
    id: string,
    position: Partial<Position>
  ): UpdatePositionRequest {
    return {
      Id: parseInt(id, 10),
      Title: position.title || '',
      Code: position.code || '',
      Description: position.description || '',
      DepartmentId: position.departmentId || 0,
      Level: position.level || 1,
      ParentPositionId: position.parentPositionId ?? null,
      MinSalary: position.minSalary ?? null,
      MaxSalary: position.maxSalary ?? null,
      IsManagement: position.isManagement ?? false,
    };
  }

  // Update position
  updatePosition(
    id: string,
    position: Partial<Position>
  ): Observable<Position> {
    const updateDto = this.transformPositionToUpdateDto(id, position);
    return this.put<BackendPosition>(`${this.endpoint}/${id}`, updateDto).pipe(
      map(backendPosition => this.transformBackendPosition(backendPosition))
    );
  }

  // Delete position
  deletePosition(id: string): Observable<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }

  // Get positions by department
  getPositionsByDepartment(departmentId: number): Observable<Position[]> {
    return this.get<BackendPosition[]>(`${this.endpoint}/department/${departmentId}`).pipe(
      map(backendPositions =>
        backendPositions.map(item => this.transformBackendPosition(item))
      )
    );
  }

  // Search positions with advanced filters
  searchPositionsWithFilters(searchParams: {
    title?: string;
    code?: string;
    description?: string;
    departmentId?: number | null;
    level?: number | null;
    isManagement?: boolean | null;
  }): Observable<Position[]> {
    // Build query parameters, only including non-empty values
    const params: Record<string, string> = {};

    if (searchParams.title && searchParams.title.trim()) {
      params['title'] = searchParams.title.trim();
    }
    if (searchParams.code && searchParams.code.trim()) {
      params['code'] = searchParams.code.trim();
    }
    if (searchParams.description && searchParams.description.trim()) {
      params['description'] = searchParams.description.trim();
    }
    if (searchParams.departmentId !== null && searchParams.departmentId !== undefined) {
      params['departmentId'] = searchParams.departmentId.toString();
    }
    if (searchParams.level !== null && searchParams.level !== undefined) {
      params['level'] = searchParams.level.toString();
    }
    if (searchParams.isManagement !== null && searchParams.isManagement !== undefined) {
      params['isManagement'] = searchParams.isManagement.toString();
    }

    return this.get<BackendPosition[]>(`${this.endpoint}/search`, params).pipe(
      map(backendPositions =>
        backendPositions.map(item => this.transformBackendPosition(item))
      )
    );
  }
}

