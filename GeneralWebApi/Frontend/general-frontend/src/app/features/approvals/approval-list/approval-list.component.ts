// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/approvals/approval-list/approval-list.component.ts
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
  ],
  templateUrl: './approval-list.component.html',
  styleUrls: ['./approval-list.component.scss'],
})
export class ApprovalListComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private dialogService = inject(DialogService);

  approvals = signal<Approval[]>([]);
  loading$ = new BehaviorSubject<boolean>(false);
  approvalsData$ = new BehaviorSubject<Approval[] | null>(null);
  activeFilter = signal<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  filterOptions: ('all' | 'pending' | 'approved' | 'rejected')[] = ['all', 'pending', 'approved', 'rejected'];

  // Computed statistics
  pendingCount = computed(() => this.allApprovals.filter(a => a.status === 'Pending').length);
  approvedCount = computed(() => this.allApprovals.filter(a => a.status === 'Approved').length);
  rejectedCount = computed(() => this.allApprovals.filter(a => a.status === 'Rejected').length);

  private allApprovals: Approval[] = [
    { id: '1', type: 'Contract', title: 'New Contract for John Doe', requester: 'HR Manager', status: 'Pending', priority: 'High', createdAt: '2024-12-15T10:00:00Z', dueDate: '2024-12-20T17:00:00Z', currentStep: 1, totalSteps: 3, approver: 'Department Head' },
    { id: '2', type: 'Employee', title: 'Employee Promotion Request', requester: 'Team Lead', status: 'Pending', priority: 'Medium', createdAt: '2024-12-16T09:30:00Z', dueDate: '2024-12-22T17:00:00Z', currentStep: 2, totalSteps: 2, approver: 'HR Director' },
    { id: '3', type: 'Contract', title: 'Contract Renewal for Bob Johnson', requester: 'HR Manager', status: 'Approved', priority: 'Low', createdAt: '2024-12-10T14:00:00Z', dueDate: '2024-12-15T17:00:00Z', currentStep: 3, totalSteps: 3, approver: 'Department Head' },
    { id: '4', type: 'Department', title: 'New Department Creation', requester: 'CEO', status: 'Pending', priority: 'Urgent', createdAt: '2024-12-17T08:00:00Z', dueDate: '2024-12-18T17:00:00Z', currentStep: 1, totalSteps: 2, approver: 'Board of Directors' },
    { id: '5', type: 'Contract', title: 'Contract Termination', requester: 'HR Manager', status: 'Rejected', priority: 'High', createdAt: '2024-12-14T11:00:00Z', dueDate: '2024-12-16T17:00:00Z', currentStep: 2, totalSteps: 2, approver: 'Department Head' },
  ];

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

  onApprove(approval: Approval): void {
    this.dialogService.confirm({
      title: 'Approve Request',
      message: `Approve "${approval.title}"?`,
      confirmText: 'Approve',
      cancelText: 'Cancel',
      confirmVariant: 'primary',
      icon: 'check',
    }).pipe(first(), filter(c => c)).subscribe(() => {
      const updated = this.approvals().map(a => a.id === approval.id ? { ...a, status: 'Approved' as const, updatedAt: new Date().toISOString() } : a);
      this.approvals.set(updated);
      this.approvalsData$.next(updated);
      this.notificationService.success('Approved', `"${approval.title}" has been approved`, { duration: 3000 });
    });
  }

  onReject(approval: Approval): void {
    this.dialogService.confirm({
      title: 'Reject Request',
      message: `Reject "${approval.title}"?`,
      confirmText: 'Reject',
      cancelText: 'Cancel',
      confirmVariant: 'danger',
      icon: 'close',
    }).pipe(first(), filter(c => c)).subscribe(() => {
      const updated = this.approvals().map(a => a.id === approval.id ? { ...a, status: 'Rejected' as const, updatedAt: new Date().toISOString() } : a);
      this.approvals.set(updated);
      this.approvalsData$.next(updated);
      this.notificationService.warning('Rejected', `"${approval.title}" has been rejected`, { duration: 3000 });
    });
  }

  getFilterCount(filter: string): number {
    if (filter === 'pending') return this.pendingCount();
    if (filter === 'approved') return this.approvedCount();
    if (filter === 'rejected') return this.rejectedCount();
    return 0;
  }

  onRowClick = (item: unknown) => this.onView(item as Approval);
  onRetryLoad = () => this.loadApprovals();
}
