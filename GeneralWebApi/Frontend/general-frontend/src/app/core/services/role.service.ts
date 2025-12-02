import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from './base-http.service';

// Role list - matches backend RoleListDto
export interface RoleList {
  id: number;
  name: string;
  description: string;
  employeeCount: number;
  permissionCount: number;
  createdAt: string;
}

// Role details - matches backend RoleDto
export interface Role {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt?: string | null;
  permissions: Permission[];
  employeeCount: number;
}

// Permission - matches backend PermissionDto
export interface Permission {
  id: number;
  name: string;
  description?: string | null;
}

// Create Role Request - matches backend CreateRoleDto
export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissionIds?: number[];
}

// Update Role Request - matches backend UpdateRoleDto
export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissionIds?: number[];
}

// Role Search - matches backend RoleSearchDto
export interface RoleSearch {
  name?: string;
  description?: string;
  minEmployeeCount?: number;
  maxEmployeeCount?: number;
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
export class RoleService extends BaseHttpService {
  private readonly endpoint = `${this.baseUrl}/roles`;

  /**
   * Get list of roles
   * @param search Optional search criteria
   * @returns Observable of roles list
   */
  getRoles(search?: RoleSearch): Observable<RoleList[]> {
    return this.get<RoleList[]>(this.endpoint, search as Record<string, unknown> | undefined);
  }

  /**
   * Get role by ID
   * @param id Role ID
   * @returns Observable of role details
   */
  getRole(id: number): Observable<Role> {
    return this.get<Role>(`${this.endpoint}/${id}`);
  }

  /**
   * Create new role
   * @param roleData Role creation data
   * @returns Observable of created role
   */
  createRole(roleData: CreateRoleRequest): Observable<Role> {
    return this.post<Role>(this.endpoint, roleData);
  }

  /**
   * Update role
   * @param id Role ID
   * @param roleData Role update data
   * @returns Observable of updated role
   */
  updateRole(id: number, roleData: UpdateRoleRequest): Observable<Role> {
    return this.put<Role>(`${this.endpoint}/${id}`, roleData);
  }

  /**
   * Delete role
   * @param id Role ID
   * @returns Observable of deletion result
   */
  deleteRole(id: number): Observable<boolean> {
    return this.delete<boolean>(`${this.endpoint}/${id}`);
  }

  /**
   * Get roles assigned to an employee
   * @param employeeId Employee ID
   * @returns Observable of employee roles
   */
  getRolesByEmployee(employeeId: number): Observable<RoleList[]> {
    return this.get<RoleList[]>(`${this.endpoint}/employee/${employeeId}`);
  }
}

