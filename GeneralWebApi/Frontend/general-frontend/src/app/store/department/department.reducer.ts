// Path: GeneralWebApi/Frontend/general-frontend/src/app/store/department/department.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { initialDepartmentState } from './department.state';
import * as DepartmentActions from './department.actions';

export const departmentReducer = createReducer(
  initialDepartmentState,

  // Load departments list
  on(DepartmentActions.loadDepartments, state => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(
    DepartmentActions.loadDepartmentsSuccess,
    (state, { departments, totalItems, currentPage, pageSize }) => ({
      ...state,
      departments,
      loading: false,
      error: null,
      pagination: {
        ...state.pagination,
        totalItems,
        currentPage,
        pageSize,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    })
  ),

  on(DepartmentActions.loadDepartmentsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Load single department
  on(DepartmentActions.loadDepartment, state => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(DepartmentActions.loadDepartmentSuccess, (state, { department }) => ({
    ...state,
    selectedDepartment: department,
    loading: false,
    error: null,
  })),

  on(DepartmentActions.loadDepartmentFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Create department
  on(DepartmentActions.createDepartment, state => ({
    ...state,
    operationInProgress: {
      loading: true,
      operation: 'create' as const,
      departmentId: null,
    },
    error: null,
  })),

  on(DepartmentActions.createDepartmentSuccess, (state, { department }) => ({
    ...state,
    departments: [...state.departments, department],
    operationInProgress: {
      loading: false,
      operation: null,
      departmentId: null,
    },
    error: null,
  })),

  on(DepartmentActions.createDepartmentFailure, (state, { error }) => ({
    ...state,
    operationInProgress: {
      loading: false,
      operation: null,
      departmentId: null,
    },
    error,
  })),

  // Update department
  on(DepartmentActions.updateDepartment, (state, { id }) => ({
    ...state,
    operationInProgress: {
      loading: true,
      operation: 'update' as const,
      departmentId: id,
    },
    error: null,
  })),

  on(DepartmentActions.updateDepartmentSuccess, (state, { department }) => ({
    ...state,
    departments: state.departments.map(dept =>
      dept.id === department.id ? department : dept
    ),
    selectedDepartment:
      state.selectedDepartment?.id === department.id
        ? department
        : state.selectedDepartment,
    operationInProgress: {
      loading: false,
      operation: null,
      departmentId: null,
    },
    error: null,
  })),

  on(DepartmentActions.updateDepartmentFailure, (state, { error }) => ({
    ...state,
    operationInProgress: {
      loading: false,
      operation: null,
      departmentId: null,
    },
    error,
  })),

  // Delete department
  on(DepartmentActions.deleteDepartment, (state, { id }) => ({
    ...state,
    operationInProgress: {
      loading: true,
      operation: 'delete' as const,
      departmentId: id,
    },
    error: null,
  })),

  on(DepartmentActions.deleteDepartmentSuccess, (state, { id }) => ({
    ...state,
    departments: state.departments.filter(dept => dept.id !== id),
    selectedDepartment:
      state.selectedDepartment?.id === id ? null : state.selectedDepartment,
    operationInProgress: {
      loading: false,
      operation: null,
      departmentId: null,
    },
    error: null,
  })),

  on(DepartmentActions.deleteDepartmentFailure, (state, { error }) => ({
    ...state,
    operationInProgress: {
      loading: false,
      operation: null,
      departmentId: null,
    },
    error,
  })),

  // Select department
  on(DepartmentActions.selectDepartment, (state, { department }) => ({
    ...state,
    selectedDepartment: department,
  })),

  // Clear selection
  on(DepartmentActions.clearSelectedDepartment, state => ({
    ...state,
    selectedDepartment: null,
  })),

  // Set filters
  on(DepartmentActions.setFilters, (state, filters) => ({
    ...state,
    filters: {
      ...state.filters,
      ...filters,
    },
    pagination: {
      ...state.pagination,
      currentPage: 1,
    },
  })),

  // Clear filters
  on(DepartmentActions.clearFilters, state => ({
    ...state,
    filters: {
      searchTerm: '',
      parentDepartmentId: null,
      level: null,
      sortBy: 'name',
      sortDescending: false,
    },
    pagination: {
      ...state.pagination,
      currentPage: 1,
    },
  })),

  // Set pagination
  on(DepartmentActions.setPagination, (state, pagination) => ({
    ...state,
    pagination: {
      ...state.pagination,
      ...pagination,
    },
  })),

  // Clear error
  on(DepartmentActions.clearError, state => ({
    ...state,
    error: null,
  })),

  // Reset state
  on(DepartmentActions.resetDepartmentState, () => initialDepartmentState)
);

