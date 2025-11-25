// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/contract-approvals/contract-approval-list/contract-approval-list.component.ts
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, delay, of } from 'rxjs';
import { first, catchError, filter } from 'rxjs/operators';
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
import { ContractApproval } from 'app/contracts/contract-approvals/contract-approval.model';
import { ContractApprovalDetailComponent } from '../contract-approval-detail/contract-approval-detail.component';

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
export class ContractApprovalListComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private dialogService = inject(DialogService);

  approvals = signal<ContractApproval[]>([]);
  loading$ = new BehaviorSubject<boolean>(false);
  approvalsData$ = new BehaviorSubject<ContractApproval[] | null>(null);
  activeFilter = signal<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  filterOptions: ('all' | 'pending' | 'approved' | 'rejected')[] = ['all', 'pending', 'approved', 'rejected'];

  selectedApproval: ContractApproval | null = null;
  isDetailModalOpen = false;

  // Computed statistics
  pendingCount = computed(() => this.allApprovals.filter(a => a.status === 'Pending').length);
  approvedCount = computed(() => this.allApprovals.filter(a => a.status === 'Approved').length);
  rejectedCount = computed(() => this.allApprovals.filter(a => a.status === 'Rejected').length);

  private allApprovals: ContractApproval[] = [
    {
      id: 1,
      contractId: 2,
      contractEmployeeName: 'Jane Smith',
      contractType: 'Fixed',
      status: 'Pending',
      comments: 'New contract requires approval',
      requestedBy: 'HR Manager',
      requestedAt: '2024-12-15T10:00:00Z',
      approvedBy: null,
      approvedAt: null,
      rejectedBy: null,
      rejectedAt: null,
      rejectionReason: null,
      currentApprovalLevel: 1,
      maxApprovalLevel: 2,
      approvalSteps: [
        { id: 1, stepOrder: 1, stepName: 'Department Manager Approval', approverRole: 'DepartmentManager', approverUserName: null, status: 'Pending', comments: null, processedAt: null, processedBy: null, dueDate: '2024-12-20T17:00:00Z' },
        { id: 2, stepOrder: 2, stepName: 'HR Approval', approverRole: 'HRManager', approverUserName: null, status: 'Pending', comments: null, processedAt: null, processedBy: null, dueDate: null },
      ],
    },
    {
      id: 2,
      contractId: 3,
      contractEmployeeName: 'Bob Johnson',
      contractType: 'PartTime',
      status: 'Pending',
      comments: 'Part-time contract renewal',
      requestedBy: 'HR Manager',
      requestedAt: '2024-12-16T09:30:00Z',
      approvedBy: null,
      approvedAt: null,
      rejectedBy: null,
      rejectedAt: null,
      rejectionReason: null,
      currentApprovalLevel: 2,
      maxApprovalLevel: 2,
      approvalSteps: [
        { id: 3, stepOrder: 1, stepName: 'Department Manager Approval', approverRole: 'DepartmentManager', approverUserName: 'John Manager', status: 'Approved', comments: 'Approved', processedAt: '2024-12-16T14:00:00Z', processedBy: 'John Manager', dueDate: '2024-12-20T17:00:00Z' },
        { id: 4, stepOrder: 2, stepName: 'HR Approval', approverRole: 'HRManager', approverUserName: null, status: 'Pending', comments: null, processedAt: null, processedBy: null, dueDate: null },
      ],
    },
    {
      id: 3,
      contractId: 4,
      contractEmployeeName: 'Alice Williams',
      contractType: 'Fixed',
      status: 'Approved',
      comments: 'Contract approved',
      requestedBy: 'HR Manager',
      requestedAt: '2024-12-10T14:00:00Z',
      approvedBy: 'HR Director',
      approvedAt: '2024-12-12T16:00:00Z',
      rejectedBy: null,
      rejectedAt: null,
      rejectionReason: null,
      currentApprovalLevel: 2,
      maxApprovalLevel: 2,
      approvalSteps: [
        { id: 5, stepOrder: 1, stepName: 'Department Manager Approval', approverRole: 'DepartmentManager', approverUserName: 'John Manager', status: 'Approved', comments: 'OK', processedAt: '2024-12-11T10:00:00Z', processedBy: 'John Manager', dueDate: '2024-12-15T17:00:00Z' },
        { id: 6, stepOrder: 2, stepName: 'HR Approval', approverRole: 'HRManager', approverUserName: 'HR Director', status: 'Approved', comments: 'Approved', processedAt: '2024-12-12T16:00:00Z', processedBy: 'HR Director', dueDate: null },
      ],
    },
    {
      id: 4,
      contractId: 5,
      contractEmployeeName: 'Charlie Brown',
      contractType: 'Temporary',
      status: 'Rejected',
      comments: 'Contract rejected',
      requestedBy: 'HR Manager',
      requestedAt: '2024-12-14T11:00:00Z',
      approvedBy: null,
      approvedAt: null,
      rejectedBy: 'Department Manager',
      rejectedAt: '2024-12-15T09:00:00Z',
      rejectionReason: 'Budget constraints',
      currentApprovalLevel: 1,
      maxApprovalLevel: 2,
      approvalSteps: [
        { id: 7, stepOrder: 1, stepName: 'Department Manager Approval', approverRole: 'DepartmentManager', approverUserName: 'John Manager', status: 'Rejected', comments: 'Budget constraints', processedAt: '2024-12-15T09:00:00Z', processedBy: 'Department Manager', dueDate: '2024-12-16T17:00:00Z' },
        { id: 8, stepOrder: 2, stepName: 'HR Approval', approverRole: 'HRManager', approverUserName: null, status: 'Pending', comments: null, processedAt: null, processedBy: null, dueDate: null },
      ],
    },
  ];

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
    of(this.allApprovals).pipe(delay(500), first(), catchError(err => {
      this.loading$.next(false);
      this.notificationService.error('Load Failed', err.message || 'Failed to load approvals', { duration: 5000 });
      return of([]);
    })).subscribe(approvals => {
      const filter = this.activeFilter();
      const filtered = filter === 'all' 
        ? approvals 
        : approvals.filter(a => a.status.toLowerCase() === filter);
      this.approvals.set(filtered);
      this.approvalsData$.next(filtered);
      this.loading$.next(false);
    });
  }

  onFilterChange(filter: 'all' | 'pending' | 'approved' | 'rejected'): void {
    this.activeFilter.set(filter);
    this.loadApprovals();
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
      message: `Approve contract for ${approval.contractEmployeeName}?`,
      confirmText: 'Approve',
      cancelText: 'Cancel',
      confirmVariant: 'primary',
      icon: 'check',
    }).pipe(first(), filter(c => c)).subscribe(() => {
      const updated = this.approvals().map(a => a.id === approval.id ? { ...a, status: 'Approved' as const, approvedBy: 'Current User', approvedAt: new Date().toISOString() } : a);
      this.approvals.set(updated);
      this.approvalsData$.next(updated);
      this.notificationService.success('Approved', `Contract for ${approval.contractEmployeeName} has been approved`, { duration: 3000 });
    });
  }

  onReject(approval: ContractApproval): void {
    this.dialogService.confirm({
      title: 'Reject Contract',
      message: `Reject contract for ${approval.contractEmployeeName}?`,
      confirmText: 'Reject',
      cancelText: 'Cancel',
      confirmVariant: 'danger',
      icon: 'close',
    }).pipe(first(), filter(c => c)).subscribe(() => {
      const updated = this.approvals().map(a => a.id === approval.id ? { ...a, status: 'Rejected' as const, rejectedBy: 'Current User', rejectedAt: new Date().toISOString(), rejectionReason: 'Rejected by user' } : a);
      this.approvals.set(updated);
      this.approvalsData$.next(updated);
      this.notificationService.warning('Rejected', `Contract for ${approval.contractEmployeeName} has been rejected`, { duration: 3000 });
    });
  }

  onRowClick = (item: unknown) => this.onView(item as ContractApproval);
  onRetryLoad = () => this.loadApprovals();
  onApprovalUpdated = () => { this.loadApprovals(); this.isDetailModalOpen = false; this.selectedApproval = null; };
  onCloseDetailModal = () => { this.isDetailModalOpen = false; this.selectedApproval = null; };
}
