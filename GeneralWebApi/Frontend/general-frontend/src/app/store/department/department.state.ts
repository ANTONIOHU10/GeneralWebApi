// Path: GeneralWebApi/Frontend/general-frontend/src/app/store/department/department.state.ts
import { Department } from 'app/contracts/departments/department.model';

export interface DepartmentState {
  // Department list
  departments: Department[];

  // Currently selected department
  selectedDepartment: Department | null;

  // Loading state
  loading: boolean;

  // Error message
  error: string | null;

  // Pagination info
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };

  // Search and filters - using backend format
  filters: {
    searchTerm: string;
    parentDepartmentId: number | null;
    level: number | null;
    sortBy: string;
    sortDescending: boolean;
  };

  // Operation state
  operationInProgress: {
    loading: boolean;
    operation: 'create' | 'update' | 'delete' | null;
    departmentId: string | null;
  };
}

export const initialDepartmentState: DepartmentState = {
  departments: [],
  selectedDepartment: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    pageSize: 5,
    totalItems: 0,
    totalPages: 0,
  },
  filters: {
    searchTerm: '',
    parentDepartmentId: null,
    level: null,
    sortBy: 'name',
    sortDescending: false,
  },
  operationInProgress: {
    loading: false,
    operation: null,
    departmentId: null,
  },
};

