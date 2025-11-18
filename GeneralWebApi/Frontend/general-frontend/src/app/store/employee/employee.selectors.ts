// Path: GeneralWebApi/Frontend/general-frontend/src/app/store/employee/employee.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { EmployeeState } from './employee.state';

// 选择整个 employee 状态
export const selectEmployeeState =
  createFeatureSelector<EmployeeState>('employee');

// 基础选择器
export const selectAllEmployees = createSelector(
  selectEmployeeState,
  (state: EmployeeState) => state.employees
);

export const selectSelectedEmployee = createSelector(
  selectEmployeeState,
  (state: EmployeeState) => state.selectedEmployee
);

export const selectEmployeeLoading = createSelector(
  selectEmployeeState,
  (state: EmployeeState) => state.loading
);

export const selectEmployeeError = createSelector(
  selectEmployeeState,
  (state: EmployeeState) => state.error
);

export const selectEmployeePagination = createSelector(
  selectEmployeeState,
  (state: EmployeeState) => state.pagination
);

export const selectEmployeeFilters = createSelector(
  selectEmployeeState,
  (state: EmployeeState) => state.filters
);

export const selectOperationInProgress = createSelector(
  selectEmployeeState,
  (state: EmployeeState) => state.operationInProgress
);

// 复合选择器
export const selectFilteredEmployees = createSelector(
  selectAllEmployees,
  selectEmployeeFilters,
  (employees, filters) => {
    let filtered = [...employees];

    // 按搜索词过滤
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        employee =>
          employee.firstName.toLowerCase().includes(searchTerm) ||
          employee.lastName.toLowerCase().includes(searchTerm) ||
          employee.email.toLowerCase().includes(searchTerm) ||
          employee.department?.toLowerCase().includes(searchTerm) ||
          employee.position?.toLowerCase().includes(searchTerm)
      );
    }

    // 按部门过滤
    if (filters.department) {
      filtered = filtered.filter(
        employee => employee.department === filters.department
      );
    }

    // 按状态过滤
    if (filters.employmentStatus) {
      filtered = filtered.filter(
        employee => employee.status === filters.employmentStatus
      );
    }

    // 排序
    filtered.sort((a, b) => {
      const aValue = getNestedValue(
        a as unknown as Record<string, unknown>,
        filters.sortBy
      );
      const bValue = getNestedValue(
        b as unknown as Record<string, unknown>,
        filters.sortBy
      );

      const aStr = String(aValue ?? '');
      const bStr = String(bValue ?? '');

      // sortDescending: false = ascending, true = descending
      if (aStr < bStr) return filters.sortDescending ? 1 : -1;
      if (aStr > bStr) return filters.sortDescending ? -1 : 1;
      return 0;
    });

    return filtered;
  }
);

export const selectEmployeeById = (id: string) =>
  createSelector(selectAllEmployees, employees =>
    employees.find(employee => employee.id === id)
  );

export const selectEmployeesByDepartment = (department: string) =>
  createSelector(selectAllEmployees, employees =>
    employees.filter(employee => employee.department === department)
  );

export const selectActiveEmployees = createSelector(
  selectAllEmployees,
  employees => employees.filter(employee => employee.status === 'Active')
);

export const selectEmployeeStats = createSelector(
  selectAllEmployees,
  employees => {
    const total = employees.length;
    const active = employees.filter(emp => emp.status === 'Active').length;
    const inactive = employees.filter(emp => emp.status === 'Inactive').length;
    const terminated = employees.filter(
      emp => emp.status === 'Terminated'
    ).length;

    const departments = [
      ...new Set(employees.map(emp => emp.department).filter(Boolean)),
    ];

    return {
      total,
      active,
      inactive,
      terminated,
      departments: departments.length,
    };
  }
);

export const selectIsEmployeeLoading = (
  operation?: 'create' | 'update' | 'delete'
) =>
  createSelector(selectOperationInProgress, operationState => {
    if (!operation) return operationState.loading;
    return operationState.loading && operationState.operation === operation;
  });

export const selectIsEmployeeOperationInProgress = createSelector(
  selectOperationInProgress,
  operationState => operationState.loading
);

// 辅助函数
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return (
    path
      .split('.')
      .reduce<unknown>(
        (current, key) => (current as Record<string, unknown>)?.[key],
        obj
      ) ?? ''
  );
}
