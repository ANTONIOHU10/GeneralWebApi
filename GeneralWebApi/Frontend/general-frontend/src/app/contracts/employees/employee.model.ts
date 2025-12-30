// 后端返回的员工数据格式 - matches EmployeeDto
export interface BackendEmployee {
  id: number;
  firstName: string;
  lastName: string;
  employeeNumber: string;
  email: string;
  phoneNumber: string;
  departmentId?: number | null;
  departmentName?: string | null;
  positionId?: number | null;
  positionTitle?: string | null;
  managerId?: number | null;
  managerName?: string | null;
  hireDate: string;
  terminationDate?: string | null;
  employmentStatus: string;
  employmentType: string;
  isManager: boolean;
  workingHoursPerWeek?: number | null;
  currentSalary?: number | null;
  salaryCurrency?: string | null;
  lastSalaryIncreaseDate?: string | null;
  nextSalaryIncreaseDate?: string | null;
  contractEndDate?: string | null;
  contractType?: string | null;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  taxCode: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
  isActive: boolean;
  version: number;
  sortOrder: number;
  remarks?: string | null;
  avatar?: string;
}

// 前端使用的员工数据格式
export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  employeeNumber?: string;
  email: string;
  phone?: string;
  departmentId?: number | null;
  department?: string;
  positionId?: number | null;
  position?: string;
  managerId?: string | null;
  managerName?: string | null;
  hireDate?: string;
  terminationDate?: string | null;
  status: 'Active' | 'Inactive' | 'Terminated';
  employmentType?: string;
  isManager?: boolean;
  workingHoursPerWeek?: number | null;
  salary?: number;
  salaryCurrency?: string;
  lastSalaryIncreaseDate?: string;
  nextSalaryIncreaseDate?: string;
  contractEndDate?: string;
  contractType?: string;
  avatar?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  taxCode?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
  isActive?: boolean;
  version?: number;
  sortOrder?: number;
  remarks?: string | null;
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

// Employee hierarchy for organization chart
export interface EmployeeHierarchy {
  id: number;
  firstName: string;
  lastName: string;
  employeeNumber: string;
  email?: string;
  positionTitle?: string;
  departmentName?: string;
  avatar?: string;
  isManager: boolean;
  employmentStatus: string;
  fullName: string;
  manager?: EmployeeHierarchy;
  subordinates: EmployeeHierarchy[];
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
  isManager?: boolean; // Whether the employee is a manager
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
  avatar?: string; // Optional: Avatar URL for employee profile picture
}

// Request DTO for updating employee - matches backend UpdateEmployeeDto
// Note: Uses PascalCase to match backend DTO format
export interface UpdateEmployeeRequest {
  Id: number;
  FirstName: string;
  LastName: string;
  EmployeeNumber: string;
  Email: string;
  PhoneNumber: string;
  DepartmentId?: number | null;
  PositionId?: number | null;
  ManagerId?: number | null;
  HireDate: string; // ISO 8601 date string
  TerminationDate?: string | null; // ISO 8601 date string
  EmploymentStatus: string;
  EmploymentType: string;
  IsManager: boolean;
  CurrentSalary?: number | null;
  SalaryCurrency?: string | null;
  Address: string;
  City: string;
  PostalCode: string;
  Country: string;
  EmergencyContactName: string;
  EmergencyContactPhone: string;
  EmergencyContactRelation: string;
  TaxCode?: string; // Optional: if not provided, existing value is preserved
  Avatar?: string | null; // Optional: Avatar URL for employee profile picture
}
