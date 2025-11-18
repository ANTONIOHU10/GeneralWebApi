// Path: GeneralWebApi/Frontend/general-frontend/src/app/store/employee/employee.actions.ts
import { createAction, props } from '@ngrx/store';
import { Employee } from 'app/contracts/employees/employee.model';

// 加载员工列表
export const loadEmployees = createAction(
  '[Employee] Load Employees',
  props<{
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
    department?: string;
    employmentStatus?: string;
    sortBy?: string;
    sortDescending?: boolean;
  }>()
);

export const loadEmployeesSuccess = createAction(
  '[Employee] Load Employees Success',
  props<{
    employees: Employee[];
    totalItems: number;
    currentPage: number;
    pageSize: number;
  }>()
);

export const loadEmployeesFailure = createAction(
  '[Employee] Load Employees Failure',
  props<{ error: string }>()
);

// 加载单个员工
export const loadEmployee = createAction(
  '[Employee] Load Employee',
  props<{ id: string }>()
);

export const loadEmployeeSuccess = createAction(
  '[Employee] Load Employee Success',
  props<{ employee: Employee }>()
);

export const loadEmployeeFailure = createAction(
  '[Employee] Load Employee Failure',
  props<{ error: string }>()
);

// 创建员工
export const createEmployee = createAction(
  '[Employee] Create Employee',
  props<{ employee: Omit<Employee, 'id'> }>()
);

export const createEmployeeSuccess = createAction(
  '[Employee] Create Employee Success',
  props<{ employee: Employee }>()
);

export const createEmployeeFailure = createAction(
  '[Employee] Create Employee Failure',
  props<{ error: string }>()
);

// 更新员工
export const updateEmployee = createAction(
  '[Employee] Update Employee',
  props<{ id: string; employee: Partial<Employee> }>()
);

export const updateEmployeeSuccess = createAction(
  '[Employee] Update Employee Success',
  props<{ employee: Employee }>()
);

export const updateEmployeeFailure = createAction(
  '[Employee] Update Employee Failure',
  props<{ error: string }>()
);

// 删除员工
export const deleteEmployee = createAction(
  '[Employee] Delete Employee',
  props<{ id: string }>()
);

export const deleteEmployeeSuccess = createAction(
  '[Employee] Delete Employee Success',
  props<{ id: string }>()
);

export const deleteEmployeeFailure = createAction(
  '[Employee] Delete Employee Failure',
  props<{ error: string }>()
);

// 选择员工
export const selectEmployee = createAction(
  '[Employee] Select Employee',
  props<{ employee: Employee | null }>()
);

// 清除选择
export const clearSelectedEmployee = createAction(
  '[Employee] Clear Selected Employee'
);

// 设置过滤器
export const setFilters = createAction(
  '[Employee] Set Filters',
  props<{
    searchTerm?: string;
    department?: string;
    employmentStatus?: string;
    sortBy?: string;
    sortDescending?: boolean;
  }>()
);

// 清除过滤器
export const clearFilters = createAction('[Employee] Clear Filters');

// 设置分页
export const setPagination = createAction(
  '[Employee] Set Pagination',
  props<{
    currentPage?: number;
    pageSize?: number;
  }>()
);

// 清除错误
export const clearError = createAction('[Employee] Clear Error');

// 重置状态
export const resetEmployeeState = createAction('[Employee] Reset State');
