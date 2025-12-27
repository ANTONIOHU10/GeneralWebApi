// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/approvals/approval-list/approval-list.component.ts
import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { first, catchError, filter, takeUntil, distinctUntilChanged } from 'rxjs/operators';
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
import { TranslatePipe } from '@core/pipes/translate.pipe';
import { TranslationService } from '@core/services/translation.service';
import { NotificationService, DialogService } from '../../../Shared/services';
import { ContractApprovalService } from '../../../core/services/contract-approval.service';
import { ContractApproval, ApprovalActionRequest, RejectionActionRequest } from 'app/contracts/contract-approvals/contract-approval.model';
import { ContractApprovalDetailComponent } from '../../contract-approvals/contract-approval-detail/contract-approval-detail.component';

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
    ContractApprovalDetailComponent,
    TranslatePipe,
  ],
  templateUrl: './approval-list.component.html',
  styleUrls: ['./approval-list.component.scss'],
})
export class ApprovalListComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);
  private dialogService = inject(DialogService);
  private contractApprovalService = inject(ContractApprovalService);
  private translationService = inject(TranslationService);
  private destroy$ = new Subject<void>();

  approvals = signal<Approval[]>([]);
  loading$ = new BehaviorSubject<boolean>(false);
  approvalsData$ = new BehaviorSubject<Approval[] | null>(null);
  activeFilter = signal<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  filterOptions: ('all' | 'pending' | 'approved' | 'rejected')[] = ['all', 'pending', 'approved', 'rejected'];

  // All approvals loaded from backend (for statistics and filtering)
  private allApprovals = signal<Approval[]>([]);
  
  // Store original ContractApproval data for detail view
  private contractApprovalsMap = new Map<number, ContractApproval>();

  // Detail modal state
  selectedApproval: ContractApproval | null = null;
  isDetailModalOpen = false;

  // Computed statistics
  pendingCount = computed(() => this.allApprovals().filter(a => a.status === 'Pending').length);
  approvedCount = computed(() => this.allApprovals().filter(a => a.status === 'Approved').length);
  rejectedCount = computed(() => this.allApprovals().filter(a => a.status === 'Rejected').length);

  tableColumns: TableColumn[] = [];
  tableActions: TableAction[] = [];

  /**
   * Get translated filter label
   */
  getFilterLabel(filter: string): string {
    return this.translationService.translate(`approvals.filterOptions.${filter}`);
  }

  ngOnInit(): void {
    // Wait for translations to load before initializing table
    this.translationService.getTranslationsLoaded$().pipe(
      distinctUntilChanged(),
      filter(loaded => loaded),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.initializeTable();
    });

    this.loadApprovals();
  }

  /**
   * Initialize table columns and actions with translations
   */
  private initializeTable(): void {
    this.tableColumns = [
      { key: 'type', label: this.translationService.translate('approvals.columns.type'), sortable: true, width: '100px' },
      { key: 'title', label: this.translationService.translate('approvals.columns.title'), sortable: true, width: '200px' },
      { key: 'requester', label: this.translationService.translate('approvals.columns.requester'), sortable: true, width: '150px' },
      { key: 'status', label: this.translationService.translate('approvals.columns.status'), sortable: true, width: '100px' },
      { key: 'priority', label: this.translationService.translate('approvals.columns.priority'), sortable: true, width: '100px' },
      { key: 'currentStep', label: this.translationService.translate('approvals.columns.progress'), sortable: true, width: '120px' },
      { key: 'approver', label: this.translationService.translate('approvals.columns.approver'), sortable: true, width: '150px' },
      { key: 'dueDate', label: this.translationService.translate('approvals.columns.dueDate'), sortable: true, type: 'date', width: '150px' },
    ];

    this.tableActions = [
      { label: this.translationService.translate('approvals.actions.view'), icon: 'visibility', variant: 'ghost', showLabel: false, onClick: (item) => this.onView(item as Approval) },
      { label: this.translationService.translate('approvals.actions.approve'), icon: 'check', variant: 'primary', showLabel: false, onClick: (item) => this.onApprove(item as Approval), visible: (item) => (item as Approval).status === 'Pending' },
      { label: this.translationService.translate('approvals.actions.reject'), icon: 'close', variant: 'danger', showLabel: false, onClick: (item) => this.onReject(item as Approval), visible: (item) => (item as Approval).status === 'Pending' },
    ];
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
          // Store original ContractApproval data for detail view
          response.data.forEach(approval => {
            this.contractApprovalsMap.set(approval.id, approval);
          });

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
          this.contractApprovalsMap.clear();
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

  /**
   * Get translated filter text
   */
  getFilterText(filter: string): string {
    const filterMap: Record<string, string> = {
      'all': this.translationService.translate('approvals.filterOptions.all'),
      'pending': this.translationService.translate('approvals.filterOptions.pending'),
      'approved': this.translationService.translate('approvals.filterOptions.approved'),
      'rejected': this.translationService.translate('approvals.filterOptions.rejected'),
    };
    return filterMap[filter] || filter;
  }

  /**
   * Get translated status text
   */
  getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'Pending': this.translationService.translate('approvals.stats.pending'),
      'Approved': this.translationService.translate('approvals.stats.approved'),
      'Rejected': this.translationService.translate('approvals.stats.rejected'),
    };
    return statusMap[status] || status;
  }

  onView(approval: Approval): void {
    // Find the approval ID from the approval object
    const approvalId = parseInt(approval.id, 10);
    if (isNaN(approvalId)) {
      this.notificationService.error('Error', 'Invalid approval ID', { duration: 3000 });
      return;
    }

    // Get ContractApproval from stored map
    const contractApproval = this.contractApprovalsMap.get(approvalId);
    if (contractApproval) {
      this.selectedApproval = contractApproval;
      this.isDetailModalOpen = true;
    } else {
      this.notificationService.error('Error', 'Approval details not found', { duration: 3000 });
    }
  }

  onCloseDetailModal(): void {
    this.isDetailModalOpen = false;
    this.selectedApproval = null;
  }

  onApprovalUpdated(): void {
    // Reload approvals after approval action
    this.loadApprovals();
  }

  showApproveDialog = signal<{ approval: Approval | null }>({ approval: null });
  showRejectDialog = signal<{ approval: Approval | null }>({ approval: null });

  // Computed dialog configs
  approveDialogConfig = computed(() => {
    const approval = this.showApproveDialog().approval;
    return {
      title: this.translationService.translate('approvals.dialog.approveTitle'),
      message: this.translationService.translate('approvals.dialog.approveMessage'),
      label: this.translationService.translate('common.description'),
      placeholder: this.translationService.translate('approvals.dialog.approvePlaceholder'),
      confirmText: this.translationService.translate('approvals.actions.approve'),
      cancelText: this.translationService.translate('common.cancel'),
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
      title: this.translationService.translate('approvals.dialog.rejectTitle'),
      message: this.translationService.translate('approvals.dialog.rejectMessage'),
      label: this.translationService.translate('common.description'),
      placeholder: this.translationService.translate('approvals.dialog.rejectPlaceholder'),
      confirmText: this.translationService.translate('approvals.actions.reject'),
      cancelText: this.translationService.translate('common.cancel'),
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
