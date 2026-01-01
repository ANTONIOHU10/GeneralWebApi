// Path: GeneralWebApi/Frontend/general-frontend/src/app/store/employee/employee.state.ts
import { Employee } from 'app/contracts/employees/employee.model';

export interface EmployeeState {
  // 员工列表
  employees: Employee[];

  // 当前选中的员工
  selectedEmployee: Employee | null;

  // 加载状态
  loading: boolean;

  // 错误信息
  error: string | null;

  // 分页信息
  pagination: {
    currentPage: number; // Keep currentPage for UI, but use pageNumber for API
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };

  // 搜索和过滤 - 使用后端格式
  filters: {
    searchTerm: string;
    department: string;
    employmentStatus: string; // Changed from status to match backend
    sortBy: string;
    sortDescending: boolean; // Changed from sortDirection to match backend
  };

  // 操作状态
  operationInProgress: {
    loading: boolean;
    operation: 'create' | 'update' | 'delete' | null;
    employeeId: string | null;
  };
}

export const initialEmployeeState: EmployeeState = {
  employees: [],
  selectedEmployee: null,
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
    department: '',
    employmentStatus: '',
    sortBy: 'firstName',
    sortDescending: false, // false = ascending, true = descending
  },
  operationInProgress: {
    loading: false,
    operation: null,
    employeeId: null,
  },
};
