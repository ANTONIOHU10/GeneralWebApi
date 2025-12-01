// Backend contract data format - matches ContractDto
export interface BackendContract {
  id: number;
  employeeId: number;
  employeeName?: string | null;
  contractType: string;
  startDate: string;
  endDate?: string | null;
  status: string;
  salary?: number | null;
  notes: string;
  renewalReminderDate?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

// Frontend contract data format
export interface Contract {
  id: string;
  employeeId: number;
  employeeName?: string | null;
  contractType: string;
  startDate: string;
  endDate?: string | null;
  status: string;
  salary?: number | null;
  notes: string;
  renewalReminderDate?: string | null;
  createdAt?: string;
  updatedAt?: string | null;
}

// Request DTO for creating contract - matches backend CreateContractDto
export interface CreateContractRequest {
  EmployeeId: number;
  ContractType: string;
  StartDate: string;
  EndDate?: string | null;
  Status?: string;
  Salary?: number | null;
  Notes?: string;
  RenewalReminderDate?: string | null;
  // Approval settings (optional - if provided, contract will be automatically submitted for approval)
  SubmitForApproval?: boolean;
  ApprovalComments?: string | null;
  ApprovalSteps?: ApprovalStepDto[] | null;
}

export interface ApprovalStepDto {
  StepOrder: number;
  StepName: string;
  ApproverUserId?: string | null;
  ApproverUserName?: string | null;
  ApproverRole?: string | null;
}

// Request DTO for updating contract - matches backend UpdateContractDto
export interface UpdateContractRequest {
  Id: number;
  EmployeeId: number;
  ContractType: string;
  StartDate: string;
  EndDate?: string | null;
  Status: string;
  Salary?: number | null;
  Notes?: string;
  RenewalReminderDate?: string | null;
}

// Contract type options
export const CONTRACT_TYPES = [
  { value: 'Indefinite', label: 'Indefinite' },
  { value: 'Fixed', label: 'Fixed Term' },
  { value: 'PartTime', label: 'Part Time' },
  { value: 'Temporary', label: 'Temporary' },
  { value: 'Internship', label: 'Internship' },
] as const;

// Contract status options
export const CONTRACT_STATUSES = [
  { value: 'Active', label: 'Active' },
  { value: 'Expired', label: 'Expired' },
  { value: 'Terminated', label: 'Terminated' },
  { value: 'Pending', label: 'Pending' },
] as const;

// Paginated response data - matches backend PagedResult
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

