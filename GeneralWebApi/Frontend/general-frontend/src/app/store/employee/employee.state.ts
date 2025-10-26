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
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };

  // 搜索和过滤
  filters: {
    searchTerm: string;
    department: string;
    status: string;
    sortBy: string;
    sortDirection: 'asc' | 'desc';
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
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  },
  filters: {
    searchTerm: '',
    department: '',
    status: '',
    sortBy: 'firstName',
    sortDirection: 'asc',
  },
  operationInProgress: {
    loading: false,
    operation: null,
    employeeId: null,
  },
};
