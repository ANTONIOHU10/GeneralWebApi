// Path: GeneralWebApi/Frontend/general-frontend/src/app/core/services/employee.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BaseHttpService } from './base-http.service';
import { ActionService } from './action.service';
import {
  Employee,
  BackendEmployee,
  PaginatedResponse,
} from 'app/contracts/employees/employee.model';
import { ApiResponse } from 'app/contracts/common/api-response';

/**
 * Common options interface for employee action convenience methods
 */
export interface EmployeeActionOptions<TResult = void> {
  customMessage?: string;
  onSuccess?: (result: TResult) => void;
  onError?: (error: Error) => void;
  showSuccessNotification?: boolean | string;
  showErrorNotification?: boolean | string;
}

@Injectable({
  providedIn: 'root',
})
export class EmployeeService extends BaseHttpService {
  private readonly endpoint = `${this.baseUrl}/employees`;
  private actionService = inject(ActionService);

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

  // 获取所有员工 - 返回完整 ApiResponse（因为需要 pagination）
  getEmployees(params?: {
    page?: number;
    pageSize?: number;
    searchTerm?: string;
    department?: string;
    status?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }): Observable<ApiResponse<Employee[]>> {
    return this.get<ApiResponse<PaginatedResponse<BackendEmployee>>>(
      this.endpoint,
      params,
      { extractData: false } // 不提取 data，因为需要处理 pagination
    ).pipe(
      map((response: ApiResponse<PaginatedResponse<BackendEmployee>>) => ({
          ...response,
        data: response.data.items.map((item: BackendEmployee) =>
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

  // 根据ID获取员工 - 自动提取 data
  getEmployeeById(id: string): Observable<Employee> {
    return this.get<BackendEmployee>(`${this.endpoint}/${id}`).pipe(
      map(backendEmployee => this.transformBackendEmployee(backendEmployee))
    );
  }

  // 创建员工 - 自动提取 data
  // Accepts CreateEmployeeRequest which matches backend CreateEmployeeDto
  createEmployee(employee: Omit<Employee, 'id'> | any): Observable<Employee> {
    return this.post<BackendEmployee>(this.endpoint, employee).pipe(
      map(backendEmployee => this.transformBackendEmployee(backendEmployee))
    );
  }

  // 更新员工 - 自动提取 data
  updateEmployee(
    id: string,
    employee: Partial<Employee>
  ): Observable<Employee> {
    return this.put<BackendEmployee>(`${this.endpoint}/${id}`, employee).pipe(
      map(backendEmployee => this.transformBackendEmployee(backendEmployee))
    );
  }

  // 删除员工 - 自动处理，返回 void
  deleteEmployee(id: string): Observable<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }

  // 搜索员工 - 返回完整 ApiResponse
  searchEmployees(query: string): Observable<ApiResponse<Employee[]>> {
    return this.get<ApiResponse<Employee[]>>(
      `${this.endpoint}/search`,
      { q: query },
      { extractData: false } // 返回完整 ApiResponse
    );
  }

  // ========== Convenience methods using ActionService ==========

  /**
   * Delete employee with confirmation dialog and automatic response handling
   * Convenience method for feature layer
   */
  deleteEmployeeWithConfirm(
    employee: Employee,
    options?: EmployeeActionOptions<void>
  ): Observable<void> {
    const employeeName = `${employee.firstName} ${employee.lastName}`;
    const defaultMessage = `Are you sure you want to delete ${employeeName}? This action cannot be undone.`;
    const defaultSuccessMessage = `${employeeName} deleted successfully`;

    return this.executeEmployeeAction<void, void>({
      method: 'DELETE',
      endpoint: `${this.endpoint}/${employee.id}`,
      confirmConfig: {
        message: options?.customMessage || defaultMessage,
        title: 'Confirm Delete',
        variant: 'danger',
        icon: 'warning',
      },
      defaultSuccessMessage,
      options,
    });
  }

  /**
   * Update employee with confirmation dialog and automatic response handling
   */
  updateEmployeeWithConfirm(
    id: string,
    employee: Partial<Employee>,
    options?: EmployeeActionOptions<Employee>
  ): Observable<Employee> {
    const defaultMessage = 'Are you sure you want to save these changes?';
    const defaultSuccessMessage = 'Employee updated successfully';

    return this.executeEmployeeAction<Partial<Employee>, BackendEmployee, Employee>({
      method: 'PUT',
      endpoint: `${this.endpoint}/${id}`,
      body: employee,
      confirmConfig: {
        message: options?.customMessage || defaultMessage,
        title: 'Save Changes',
        variant: 'primary',
        icon: 'save',
      },
      defaultSuccessMessage,
      options,
      transformResponse: (backendEmployee) => this.transformBackendEmployee(backendEmployee),
    });
  }

  /**
   * Create employee with confirmation dialog and automatic response handling
   */
  createEmployeeWithConfirm(
    employee: Omit<Employee, 'id'>,
    options?: EmployeeActionOptions<Employee>
  ): Observable<Employee> {
    const defaultMessage = 'Are you sure you want to create this employee?';
    const defaultSuccessMessage = 'Employee created successfully';

    return this.executeEmployeeAction<Omit<Employee, 'id'>, BackendEmployee, Employee>({
      method: 'POST',
      endpoint: this.endpoint,
      body: employee,
      confirmConfig: {
        message: options?.customMessage || defaultMessage,
        title: 'Create Employee',
        variant: 'primary',
        icon: 'add',
      },
      defaultSuccessMessage,
      options,
      transformResponse: (backendEmployee) => this.transformBackendEmployee(backendEmployee),
    });
  }

  /**
   * Generic method to execute employee actions with confirmation
   * Reduces code duplication across convenience methods
   */
  private executeEmployeeAction<
    TRequest = unknown,
    TBackendResponse = unknown,
    TTransformedResponse = TBackendResponse
  >(config: {
    method: 'POST' | 'PUT' | 'DELETE';
    endpoint: string;
    body?: TRequest;
    confirmConfig: {
      message: string;
      title: string;
      variant?: 'primary' | 'danger' | 'warning';
      icon?: string;
    };
    defaultSuccessMessage: string;
    options?: EmployeeActionOptions<TTransformedResponse>;
    transformResponse?: (response: TBackendResponse) => TTransformedResponse;
  }): Observable<TTransformedResponse> {
    const action$ = this.actionService.execute<TRequest, TBackendResponse>({
      method: config.method,
      endpoint: config.endpoint,
      body: config.body,
      confirm: config.confirmConfig,
      showSuccessNotification: config.options?.showSuccessNotification !== false
        ? (typeof config.options?.showSuccessNotification === 'string'
          ? config.options.showSuccessNotification
          : config.defaultSuccessMessage)
        : false,
      showErrorNotification: config.options?.showErrorNotification !== false,
      onSuccess: (response) => {
        const transformed = config.transformResponse
          ? config.transformResponse(response)
          : (response as unknown as TTransformedResponse);
        config.options?.onSuccess?.(transformed);
      },
      onError: config.options?.onError,
    });

    // Apply transformation if provided
    if (config.transformResponse) {
      return action$.pipe(
        map((response) => config.transformResponse!(response))
      );
    }

    // When no transformation, TBackendResponse should be the same as TTransformedResponse
    return action$ as unknown as Observable<TTransformedResponse>;
  }
}
