// Backend position data format - matches PositionDto
export interface BackendPosition {
  id: number;
  title: string;
  code: string;
  description: string;
  departmentId: number;
  departmentName?: string | null;
  level: number;
  parentPositionId?: number | null;
  parentPositionTitle?: string | null;
  minSalary?: number | null;
  maxSalary?: number | null;
  isManagement: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

// Frontend position data format
export interface Position {
  id: string;
  title: string;
  code: string;
  description: string;
  departmentId: number;
  departmentName?: string | null;
  level: number;
  parentPositionId?: number | null;
  parentPositionTitle?: string | null;
  minSalary?: number | null;
  maxSalary?: number | null;
  isManagement: boolean;
  createdAt?: string;
  updatedAt?: string | null;
}

// Request DTO for creating position - matches backend CreatePositionDto
export interface CreatePositionRequest {
  Title: string;
  Code: string;
  Description: string;
  DepartmentId: number;
  Level?: number;
  ParentPositionId?: number | null;
  MinSalary?: number | null;
  MaxSalary?: number | null;
  IsManagement?: boolean;
}

// Request DTO for updating position - matches backend UpdatePositionDto
export interface UpdatePositionRequest {
  Id: number;
  Title: string;
  Code: string;
  Description: string;
  DepartmentId: number;
  Level?: number;
  ParentPositionId?: number | null;
  MinSalary?: number | null;
  MaxSalary?: number | null;
  IsManagement?: boolean;
}

// Search DTO for position list - matches backend PositionSearchDto
export interface PositionSearchParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  departmentId?: number | null;
  level?: number | null;
  isManagement?: boolean | null;
  sortBy?: string;
  sortDescending?: boolean;
  [key: string]: unknown;
}

