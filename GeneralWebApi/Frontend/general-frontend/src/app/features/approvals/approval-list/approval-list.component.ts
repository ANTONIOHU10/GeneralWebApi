// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/approvals/approval-list/approval-list.component.ts
import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { first, catchError, filter, takeUntil } from 'rxjs/operators';
import {
  BasePrivatePageContainerComponent,
  BaseAsyncStateComponent,
  BaseTableComponent,
  BaseCardComponent,
  BaseBadgeComponent,
  BasePromptDialogComponent,
  TableColumn,
  TableAction,
  BadgeVariant,
} from '../../../Shared/components/base';
import { NotificationService, DialogService } from '../../../Shared/services';
import { ContractApprovalService } from '../../../core/services/contract-approval.service';
import { ContractApproval, ApprovalActionRequest, RejectionActionRequest } from 'app/contracts/contract-approvals/contract-approval.model';

interface Approval {
  id: string;
  type: string;
  title: string;
  requester: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  createdAt: string;
  dueDate: string | null;
  currentStep: number;
  totalSteps: number;
  approver: string | null;
  contractId?: number; // For API calls
}

@Component({
  selector: 'app-approval-list',
  standalone: true,
  imports: [
    CommonModule,
    BasePrivatePageContainerComponent,
    BaseAsyncStateComponent,
    BaseTableComponent,
    BaseCardComponent,
    BaseBadgeComponent,
    BasePromptDialogComponent,
  ],
  templateUrl: './approval-list.component.html',
  styleUrls: ['./approval-list.component.scss'],
})
export class ApprovalListComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);
  private dialogService = inject(DialogService);
  private contractApprovalService = inject(ContractApprovalService);
  private destroy$ = new Subject<void>();

  approvals = signal<Approval[]>([]);
  loading$ = new BehaviorSubject<boolean>(false);
  approvalsData$ = new BehaviorSubject<Approval[] | null>(null);
  activeFilter = signal<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  filterOptions: ('all' | 'pending' | 'approved' | 'rejected')[] = ['all', 'pending', 'approved', 'rejected'];

  // All approvals loaded from backend (for statistics and filtering)
  private allApprovals = signal<Approval[]>([]);

  // Computed statistics
  pendingCount = computed(() => this.allApprovals().filter(a => a.status === 'Pending').length);
  approvedCount = computed(() => this.allApprovals().filter(a => a.status === 'Approved').length);
  rejectedCount = computed(() => this.allApprovals().filter(a => a.status === 'Rejected').length);

  tableColumns: TableColumn[] = [
    { key: 'type', label: 'Type', sortable: true, width: '100px' },
    { key: 'title', label: 'Title', sortable: true, width: '200px' },
    { key: 'requester', label: 'Requester', sortable: true, width: '150px' },
    { key: 'status', label: 'Status', sortable: true, width: '100px' },
    { key: 'priority', label: 'Priority', sortable: true, width: '100px' },
    { key: 'currentStep', label: 'Progress', sortable: true, width: '120px' },
    { key: 'approver', label: 'Approver', sortable: true, width: '150px' },
    { key: 'dueDate', label: 'Due Date', sortable: true, type: 'date', width: '150px' },
  ];

  tableActions: TableAction[] = [
    { label: 'View', icon: 'visibility', variant: 'ghost', showLabel: false, onClick: (item) => this.onView(item as Approval) },
    { label: 'Approve', icon: 'check', variant: 'primary', showLabel: false, onClick: (item) => this.onApprove(item as Approval), visible: (item) => (item as Approval).status === 'Pending' },
    { label: 'Reject', icon: 'close', variant: 'danger', showLabel: false, onClick: (item) => this.onReject(item as Approval), visible: (item) => (item as Approval).status === 'Pending' },
  ];

  ngOnInit(): void {
    this.loadApprovals();
  }

  /**
   * Transform ContractApproval to Approval format
   */
  private transformContractApproval(contractApproval: ContractApproval): Approval {
    // Get the current step's approver from approvalSteps
    const currentStep = contractApproval.approvalSteps.find(
      step => step.status === 'Pending' && step.stepOrder === contractApproval.currentApprovalLevel
    );
    const approver = currentStep?.approverUserName || currentStep?.approverRole || null;

    // Get due date from current step
    const dueDate = currentStep?.dueDate || null;

    // Determine priority based on due date (if available)
    let priority: 'Low' | 'Medium' | 'High' | 'Urgent' = 'Medium';
    if (dueDate) {
      const daysUntilDue = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntilDue < 1) priority = 'Urgent';
      else if (daysUntilDue < 3) priority = 'High';
      else if (daysUntilDue < 7) priority = 'Medium';
      else priority = 'Low';
    }

    return {
      id: contractApproval.id.toString(),
      type: 'Contract',
      title: contractApproval.contractEmployeeName 
        ? `Contract Approval: ${contractApproval.contractEmployeeName}`
        : `Contract Approval #${contractApproval.contractId}`,
      requester: contractApproval.requestedBy,
      status: contractApproval.status === 'Cancelled' ? 'Rejected' : contractApproval.status,
      priority,
      createdAt: contractApproval.requestedAt,
      dueDate,
      currentStep: contractApproval.currentApprovalLevel,
      totalSteps: contractApproval.maxApprovalLevel,
      approver,
      contractId: contractApproval.contractId,
    };
  }

  /**
   * Load approvals from backend API
   */
  loadApprovals(): void {
    this.loading$.next(true);

    // Load pending approvals from backend
    // Note: Backend currently only supports pending approvals endpoint
    // For other filters, we'll need to load all and filter on frontend
    this.contractApprovalService.getPendingApprovals({
      pageNumber: 1,
      pageSize: 100, // Load first 100 approvals
    }).pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        const errorMessage = error.message || 'Failed to load approvals';
        this.loading$.next(false);
        this.notificationService.error(
          'Load Failed',
          errorMessage,
          { duration: 5000, persistent: false, autoClose: true }
        );
        return of(null);
      })
    ).subscribe({
      next: (response) => {
        if (response?.data) {
          // Transform ContractApproval to Approval format
          const transformedApprovals = response.data.map(approval => 
            this.transformContractApproval(approval)
          );

          // Store all approvals for statistics and filtering
          this.allApprovals.set(transformedApprovals);
          
          // Apply filter
          const filter = this.activeFilter();
          const filtered = filter === 'all' || filter === 'pending'
            ? transformedApprovals
            : transformedApprovals.filter(a => a.status.toLowerCase() === filter);
          
          this.approvals.set(filtered);
          this.approvalsData$.next(filtered);
          this.loading$.next(false);
        } else {
          this.allApprovals.set([]);
          this.approvals.set([]);
          this.approvalsData$.next([]);
          this.loading$.next(false);
        }
      }
    });
  }

  onFilterChange(filter: 'all' | 'pending' | 'approved' | 'rejected'): void {
    this.activeFilter.set(filter);
    this.loadApprovals();
  }

  getStatusVariant(status: string): BadgeVariant {
    return status === 'Pending' ? 'warning' : status === 'Approved' ? 'success' : 'danger';
  }

  getPriorityVariant(priority: string): BadgeVariant {
    return priority === 'Urgent' ? 'danger' : priority === 'High' ? 'warning' : priority === 'Medium' ? 'info' : 'secondary';
  }

  getProgress(approval: Approval): number {
    return Math.round((approval.currentStep / approval.totalSteps) * 100);
  }

  onView(approval: Approval): void {
    this.dialogService.confirm({
      title: approval.title,
      message: `<div style="text-align: left;"><p><strong>Type:</strong> ${approval.type}</p><p><strong>Requester:</strong> ${approval.requester}</p><p><strong>Status:</strong> ${approval.status}</p><p><strong>Progress:</strong> ${approval.currentStep}/${approval.totalSteps}</p></div>`,
      confirmText: 'Close',
      cancelText: '',
      icon: 'info',
    }).pipe(first()).subscribe();
  }

  showApproveDialog = signal<{ approval: Approval | null }>({ approval: null });
  showRejectDialog = signal<{ approval: Approval | null }>({ approval: null });

  // Computed dialog configs
  approveDialogConfig = computed(() => {
    const approval = this.showApproveDialog().approval;
    return {
      title: 'Approve Request',
      message: `Approve "${approval?.title || 'this request'}"?`,
      label: 'Comments (Optional)',
      placeholder: 'Enter approval comments...',
      confirmText: 'Approve',
      cancelText: 'Cancel',
      confirmVariant: 'primary' as const,
      icon: 'check',
      required: false,
      maxLength: 500,
      rows: 4,
    };
  });

  rejectDialogConfig = computed(() => {
    const approval = this.showRejectDialog().approval;
    return {
      title: 'Reject Request',
      message: `Reject "${approval?.title || 'this request'}"?`,
      label: 'Rejection Reason',
      placeholder: 'Please provide a reason for rejection...',
      confirmText: 'Reject',
      cancelText: 'Cancel',
      confirmVariant: 'danger' as const,
      icon: 'close',
      required: true,
      maxLength: 500,
      rows: 4,
    };
  });

  onApprove(approval: Approval): void {
    this.showApproveDialog.set({ approval });
  }

  onApproveConfirm(comments?: string): void {
    const approval = this.showApproveDialog().approval;
    if (!approval) return;

    if (!approval.contractId) {
      this.notificationService.error('Error', 'Contract ID is missing', { duration: 3000 });
      this.showApproveDialog.set({ approval: null });
      return;
    }

    const request: ApprovalActionRequest = {
      comments: comments?.trim() || undefined,
    };

    this.loading$.next(true);
    this.showApproveDialog.set({ approval: null });

    this.contractApprovalService.approve(parseInt(approval.id, 10), request).pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        this.loading$.next(false);
        this.notificationService.error(
          'Approval Failed',
          error.message || 'Failed to approve the request',
          { duration: 5000 }
        );
        return of(false);
      })
    ).subscribe({
      next: (success) => {
        this.loading$.next(false);
        if (success) {
          this.notificationService.success('Approved', `"${approval.title}" has been approved`, { duration: 3000 });
          // Reload approvals to get updated status
          this.loadApprovals();
        }
      }
    });
  }

  onApproveDialogClose(): void {
    this.showApproveDialog.set({ approval: null });
  }

  onReject(approval: Approval): void {
    this.showRejectDialog.set({ approval });
  }

  onRejectConfirm(reason: string): void {
    const approval = this.showRejectDialog().approval;
    if (!approval) return;

    if (!reason || !reason.trim()) {
      this.notificationService.error(
        'Rejection Reason Required',
        'Please provide a reason for rejection',
        { duration: 3000 }
      );
      return;
    }

    if (!approval.contractId) {
      this.notificationService.error('Error', 'Contract ID is missing', { duration: 3000 });
      this.showRejectDialog.set({ approval: null });
      return;
    }

    const request: RejectionActionRequest = {
      reason: reason.trim(),
    };

    this.loading$.next(true);
    this.showRejectDialog.set({ approval: null });

    this.contractApprovalService.reject(parseInt(approval.id, 10), request).pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        this.loading$.next(false);
        this.notificationService.error(
          'Rejection Failed',
          error.message || 'Failed to reject the request',
          { duration: 5000 }
        );
        return of(false);
      })
    ).subscribe({
      next: (success) => {
        this.loading$.next(false);
        if (success) {
          this.notificationService.warning('Rejected', `"${approval.title}" has been rejected`, { duration: 3000 });
          // Reload approvals to get updated status
          this.loadApprovals();
        }
      }
    });
  }

  onRejectDialogClose(): void {
    this.showRejectDialog.set({ approval: null });
  }

  getFilterCount(filter: string): number {
    if (filter === 'pending') return this.pendingCount();
    if (filter === 'approved') return this.approvedCount();
    if (filter === 'rejected') return this.rejectedCount();
    return 0;
  }

  onRowClick = (item: unknown) => this.onView(item as Approval);
  onRetryLoad = () => this.loadApprovals();

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
