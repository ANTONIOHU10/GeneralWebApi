// Path: GeneralWebApi/Frontend/general-frontend/src/app/contracts/contract-approvals/contract-approval.model.ts

export interface ContractApprovalStep {
  id: number;
  stepOrder: number;
  stepName: string;
  approverRole: string;
  approverUserName: string | null;
  status: 'Pending' | 'Approved' | 'Rejected';
  comments: string | null;
  processedAt: string | null;
  processedBy: string | null;
  dueDate: string | null;
}

export interface ContractApproval {
  id: number;
  contractId: number;
  contractEmployeeName?: string;
  contractType?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  comments: string | null;
  requestedBy: string;
  requestedAt: string;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectedBy: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  currentApprovalLevel: number;
  maxApprovalLevel: number;
  approvalSteps: ContractApprovalStep[];
}

export interface SubmitApprovalRequest {
  comments?: string;
}

export interface ApprovalActionRequest {
  comments?: string;
}

export interface RejectionActionRequest {
  reason: string;
}

// Backend contract approval data format - matches ContractApprovalDto
export interface BackendContractApproval {
  id: number;
  contractId: number;
  status: string;
  comments?: string | null;
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string | null;
  approvedAt?: string | null;
  rejectedBy?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
  currentApprovalLevel: number;
  maxApprovalLevel: number;
  approvalSteps: ContractApprovalStep[];
}

