// Path: GeneralWebApi/Frontend/general-frontend/src/app/core/services/contract-approval.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable, map, forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { BaseHttpService } from './base-http.service';
import {
  ContractApproval,
  ContractApprovalStep,
  BackendContractApproval,
  SubmitApprovalRequest,
  ApprovalActionRequest,
  RejectionActionRequest,
} from 'app/contracts/contract-approvals/contract-approval.model';
import { ApiResponse } from 'app/contracts/common/api-response';
import { PagedResult } from 'app/contracts/contracts/contract.model';
import { ContractService } from './contract.service';

@Injectable({
  providedIn: 'root',
})
export class ContractApprovalService extends BaseHttpService {
  private readonly endpoint = `${this.baseUrl}/contracts`;
  private contractService = inject(ContractService);

  // Transform backend data format to frontend format
  private transformBackendApproval(backendApproval: BackendContractApproval, contract?: { employeeName?: string | null; contractType?: string }): ContractApproval {
    return {
      id: backendApproval.id,
      contractId: backendApproval.contractId,
      employeeId: backendApproval.employeeId,
      contractEmployeeName: contract?.employeeName || undefined,
      contractType: contract?.contractType || undefined,
      status: backendApproval.status as 'Pending' | 'Approved' | 'Rejected' | 'Cancelled',
      comments: backendApproval.comments || null,
      requestedBy: backendApproval.requestedBy,
      requestedAt: backendApproval.requestedAt,
      approvedBy: backendApproval.approvedBy || null,
      approvedAt: backendApproval.approvedAt || null,
      rejectedBy: backendApproval.rejectedBy || null,
      rejectedAt: backendApproval.rejectedAt || null,
      rejectionReason: backendApproval.rejectionReason || null,
      currentApprovalLevel: backendApproval.currentApprovalLevel,
      maxApprovalLevel: backendApproval.maxApprovalLevel,
      approvalSteps: backendApproval.approvalSteps || [],
    };
  }

  // Get pending approvals with contract information
  getPendingApprovals(params?: {
    pageNumber?: number;
    pageSize?: number;
  }): Observable<ApiResponse<ContractApproval[]>> {
    const requestParams = {
      pageNumber: params?.pageNumber || 1,
      pageSize: params?.pageSize || 100,
    };

    return this.get<ApiResponse<PagedResult<BackendContractApproval>>>(
      `${this.endpoint}/approvals/pending`,
      requestParams,
      { extractData: false }
    ).pipe(
      switchMap((response: ApiResponse<PagedResult<BackendContractApproval>>) => {
        if (!response.data) {
          throw new Error(response.message || 'Response data is missing');
        }

        // Store pagination data in local variable to avoid TypeScript errors
        const paginationData = response.data;

        // Transform approvals
        const approvals = paginationData.items.map(approval => 
          this.transformBackendApproval(approval)
        );

        // Enrich with contract information
        if (approvals.length === 0) {
          return of({
            ...response,
            data: [],
            pagination: {
              totalItems: paginationData.totalCount,
              currentPage: paginationData.pageNumber,
              pageSize: paginationData.pageSize,
              totalPages: paginationData.totalPages,
            },
          });
        }

        return forkJoin(
          approvals.map(approval => 
            this.contractService.getContractById(approval.contractId.toString()).pipe(
              map(contract => ({
                ...approval,
                contractEmployeeName: contract.employeeName || undefined,
                contractType: contract.contractType || undefined,
              })),
              catchError(() => of(approval)) // If contract fetch fails, use approval without enrichment
            )
          )
        ).pipe(
          map(enrichedApprovals => ({
            ...response,
            data: enrichedApprovals,
            pagination: {
              totalItems: paginationData.totalCount,
              currentPage: paginationData.pageNumber,
              pageSize: paginationData.pageSize,
              totalPages: paginationData.totalPages,
            },
          }))
        );
      })
    );
  }

  // Submit contract for approval
  submitForApproval(contractId: number, request: SubmitApprovalRequest): Observable<ContractApproval> {
    return this.post<BackendContractApproval>(
      `${this.endpoint}/${contractId}/submit-approval`,
      request
    ).pipe(
      map(backendApproval => this.transformBackendApproval(backendApproval))
    );
  }

  // Approve contract
  approve(approvalId: number, request: ApprovalActionRequest): Observable<boolean> {
    return this.put<boolean>(
      `${this.endpoint}/approvals/${approvalId}/approve`,
      request
    );
  }

  // Reject contract
  reject(approvalId: number, request: RejectionActionRequest): Observable<boolean> {
    return this.put<boolean>(
      `${this.endpoint}/approvals/${approvalId}/reject`,
      request
    );
  }

  // Get approval history for a contract
  getApprovalHistory(contractId: number): Observable<ContractApprovalStep[]> {
    return this.get<ContractApprovalStep[]>(
      `${this.endpoint}/${contractId}/approval-history`
    );
  }
}

