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
  { value: 'Indefinite', label: 'Indefinite (无限期)' },
  { value: 'Fixed', label: 'Fixed Term (固定期限)' },
  { value: 'PartTime', label: 'Part Time (兼职)' },
  { value: 'Temporary', label: 'Temporary (临时)' },
  { value: 'Internship', label: 'Internship (实习)' },
] as const;

// Contract status options
export const CONTRACT_STATUSES = [
  { value: 'Active', label: 'Active (生效中)' },
  { value: 'Expired', label: 'Expired (已过期)' },
  { value: 'Terminated', label: 'Terminated (已终止)' },
  { value: 'Pending', label: 'Pending (待生效)' },
] as const;

