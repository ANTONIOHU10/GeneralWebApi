// Path: GeneralWebApi/Frontend/general-frontend/src/app/store/department/department.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DepartmentState } from './department.state';

// Select entire department state
export const selectDepartmentState =
  createFeatureSelector<DepartmentState>('department');

// Basic selectors
export const selectAllDepartments = createSelector(
  selectDepartmentState,
  (state: DepartmentState) => state.departments
);

export const selectSelectedDepartment = createSelector(
  selectDepartmentState,
  (state: DepartmentState) => state.selectedDepartment
);

export const selectDepartmentLoading = createSelector(
  selectDepartmentState,
  (state: DepartmentState) => state.loading
);

export const selectDepartmentError = createSelector(
  selectDepartmentState,
  (state: DepartmentState) => state.error
);

export const selectDepartmentPagination = createSelector(
  selectDepartmentState,
  (state: DepartmentState) => state.pagination
);

export const selectDepartmentFilters = createSelector(
  selectDepartmentState,
  (state: DepartmentState) => state.filters
);

export const selectOperationInProgress = createSelector(
  selectDepartmentState,
  (state: DepartmentState) => state.operationInProgress
);

// Composite selectors
export const selectFilteredDepartments = createSelector(
  selectAllDepartments,
  selectDepartmentFilters,
  (departments, filters) => {
    let filtered = [...departments];

    // Filter by search term
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        dept =>
          dept.name.toLowerCase().includes(searchTerm) ||
          dept.code.toLowerCase().includes(searchTerm) ||
          dept.description.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by parent department
    if (filters.parentDepartmentId !== null) {
      filtered = filtered.filter(
        dept => dept.parentDepartmentId === filters.parentDepartmentId
      );
    }

    // Filter by level
    if (filters.level !== null) {
      filtered = filtered.filter(dept => dept.level === filters.level);
    }

    // Sort
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

export const selectDepartmentById = (id: string) =>
  createSelector(selectAllDepartments, departments =>
    departments.find(department => department.id === id)
  );

export const selectDepartmentsByParent = (parentId: number) =>
  createSelector(selectAllDepartments, departments =>
    departments.filter(dept => dept.parentDepartmentId === parentId)
  );

export const selectRootDepartments = createSelector(
  selectAllDepartments,
  departments => departments.filter(dept => dept.parentDepartmentId === null)
);

// Helper function
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

