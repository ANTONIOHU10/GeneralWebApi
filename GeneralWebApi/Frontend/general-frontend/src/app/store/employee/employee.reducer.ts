// Path: GeneralWebApi/Frontend/general-frontend/src/app/store/employee/employee.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { initialEmployeeState } from './employee.state';
import * as EmployeeActions from './employee.actions';

export const employeeReducer = createReducer(
  initialEmployeeState,

  // 加载员工列表
  on(EmployeeActions.loadEmployees, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(EmployeeActions.loadEmployeesSuccess, (state, { employees, totalItems, currentPage, pageSize }) => ({
    ...state,
    employees,
    loading: false,
    error: null,
    pagination: {
      ...state.pagination,
      totalItems,
      currentPage,
      pageSize,
      totalPages: Math.ceil(totalItems / pageSize),
    },
  })),

  on(EmployeeActions.loadEmployeesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // 加载单个员工
  on(EmployeeActions.loadEmployee, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(EmployeeActions.loadEmployeeSuccess, (state, { employee }) => ({
    ...state,
    selectedEmployee: employee,
    loading: false,
    error: null,
  })),

  on(EmployeeActions.loadEmployeeFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // 创建员工
  on(EmployeeActions.createEmployee, (state) => ({
    ...state,
    operationInProgress: {
      loading: true,
      operation: 'create' as const,
      employeeId: null,
    },
    error: null,
  })),

  on(EmployeeActions.createEmployeeSuccess, (state, { employee }) => ({
    ...state,
    employees: [...state.employees, employee],
    operationInProgress: {
      loading: false,
      operation: null,
      employeeId: null,
    },
    error: null,
  })),

  on(EmployeeActions.createEmployeeFailure, (state, { error }) => ({
    ...state,
    operationInProgress: {
      loading: false,
      operation: null,
      employeeId: null,
    },
    error,
  })),

  // 更新员工
  on(EmployeeActions.updateEmployee, (state, { id }) => ({
    ...state,
    operationInProgress: {
      loading: true,
      operation: 'update' as const,
      employeeId: id,
    },
    error: null,
  })),

  on(EmployeeActions.updateEmployeeSuccess, (state, { employee }) => ({
    ...state,
    employees: state.employees.map(emp => 
      emp.id === employee.id ? employee : emp
    ),
    selectedEmployee: state.selectedEmployee?.id === employee.id ? employee : state.selectedEmployee,
    operationInProgress: {
      loading: false,
      operation: null,
      employeeId: null,
    },
    error: null,
  })),

  on(EmployeeActions.updateEmployeeFailure, (state, { error }) => ({
    ...state,
    operationInProgress: {
      loading: false,
      operation: null,
      employeeId: null,
    },
    error,
  })),

  // 删除员工
  on(EmployeeActions.deleteEmployee, (state, { id }) => ({
    ...state,
    operationInProgress: {
      loading: true,
      operation: 'delete' as const,
      employeeId: id,
    },
    error: null,
  })),

  on(EmployeeActions.deleteEmployeeSuccess, (state, { id }) => ({
    ...state,
    employees: state.employees.filter(emp => emp.id !== id),
    selectedEmployee: state.selectedEmployee?.id === id ? null : state.selectedEmployee,
    operationInProgress: {
      loading: false,
      operation: null,
      employeeId: null,
    },
    error: null,
  })),

  on(EmployeeActions.deleteEmployeeFailure, (state, { error }) => ({
    ...state,
    operationInProgress: {
      loading: false,
      operation: null,
      employeeId: null,
    },
    error,
  })),

  // 选择员工
  on(EmployeeActions.selectEmployee, (state, { employee }) => ({
    ...state,
    selectedEmployee: employee,
  })),

  // 清除选择
  on(EmployeeActions.clearSelectedEmployee, (state) => ({
    ...state,
    selectedEmployee: null,
  })),

  // 设置过滤器
  on(EmployeeActions.setFilters, (state, filters) => ({
    ...state,
    filters: {
      ...state.filters,
      ...filters,
    },
    pagination: {
      ...state.pagination,
      currentPage: 1, // 重置到第一页
    },
  })),

  // 清除过滤器
  on(EmployeeActions.clearFilters, (state) => ({
    ...state,
    filters: {
      searchTerm: '',
      department: '',
      status: '',
      sortBy: 'firstName',
      sortDirection: 'asc' as const,
    },
    pagination: {
      ...state.pagination,
      currentPage: 1,
    },
  })),

  // 设置分页
  on(EmployeeActions.setPagination, (state, pagination) => ({
    ...state,
    pagination: {
      ...state.pagination,
      ...pagination,
    },
  })),

  // 清除错误
  on(EmployeeActions.clearError, (state) => ({
    ...state,
    error: null,
  })),

  // 重置状态
  on(EmployeeActions.resetEmployeeState, () => initialEmployeeState)
);

