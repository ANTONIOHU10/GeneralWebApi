// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/contract-reminders/contract-reminder-list/contract-reminder-list.component.ts
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, delay, of } from 'rxjs';
import { first, catchError, filter, take } from 'rxjs/operators';
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
import { Contract } from 'app/contracts/contracts/contract.model';
import { ContractDetailComponent } from '../../contracts/contract-detail/contract-detail.component';

interface ContractReminder extends Contract {
  daysUntilExpiry: number;
  isExpired: boolean;
}

@Component({
  selector: 'app-contract-reminder-list',
  standalone: true,
  imports: [
    CommonModule,
    BasePrivatePageContainerComponent,
    BaseAsyncStateComponent,
    BaseTableComponent,
    BaseCardComponent,
    BaseBadgeComponent,
    ContractDetailComponent,
  ],
  templateUrl: './contract-reminder-list.component.html',
  styleUrls: ['./contract-reminder-list.component.scss'],
})
export class ContractReminderListComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private dialogService = inject(DialogService);

  reminders = signal<ContractReminder[]>([]);
  loading$ = new BehaviorSubject<boolean>(false);
  remindersData$ = new BehaviorSubject<ContractReminder[] | null>(null);
  filterDays = signal<number>(30);

  selectedContract: Contract | null = null;
  isDetailModalOpen = false;

  // Computed statistics
  expiredCount = computed(() => this.reminders().filter(r => r.isExpired).length);
  urgentCount = computed(() => this.reminders().filter(r => !r.isExpired && r.daysUntilExpiry <= 7).length);
  warningCount = computed(() => this.reminders().filter(r => !r.isExpired && r.daysUntilExpiry > 7 && r.daysUntilExpiry <= 30).length);
  infoCount = computed(() => this.reminders().filter(r => !r.isExpired && r.daysUntilExpiry > 30).length);

  private mockContracts: Contract[] = [
    { id: '2', employeeId: 2, employeeName: 'Jane Smith', contractType: 'Fixed', startDate: '2023-06-01T00:00:00Z', endDate: '2025-06-01T00:00:00Z', status: 'Active', salary: 60000, notes: 'Two-year fixed term', renewalReminderDate: '2025-05-01T00:00:00Z', createdAt: '2023-06-01T00:00:00Z', updatedAt: null },
    { id: '3', employeeId: 3, employeeName: 'Bob Johnson', contractType: 'PartTime', startDate: '2023-03-15T00:00:00Z', endDate: '2024-12-31T00:00:00Z', status: 'Active', salary: 30000, notes: 'Part-time contract', renewalReminderDate: '2024-12-01T00:00:00Z', createdAt: '2023-03-15T00:00:00Z', updatedAt: null },
    { id: '4', employeeId: 4, employeeName: 'Alice Williams', contractType: 'Fixed', startDate: '2022-01-01T00:00:00Z', endDate: '2024-01-01T00:00:00Z', status: 'Expired', salary: 55000, notes: 'Contract expired', renewalReminderDate: null, createdAt: '2022-01-01T00:00:00Z', updatedAt: null },
    { id: '5', employeeId: 5, employeeName: 'Charlie Brown', contractType: 'Temporary', startDate: '2024-01-01T00:00:00Z', endDate: '2024-12-31T00:00:00Z', status: 'Active', salary: 40000, notes: 'Temporary contract', renewalReminderDate: '2024-11-01T00:00:00Z', createdAt: '2024-01-01T00:00:00Z', updatedAt: null },
    { id: '6', employeeId: 6, employeeName: 'David Lee', contractType: 'Internship', startDate: '2024-06-01T00:00:00Z', endDate: '2024-12-31T00:00:00Z', status: 'Active', salary: 25000, notes: 'Internship', renewalReminderDate: null, createdAt: '2024-06-01T00:00:00Z', updatedAt: null },
  ];

  tableColumns: TableColumn[] = [
    { key: 'employeeName', label: 'Employee', sortable: true, width: '150px' },
    { key: 'contractType', label: 'Type', sortable: true, width: '120px' },
    { key: 'endDate', label: 'End Date', sortable: true, type: 'date', width: '120px' },
    { key: 'daysUntilExpiry', label: 'Days Left', sortable: true, type: 'number', width: '120px' },
    { key: 'status', label: 'Status', sortable: true, width: '100px' },
  ];

  tableActions: TableAction[] = [
    { label: 'View', icon: 'visibility', variant: 'ghost', showLabel: false, onClick: (item) => this.onView(item as ContractReminder) },
    { label: 'Renew', icon: 'refresh', variant: 'primary', showLabel: false, onClick: (item) => this.onRenew(item as ContractReminder) },
  ];

  ngOnInit(): void {
    this.loadReminders();
  }

  loadReminders(): void {
    this.loading$.next(true);
    of(this.mockContracts).pipe(delay(500), first(), catchError(err => {
      this.loading$.next(false);
      this.notificationService.error('Load Failed', err.message || 'Failed to load reminders', { duration: 5000 });
      return of([]);
    })).subscribe(contracts => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const processed = contracts
        .filter(c => c.endDate)
        .map(c => {
          const endDate = new Date(c.endDate!);
          endDate.setHours(0, 0, 0, 0);
          const days = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return { ...c, daysUntilExpiry: days, isExpired: days < 0 };
        })
        .filter(r => r.isExpired || (r.daysUntilExpiry >= 0 && r.daysUntilExpiry <= this.filterDays()))
        .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
      this.reminders.set(processed);
      this.remindersData$.next(processed);
      this.loading$.next(false);
    });
  }

  onFilterChange(days: number): void {
    this.filterDays.set(days);
    this.loadReminders();
  }

  getBadgeVariant(reminder: ContractReminder): BadgeVariant {
    if (reminder.isExpired) return 'danger';
    if (reminder.daysUntilExpiry <= 7) return 'danger';
    if (reminder.daysUntilExpiry <= 30) return 'warning';
    return 'info';
  }

  getStatusText(reminder: ContractReminder): string {
    if (reminder.isExpired) return 'Expired';
    if (reminder.daysUntilExpiry === 0) return 'Today';
    if (reminder.daysUntilExpiry === 1) return 'Tomorrow';
    return `${reminder.daysUntilExpiry} Days`;
  }

  onView(reminder: ContractReminder): void {
    this.selectedContract = reminder;
    this.isDetailModalOpen = true;
  }

  onRenew(reminder: ContractReminder): void {
    this.dialogService.confirm({
      title: 'Renew Contract',
      message: `Renew contract for ${reminder.employeeName}?`,
      confirmText: 'Renew',
      cancelText: 'Cancel',
      confirmVariant: 'primary',
      icon: 'refresh',
    }).pipe(first(), filter(c => c)).subscribe(() => {
      this.notificationService.success('Contract Renewal', `Renewal initiated for ${reminder.employeeName}`, { duration: 3000 });
    });
  }

  onRowClick = (item: unknown) => this.onView(item as ContractReminder);
  onRetryLoad = () => this.loadReminders();
  onContractUpdated = () => this.loadReminders();
  onCloseDetailModal = () => { this.isDetailModalOpen = false; this.selectedContract = null; };
}
