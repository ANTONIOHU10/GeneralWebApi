// src/app/core/services/employee.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@environments/environment';
import {
  Employee,
  BackendEmployee,
  PaginatedResponse,
} from 'app/contracts/employees/employee.model';
import { ApiResponse } from 'app/contracts/common/api-response';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  // 转换后端数据格式到前端格式
  private transformBackendEmployee(backendEmployee: BackendEmployee): Employee {
    return {
      id: backendEmployee.id.toString(),
      firstName: backendEmployee.firstName || '',
      lastName: backendEmployee.lastName || '',
      email: backendEmployee.email || '',
      phone: backendEmployee.phone || '',
      department: backendEmployee.departmentName || '',
      position: backendEmployee.positionTitle || '',
      hireDate: backendEmployee.hireDate
        ? new Date(backendEmployee.hireDate).toISOString().split('T')[0]
        : '',
      status:
        backendEmployee.employmentStatus === 'Active'
          ? 'Active'
          : backendEmployee.employmentStatus === 'Inactive'
            ? 'Inactive'
            : 'Terminated',
      avatar: backendEmployee.avatar || '',
      managerId: backendEmployee.managerId
        ? backendEmployee.managerId.toString()
        : null,
      salary: backendEmployee.salary || 0,
      address: (backendEmployee.address as Employee['address']) || undefined,
    };
  }

  // 获取所有员工
  getEmployees(params?: {
    page?: number;
    pageSize?: number;
    searchTerm?: string;
    department?: string;
    status?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }): Observable<ApiResponse<Employee[]>> {
    let url = `${this.baseUrl}/employees`;
    const queryParams = new URLSearchParams();

    if (params) {
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.pageSize)
        queryParams.append('pageSize', params.pageSize.toString());
      if (params.searchTerm)
        queryParams.append('searchTerm', params.searchTerm);
      if (params.department)
        queryParams.append('department', params.department);
      if (params.status) queryParams.append('status', params.status);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortDirection)
        queryParams.append('sortDirection', params.sortDirection);
    }

    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }

    return this.http
      .get<ApiResponse<PaginatedResponse<BackendEmployee>>>(url)
      .pipe(
        map(response => ({
          ...response,
          data: response.data.items.map(item =>
            this.transformBackendEmployee(item)
          ),
          pagination: {
            totalItems: response.data.totalCount,
            currentPage: response.data.pageNumber,
            pageSize: response.data.pageSize,
            totalPages: response.data.totalPages,
          },
        }))
      );
  }

  // 根据ID获取员工
  getEmployeeById(id: string): Observable<Employee> {
    return this.http
      .get<ApiResponse<BackendEmployee>>(`${this.baseUrl}/employees/${id}`)
      .pipe(map(response => this.transformBackendEmployee(response.data)));
  }

  // 创建员工
  createEmployee(employee: Omit<Employee, 'id'>): Observable<Employee> {
    return this.http
      .post<ApiResponse<BackendEmployee>>(`${this.baseUrl}/employees`, employee)
      .pipe(map(response => this.transformBackendEmployee(response.data)));
  }

  // 更新员工
  updateEmployee(
    id: string,
    employee: Partial<Employee>
  ): Observable<Employee> {
    return this.http
      .put<
        ApiResponse<BackendEmployee>
      >(`${this.baseUrl}/employees/${id}`, employee)
      .pipe(map(response => this.transformBackendEmployee(response.data)));
  }

  // 删除员工
  deleteEmployee(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/employees/${id}`);
  }

  // 搜索员工
  searchEmployees(query: string): Observable<ApiResponse<Employee[]>> {
    return this.http.get<ApiResponse<Employee[]>>(
      `${this.baseUrl}/employees/search`,
      {
        params: { q: query },
      }
    );
  }
}
