import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from './base-http.service';

// Permission list - matches backend PermissionListDto
export interface PermissionList {
  id: number;
  name: string;
  description: string;
  resource: string;
  action: string;
  category: string;
  roleCount: number;
  createdAt: string;
}

// Permission details - matches backend PermissionDto
export interface Permission {
  id: number;
  name: string;
  description: string;
  resource: string;
  action: string;
  category: string;
  createdAt: string;
  updatedAt?: string | null;
}

// Create Permission Request - matches backend CreatePermissionDto
export interface CreatePermissionRequest {
  name: string;
  description?: string;
  resource: string;
  action: string;
  category: string;
}

// Update Permission Request - matches backend UpdatePermissionDto
export interface UpdatePermissionRequest {
  name?: string;
  description?: string;
  resource?: string;
  action?: string;
  category?: string;
}

// Permission Search - matches backend PermissionSearchDto
export interface PermissionSearch {
  name?: string;
  resource?: string;
  action?: string;
  category?: string;
  createdFrom?: string;
  createdTo?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDescending?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PermissionService extends BaseHttpService {
  private readonly endpoint = `${this.baseUrl}/permissions`;

  /**
   * Get list of permissions
   * @param search Optional search criteria
   * @returns Observable of permissions list
   */
  getPermissions(search?: PermissionSearch): Observable<PermissionList[]> {
    return this.get<PermissionList[]>(this.endpoint, search as Record<string, unknown> | undefined);
  }

  /**
   * Get permission by ID
   * @param id Permission ID
   * @returns Observable of permission details
   */
  getPermission(id: number): Observable<Permission> {
    return this.get<Permission>(`${this.endpoint}/${id}`);
  }

  /**
   * Create new permission
   * @param permissionData Permission creation data
   * @returns Observable of created permission
   */
  createPermission(permissionData: CreatePermissionRequest): Observable<Permission> {
    return this.post<Permission>(this.endpoint, permissionData);
  }

  /**
   * Update permission
   * @param id Permission ID
   * @param permissionData Permission update data
   * @returns Observable of updated permission
   */
  updatePermission(id: number, permissionData: UpdatePermissionRequest): Observable<Permission> {
    return this.put<Permission>(`${this.endpoint}/${id}`, permissionData);
  }

  /**
   * Delete permission
   * @param id Permission ID
   * @returns Observable of deletion result
   */
  deletePermission(id: number): Observable<boolean> {
    return this.delete<boolean>(`${this.endpoint}/${id}`);
  }

  /**
   * Get permissions assigned to a role
   * @param roleId Role ID
   * @returns Observable of role permissions
   */
  getPermissionsByRole(roleId: number): Observable<PermissionList[]> {
    return this.get<PermissionList[]>(`${this.endpoint}/role/${roleId}`);
  }
}

