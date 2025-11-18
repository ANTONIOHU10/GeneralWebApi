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
    // Transform address fields
    // Check if any address field has a value (not empty string)
    const hasAddressData = 
      (backendEmployee.address && backendEmployee.address.trim() !== '') ||
      (backendEmployee.city && backendEmployee.city.trim() !== '') ||
      (backendEmployee.postalCode && backendEmployee.postalCode.trim() !== '') ||
      (backendEmployee.country && backendEmployee.country.trim() !== '');
    
    const address = hasAddressData
      ? {
          street: backendEmployee.address || '',
          city: backendEmployee.city || '',
          state: '', // Backend doesn't have state field
          zipCode: backendEmployee.postalCode || '',
          country: backendEmployee.country || '',
        }
      : undefined;

    // Transform emergency contact
    // Check if any emergency contact field has a value (not empty string)
    const hasEmergencyContactData = 
      (backendEmployee.emergencyContactName && backendEmployee.emergencyContactName.trim() !== '') ||
      (backendEmployee.emergencyContactPhone && backendEmployee.emergencyContactPhone.trim() !== '') ||
      (backendEmployee.emergencyContactRelation && backendEmployee.emergencyContactRelation.trim() !== '');
    
    const emergencyContact = hasEmergencyContactData
      ? {
          name: backendEmployee.emergencyContactName || '',
          phone: backendEmployee.emergencyContactPhone || '',
          relation: backendEmployee.emergencyContactRelation || '',
        }
      : undefined;

    return {
      id: backendEmployee.id.toString(),
      firstName: backendEmployee.firstName || '',
      lastName: backendEmployee.lastName || '',
      employeeNumber: backendEmployee.employeeNumber || undefined,
      email: backendEmployee.email || '',
      phone: backendEmployee.phoneNumber || undefined,
      departmentId: backendEmployee.departmentId || null,
      department: backendEmployee.departmentName || undefined,
      positionId: backendEmployee.positionId || null,
      position: backendEmployee.positionTitle || undefined,
      managerId: backendEmployee.managerId ? backendEmployee.managerId.toString() : null,
      managerName: backendEmployee.managerName || undefined,
      hireDate: backendEmployee.hireDate
        ? new Date(backendEmployee.hireDate).toISOString().split('T')[0]
        : undefined,
      terminationDate: backendEmployee.terminationDate
        ? new Date(backendEmployee.terminationDate).toISOString().split('T')[0]
        : undefined,
      status:
        backendEmployee.employmentStatus === 'Active'
          ? 'Active'
          : backendEmployee.employmentStatus === 'Inactive'
            ? 'Inactive'
            : 'Terminated',
      employmentType: backendEmployee.employmentType || undefined,
      isManager: backendEmployee.isManager || false,
      workingHoursPerWeek: backendEmployee.workingHoursPerWeek || null,
      salary: backendEmployee.currentSalary || undefined,
      salaryCurrency: backendEmployee.salaryCurrency || undefined,
      lastSalaryIncreaseDate: backendEmployee.lastSalaryIncreaseDate
        ? new Date(backendEmployee.lastSalaryIncreaseDate).toISOString().split('T')[0]
        : undefined,
      nextSalaryIncreaseDate: backendEmployee.nextSalaryIncreaseDate
        ? new Date(backendEmployee.nextSalaryIncreaseDate).toISOString().split('T')[0]
        : undefined,
      contractEndDate: backendEmployee.contractEndDate
        ? new Date(backendEmployee.contractEndDate).toISOString().split('T')[0]
        : undefined,
      contractType: backendEmployee.contractType || undefined,
      avatar: backendEmployee.avatar || undefined,
      address,
      emergencyContact,
      taxCode: backendEmployee.taxCode || undefined,
      createdAt: backendEmployee.createdAt || undefined,
      createdBy: backendEmployee.createdBy || undefined,
      updatedAt: backendEmployee.updatedAt || null,
      updatedBy: backendEmployee.updatedBy || null,
      isActive: backendEmployee.isActive !== undefined ? backendEmployee.isActive : true,
      version: backendEmployee.version || undefined,
      sortOrder: backendEmployee.sortOrder || undefined,
      remarks: backendEmployee.remarks || null,
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
      map((response: ApiResponse<PaginatedResponse<BackendEmployee>>) => {
        if (!response.data) {
          throw new Error(response.message || 'Response data is missing');
        }
        return {
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
        };
      })
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
    // Format salary to ensure precision before sending to backend
    // This prevents floating point precision issues with JavaScript number type
    const formatSalary = (salary: number | undefined | null): number | null => {
      if (salary === null || salary === undefined) return null;
      return parseFloat(Number(salary).toFixed(2));
    };

    // Ensure salary precision in the request object
    const formattedEmployee = {
      ...employee,
      ...(employee.currentSalary !== undefined && employee.currentSalary !== null
        ? { currentSalary: formatSalary(employee.currentSalary) }
        : {}),
    };

    return this.post<BackendEmployee>(this.endpoint, formattedEmployee).pipe(
      map(backendEmployee => this.transformBackendEmployee(backendEmployee))
    );
  }

  // 转换前端 Employee 格式到后端 UpdateEmployeeDto 格式
  private transformEmployeeToUpdateDto(
    id: string,
    employee: Partial<Employee>
  ): any {
    // 确保日期格式正确（ISO 8601）
    const formatDate = (dateStr: string | undefined | null): string => {
      if (!dateStr) return '';
      // 如果已经是 ISO 格式（包含 T），直接返回
      if (dateStr.includes('T')) return dateStr;
      // 否则转换为 ISO 格式
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      return date.toISOString();
    };

    // 确保薪资精度（保留2位小数，避免浮点数精度问题）
    const formatSalary = (salary: number | undefined | null): number | null => {
      if (salary === null || salary === undefined) return null;
      // 使用 toFixed(2) 确保2位小数，然后转换回 number
      // 这样可以避免 JavaScript number 类型的浮点数精度问题
      return parseFloat(Number(salary).toFixed(2));
    };

    return {
      Id: parseInt(id, 10),
      FirstName: employee.firstName || '',
      LastName: employee.lastName || '',
      EmployeeNumber: employee.employeeNumber || '',
      Email: employee.email || '',
      // PhoneNumber: 实体中没有此字段，但 DTO 中有，保留以保持兼容性
      PhoneNumber: employee.phone || '',
      DepartmentId: employee.departmentId ?? null,
      PositionId: employee.positionId ?? null,
      ManagerId: employee.managerId ? parseInt(employee.managerId, 10) : null,
      HireDate: formatDate(employee.hireDate),
      TerminationDate: employee.terminationDate ? formatDate(employee.terminationDate) : null,
      EmploymentStatus: employee.status || '',
      EmploymentType: employee.employmentType || '',
      CurrentSalary: formatSalary(employee.salary),
      SalaryCurrency: employee.salaryCurrency || null,
      Address: employee.address?.street || '',
      City: employee.address?.city || '',
      PostalCode: employee.address?.zipCode || '',
      Country: employee.address?.country || '',
      EmergencyContactName: employee.emergencyContact?.name || '',
      EmergencyContactPhone: employee.emergencyContact?.phone || '',
      EmergencyContactRelation: employee.emergencyContact?.relation || '',
      // TaxCode: 如果前端提供了，则包含；否则不包含（更新时保留原有值）
      ...(employee.taxCode ? { TaxCode: employee.taxCode } : {}),
    };
  }

  // 更新员工 - 自动提取 data，转换数据格式以匹配后端 UpdateEmployeeDto
  updateEmployee(
    id: string,
    employee: Partial<Employee>
  ): Observable<Employee> {
    // Convert Employee format to UpdateEmployeeDto format
    const updateDto = this.transformEmployeeToUpdateDto(id, employee);
    return this.put<BackendEmployee>(`${this.endpoint}/${id}`, updateDto).pipe(
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
