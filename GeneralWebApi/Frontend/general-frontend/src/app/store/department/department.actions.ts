// Path: GeneralWebApi/Frontend/general-frontend/src/app/store/department/department.actions.ts
import { createAction, props } from '@ngrx/store';
import { Department } from 'app/contracts/departments/department.model';

// Load departments list
export const loadDepartments = createAction(
  '[Department] Load Departments',
  props<{
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
    parentDepartmentId?: number | null;
    level?: number | null;
    sortBy?: string;
    sortDescending?: boolean;
  }>()
);

export const loadDepartmentsSuccess = createAction(
  '[Department] Load Departments Success',
  props<{
    departments: Department[];
    totalItems: number;
    currentPage: number;
    pageSize: number;
  }>()
);

export const loadDepartmentsFailure = createAction(
  '[Department] Load Departments Failure',
  props<{ error: string }>()
);

// Load single department
export const loadDepartment = createAction(
  '[Department] Load Department',
  props<{ id: string }>()
);

export const loadDepartmentSuccess = createAction(
  '[Department] Load Department Success',
  props<{ department: Department }>()
);

export const loadDepartmentFailure = createAction(
  '[Department] Load Department Failure',
  props<{ error: string }>()
);

// Create department
export const createDepartment = createAction(
  '[Department] Create Department',
  props<{ department: Omit<Department, 'id'> }>()
);

export const createDepartmentSuccess = createAction(
  '[Department] Create Department Success',
  props<{ department: Department }>()
);

export const createDepartmentFailure = createAction(
  '[Department] Create Department Failure',
  props<{ error: string }>()
);

// Update department
export const updateDepartment = createAction(
  '[Department] Update Department',
  props<{ id: string; department: Partial<Department> }>()
);

export const updateDepartmentSuccess = createAction(
  '[Department] Update Department Success',
  props<{ department: Department }>()
);

export const updateDepartmentFailure = createAction(
  '[Department] Update Department Failure',
  props<{ error: string }>()
);

// Delete department
export const deleteDepartment = createAction(
  '[Department] Delete Department',
  props<{ id: string }>()
);

export const deleteDepartmentSuccess = createAction(
  '[Department] Delete Department Success',
  props<{ id: string }>()
);

export const deleteDepartmentFailure = createAction(
  '[Department] Delete Department Failure',
  props<{ error: string }>()
);

// Select department
export const selectDepartment = createAction(
  '[Department] Select Department',
  props<{ department: Department | null }>()
);

// Clear selection
export const clearSelectedDepartment = createAction(
  '[Department] Clear Selected Department'
);

// Set filters
export const setFilters = createAction(
  '[Department] Set Filters',
  props<{
    searchTerm?: string;
    parentDepartmentId?: number | null;
    level?: number | null;
    sortBy?: string;
    sortDescending?: boolean;
  }>()
);

// Clear filters
export const clearFilters = createAction('[Department] Clear Filters');

// Set pagination
export const setPagination = createAction(
  '[Department] Set Pagination',
  props<{
    currentPage?: number;
    pageSize?: number;
  }>()
);

// Clear error
export const clearError = createAction('[Department] Clear Error');

// Reset state
export const resetDepartmentState = createAction('[Department] Reset State');

