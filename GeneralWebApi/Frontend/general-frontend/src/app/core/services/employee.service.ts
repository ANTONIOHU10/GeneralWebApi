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
  getEmployees(): Observable<ApiResponse<Employee[]>> {
    return this.http
      .get<
        ApiResponse<PaginatedResponse<BackendEmployee>>
      >(`${this.baseUrl}/employees`)
      .pipe(
        map(response => ({
          ...response,
          data: response.data.items.map(item =>
            this.transformBackendEmployee(item)
          ),
        }))
      );
  }

  // 根据ID获取员工
  getEmployeeById(id: string): Observable<ApiResponse<Employee>> {
    return this.http.get<ApiResponse<Employee>>(
      `${this.baseUrl}/employees/${id}`
    );
  }

  // 创建员工
  createEmployee(
    employee: Omit<Employee, 'id'>
  ): Observable<ApiResponse<Employee>> {
    return this.http.post<ApiResponse<Employee>>(
      `${this.baseUrl}/employees`,
      employee
    );
  }

  // 更新员工
  updateEmployee(
    id: string,
    employee: Partial<Employee>
  ): Observable<ApiResponse<Employee>> {
    return this.http.put<ApiResponse<Employee>>(
      `${this.baseUrl}/employees/${id}`,
      employee
    );
  }

  // 删除员工
  deleteEmployee(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.baseUrl}/employees/${id}`
    );
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
