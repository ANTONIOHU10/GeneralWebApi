// Backend department data format - matches DepartmentDto
export interface BackendDepartment {
  id: number;
  name: string;
  code: string;
  description: string;
  parentDepartmentId?: number | null;
  parentDepartmentName?: string | null;
  level: number;
  path: string;
  createdAt: string;
  updatedAt?: string | null;
}

// Frontend department data format
export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  parentDepartmentId?: number | null;
  parentDepartmentName?: string | null;
  level: number;
  path: string;
  createdAt?: string;
  updatedAt?: string | null;
}

// Request DTO for creating department - matches backend CreateDepartmentDto
export interface CreateDepartmentRequest {
  Name: string;
  Code: string;
  Description: string;
  ParentDepartmentId?: number | null;
  Level?: number;
  Path?: string;
}

// Request DTO for updating department - matches backend UpdateDepartmentDto
export interface UpdateDepartmentRequest {
  Id: number;
  Name: string;
  Code: string;
  Description: string;
  ParentDepartmentId?: number | null;
  Level?: number;
  Path?: string;
}

// Search DTO for department list - matches backend DepartmentSearchDto
export interface DepartmentSearchParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  parentDepartmentId?: number | null;
  level?: number | null;
  sortBy?: string;
  sortDescending?: boolean;
  [key: string]: unknown;
}

