// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/contract-approvals/contract-approval-list/contract-approval-list.component.ts
import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, of } from 'rxjs';
import { first, catchError, filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import {
  BasePrivatePageContainerComponent,
  BaseAsyncStateComponent,
  BaseTableComponent,
  BaseCardComponent,
  BaseBadgeComponent,
  TableColumn,
  TableAction,
  BadgeVariant,
} from '../../../Shared/components/base';
import { NotificationService, DialogService } from '../../../Shared/services';
import { ContractApproval, ApprovalActionRequest, RejectionActionRequest } from 'app/contracts/contract-approvals/contract-approval.model';
import { ContractApprovalDetailComponent } from '../contract-approval-detail/contract-approval-detail.component';
import { ContractApprovalService } from '../../../core/services/contract-approval.service';

@Component({
  selector: 'app-contract-approval-list',
  standalone: true,
  imports: [
    CommonModule,
    BasePrivatePageContainerComponent,
    BaseAsyncStateComponent,
    BaseTableComponent,
    BaseCardComponent,
    BaseBadgeComponent,
    ContractApprovalDetailComponent,
  ],
  templateUrl: './contract-approval-list.component.html',
  styleUrls: ['./contract-approval-list.component.scss'],
})
export class ContractApprovalListComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);
  private dialogService = inject(DialogService);
  private contractApprovalService = inject(ContractApprovalService);
  private destroy$ = new Subject<void>();

  approvals = signal<ContractApproval[]>([]);
  loading$ = new BehaviorSubject<boolean>(false);
  error$ = new BehaviorSubject<string | null>(null);
  approvalsData$ = new BehaviorSubject<ContractApproval[] | null>(null);
  activeFilter = signal<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  filterOptions: ('all' | 'pending' | 'approved' | 'rejected')[] = ['all', 'pending', 'approved', 'rejected'];

  selectedApproval: ContractApproval | null = null;
  isDetailModalOpen = false;

  // All approvals loaded from backend (for statistics and filtering)
  private allApprovals = signal<ContractApproval[]>([]);

  // Computed statistics
  pendingCount = computed(() => this.allApprovals().filter(a => a.status === 'Pending').length);
  approvedCount = computed(() => this.allApprovals().filter(a => a.status === 'Approved').length);
  rejectedCount = computed(() => this.allApprovals().filter(a => a.status === 'Rejected').length);

  tableColumns: TableColumn[] = [
    { key: 'contractEmployeeName', label: 'Employee', sortable: true, width: '150px' },
    { key: 'contractType', label: 'Contract Type', sortable: true, width: '120px' },
    { key: 'status', label: 'Status', sortable: true, width: '100px' },
    { key: 'currentApprovalLevel', label: 'Progress', sortable: true, width: '120px' },
    { key: 'requestedBy', label: 'Requested By', sortable: true, width: '150px' },
    { key: 'requestedAt', label: 'Requested At', sortable: true, type: 'date', width: '150px' },
  ];

  tableActions: TableAction[] = [
    { label: 'View', icon: 'visibility', variant: 'ghost', showLabel: false, onClick: (item) => this.onView(item as ContractApproval) },
    { label: 'Approve', icon: 'check', variant: 'primary', showLabel: false, onClick: (item) => this.onApprove(item as ContractApproval), visible: (item) => (item as ContractApproval).status === 'Pending' },
    { label: 'Reject', icon: 'close', variant: 'danger', showLabel: false, onClick: (item) => this.onReject(item as ContractApproval), visible: (item) => (item as ContractApproval).status === 'Pending' },
  ];

  ngOnInit(): void {
    this.loadApprovals();
  }

  loadApprovals(): void {
    this.loading$.next(true);
    this.error$.next(null);

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
        this.error$.next(errorMessage);
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
          // Store all approvals for statistics and filtering
          this.allApprovals.set(response.data);
          
          // Apply filter
          const filter = this.activeFilter();
          const filtered = filter === 'all' || filter === 'pending'
            ? response.data
            : response.data.filter(a => a.status.toLowerCase() === filter);
          
          this.approvals.set(filtered);
          this.approvalsData$.next(filtered);
          this.loading$.next(false);
          console.log('✅ Approvals loaded:', response.data.length);
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
    // Filter existing data (frontend filtering)
    // Note: Backend only supports pending approvals endpoint
    // For 'all', 'approved', 'rejected', we filter from loaded data
    const allData = this.allApprovals();
    const filtered = filter === 'all'
      ? allData
      : allData.filter(a => a.status.toLowerCase() === filter);
    this.approvals.set(filtered);
    this.approvalsData$.next(filtered);
  }

  getStatusVariant(status: string): BadgeVariant {
    return status === 'Pending' ? 'warning' : status === 'Approved' ? 'success' : status === 'Rejected' ? 'danger' : 'secondary';
  }

  getProgress(approval: ContractApproval): number {
    return Math.round((approval.currentApprovalLevel / approval.maxApprovalLevel) * 100);
  }

  getFilterCount(filter: string): number {
    if (filter === 'pending') return this.pendingCount();
    if (filter === 'approved') return this.approvedCount();
    if (filter === 'rejected') return this.rejectedCount();
    return 0;
  }

  onView(approval: ContractApproval): void {
    this.selectedApproval = approval;
    this.isDetailModalOpen = true;
  }

  onApprove(approval: ContractApproval): void {
    this.dialogService.confirm({
      title: 'Approve Contract',
      message: `Approve contract for ${approval.contractEmployeeName || 'this contract'}?`,
      confirmText: 'Approve',
      cancelText: 'Cancel',
      confirmVariant: 'primary',
      icon: 'check',
    }).pipe(
      first(),
      filter(c => c),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.loading$.next(true);

      const request: ApprovalActionRequest = {
        comments: 'Approved',
      };

      this.contractApprovalService.approve(approval.id, request).pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          this.loading$.next(false);
          this.notificationService.error(
            'Approve Failed',
            error.message || 'Failed to approve contract',
            { duration: 5000, persistent: false, autoClose: true }
          );
          return of(null);
        })
      ).subscribe({
        next: (success) => {
          if (success) {
            // Reload approvals after successful approval
            this.loadApprovals();
            this.notificationService.success(
              'Approved',
              `Contract for ${approval.contractEmployeeName || 'this contract'} has been approved`,
              { duration: 3000, autoClose: true }
            );
          }
        }
      });
    });
  }

  onReject(approval: ContractApproval): void {
    this.dialogService.confirm({
      title: 'Reject Contract',
      message: `Reject contract for ${approval.contractEmployeeName || 'this contract'}?`,
      confirmText: 'Reject',
      cancelText: 'Cancel',
      confirmVariant: 'danger',
      icon: 'close',
    }).pipe(
      first(),
      filter(c => c),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.loading$.next(true);

      const request: RejectionActionRequest = {
        reason: 'Rejected by user',
      };

      this.contractApprovalService.reject(approval.id, request).pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          this.loading$.next(false);
          this.notificationService.error(
            'Reject Failed',
            error.message || 'Failed to reject contract',
            { duration: 5000, persistent: false, autoClose: true }
          );
          return of(null);
        })
      ).subscribe({
        next: (success) => {
          if (success) {
            // Reload approvals after successful rejection
            this.loadApprovals();
            this.notificationService.warning(
              'Rejected',
              `Contract for ${approval.contractEmployeeName || 'this contract'} has been rejected`,
              { duration: 3000, autoClose: true }
            );
          }
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onRowClick = (item: unknown) => this.onView(item as ContractApproval);
  onRetryLoad = () => this.loadApprovals();
  onApprovalUpdated = () => { this.loadApprovals(); this.isDetailModalOpen = false; this.selectedApproval = null; };
  onCloseDetailModal = () => { this.isDetailModalOpen = false; this.selectedApproval = null; };
}
