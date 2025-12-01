// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/contract-reminders/contract-reminder-list/contract-reminder-list.component.ts
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, forkJoin, of } from 'rxjs';
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
import { Contract } from 'app/contracts/contracts/contract.model';
import { ContractDetailComponent } from '../../contracts/contract-detail/contract-detail.component';
import { ContractService } from '../../../core/services/contract.service';

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
  private contractService = inject(ContractService);

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
    
    // Load both expiring and expired contracts
    forkJoin({
      expiring: this.contractService.getExpiringContracts(this.filterDays()),
      expired: this.contractService.getExpiredContracts()
    }).pipe(
      first(),
      catchError(err => {
        this.loading$.next(false);
        this.notificationService.error('Load Failed', err.message || 'Failed to load reminders', { duration: 5000 });
        return of({ expiring: [], expired: [] });
      })
    ).subscribe(({ expiring, expired }) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Process expiring contracts
      const processedExpiring = expiring
        .filter(c => c.endDate)
        .map(c => {
          const endDate = new Date(c.endDate!);
          endDate.setHours(0, 0, 0, 0);
          const days = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return { ...c, daysUntilExpiry: days, isExpired: false };
        });
      
      // Process expired contracts
      const processedExpired = expired
        .filter(c => c.endDate)
        .map(c => {
          const endDate = new Date(c.endDate!);
          endDate.setHours(0, 0, 0, 0);
          const days = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return { ...c, daysUntilExpiry: days, isExpired: true };
        });
      
      // Combine and sort
      const allReminders = [...processedExpiring, ...processedExpired]
        .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
      
      this.reminders.set(allReminders);
      this.remindersData$.next(allReminders);
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
