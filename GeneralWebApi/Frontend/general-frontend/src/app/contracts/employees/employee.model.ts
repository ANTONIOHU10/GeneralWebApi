// 后端返回的员工数据格式
export interface BackendEmployee {
  id: number;
  firstName: string;
  lastName: string;
  employeeNumber: string;
  email: string;
  departmentName: string | null;
  positionTitle: string | null;
  employmentStatus: string;
  hireDate: string;
  phone?: string;
  avatar?: string;
  managerId?: number | null;
  salary?: number;
  address?: unknown;
}

// 前端使用的员工数据格式
export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
  hireDate?: string;
  status: 'Active' | 'Inactive' | 'Terminated';
  avatar?: string;
  managerId?: string | null;
  salary?: number;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

// 分页响应数据
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface EmployeeCardData {
  employee: Employee;
  showActions?: boolean;
}

// Request DTO for creating employee - matches backend CreateEmployeeDto
export interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  employeeNumber?: string; // Optional: if not provided, backend will generate
  email: string;
  phoneNumber?: string;
  departmentId?: number;
  positionId?: number;
  managerId?: number;
  hireDate: string; // ISO date string
  employmentStatus: string; // Required: e.g., "Active", "Inactive", "Terminated"
  employmentType: string; // Required: e.g., "FullTime", "PartTime"
  currentSalary?: number;
  salaryCurrency?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  taxCode: string; // Required: Tax code (fiscal code) - database does not allow NULL
}
