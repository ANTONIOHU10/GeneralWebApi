// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/contract-approvals/contract-approval-list/contract-approval-list.component.ts
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
  TableColumn,
  TableAction,
  BadgeVariant,
} from '../../../Shared/components/base';
import { BasePromptDialogComponent } from '../../../Shared/components/base/base-prompt-dialog/base-prompt-dialog.component';
import { NotificationService } from '../../../Shared/services';
import { TranslationService } from '@core/services/translation.service';
import { TranslatePipe } from '@core/pipes/translate.pipe';
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
    BasePromptDialogComponent,
    TranslatePipe,
  ],
  templateUrl: './contract-approval-list.component.html',
  styleUrls: ['./contract-approval-list.component.scss'],
})
export class ContractApprovalListComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);
  private contractApprovalService = inject(ContractApprovalService);
  private translationService = inject(TranslationService);
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

  tableColumns: TableColumn[] = [];
  tableActions: TableAction[] = [];

  /**
   * Get translated filter label
   */
  getFilterLabel(filter: string): string {
    return this.translationService.translate(`contractApprovals.filterOptions.${filter}`);
  }

  /**
   * Initialize table columns and actions with translations
   */
  private initializeTableConfig(): void {
    this.tableColumns = [
      { key: 'contractEmployeeName', label: this.translationService.translate('contractApprovals.columns.employee'), sortable: true, width: '150px' },
      { key: 'contractType', label: this.translationService.translate('contractApprovals.columns.contractType'), sortable: true, width: '120px' },
      { key: 'status', label: this.translationService.translate('contractApprovals.columns.status'), sortable: true, width: '100px' },
      { key: 'currentApprovalLevel', label: this.translationService.translate('contractApprovals.columns.progress'), sortable: true, width: '120px' },
      { key: 'requestedBy', label: this.translationService.translate('contractApprovals.columns.requestedBy'), sortable: true, width: '150px' },
      { key: 'requestedAt', label: this.translationService.translate('contractApprovals.columns.requestedAt'), sortable: true, type: 'date', width: '150px' },
    ];

    this.tableActions = [
      { label: this.translationService.translate('contractApprovals.actions.view'), icon: 'visibility', variant: 'ghost', showLabel: false, onClick: (item) => this.onView(item as ContractApproval) },
      { label: this.translationService.translate('contractApprovals.actions.approve'), icon: 'check', variant: 'primary', showLabel: false, onClick: (item) => this.onApprove(item as ContractApproval), visible: (item) => (item as ContractApproval).status === 'Pending' },
      { label: this.translationService.translate('contractApprovals.actions.reject'), icon: 'close', variant: 'danger', showLabel: false, onClick: (item) => this.onReject(item as ContractApproval), visible: (item) => (item as ContractApproval).status === 'Pending' },
    ];
  }

  ngOnInit(): void {
    // Wait for translations to load before initializing table config
    this.translationService.getTranslationsLoaded$().pipe(
      distinctUntilChanged(),
      filter(loaded => loaded),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.initializeTableConfig();
    });

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

  showApproveDialog = signal<{ approval: ContractApproval | null }>({ approval: null });
  showRejectDialog = signal<{ approval: ContractApproval | null }>({ approval: null });

  onApprove(approval: ContractApproval): void {
    this.showApproveDialog.set({ approval });
  }

  onReject(approval: ContractApproval): void {
    this.showRejectDialog.set({ approval });
  }

  onApproveConfirm(comments: string): void {
    const approval = this.showApproveDialog().approval;
    if (!approval) return;

    this.loading$.next(true);
    this.showApproveDialog.set({ approval: null });

    const request: ApprovalActionRequest = {
      comments: comments || undefined,
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
        this.loading$.next(false);
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
  }

  onRejectConfirm(reason: string): void {
    const approval = this.showRejectDialog().approval;
    if (!approval) return;

    if (!reason || !reason.trim()) {
      this.notificationService.error(
        'Rejection Reason Required',
        'Please provide a reason for rejection',
        { duration: 3000, autoClose: true }
      );
      return;
    }

    this.loading$.next(true);
    this.showRejectDialog.set({ approval: null });

    const request: RejectionActionRequest = {
      reason: reason.trim(),
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
        this.loading$.next(false);
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
  }

  onApproveDialogClose(): void {
    this.showApproveDialog.set({ approval: null });
  }

  onRejectDialogClose(): void {
    this.showRejectDialog.set({ approval: null });
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
