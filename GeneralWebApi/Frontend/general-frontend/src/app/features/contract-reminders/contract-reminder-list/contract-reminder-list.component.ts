// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/contract-reminders/contract-reminder-list/contract-reminder-list.component.ts
import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, forkJoin, of, Subject } from 'rxjs';
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
import { NotificationService, DialogService } from '../../../Shared/services';
import { TranslationService } from '@core/services/translation.service';
import { TranslatePipe } from '@core/pipes/translate.pipe';
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
    TranslatePipe,
  ],
  templateUrl: './contract-reminder-list.component.html',
  styleUrls: ['./contract-reminder-list.component.scss'],
})
export class ContractReminderListComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);
  private dialogService = inject(DialogService);
  private contractService = inject(ContractService);
  private translationService = inject(TranslationService);
  private destroy$ = new Subject<void>();

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

  tableColumns: TableColumn[] = [];
  tableActions: TableAction[] = [];

  /**
   * Initialize table config with translations
   */
  private initializeTableConfig(): void {
    this.tableColumns = [
      { key: 'employeeName', label: this.translationService.translate('contractReminders.columns.employee'), sortable: true, width: '150px' },
      { key: 'contractType', label: this.translationService.translate('contractReminders.columns.type'), sortable: true, width: '120px' },
      { key: 'endDate', label: this.translationService.translate('contractReminders.columns.endDate'), sortable: true, type: 'date', width: '120px' },
      { key: 'daysUntilExpiry', label: this.translationService.translate('contractReminders.columns.daysLeft'), sortable: true, type: 'number', width: '120px' },
      { key: 'status', label: this.translationService.translate('common.status'), sortable: true, width: '100px' },
    ];

    this.tableActions = [
      { label: this.translationService.translate('common.view'), icon: 'visibility', variant: 'ghost', showLabel: false, onClick: (item) => this.onView(item as ContractReminder) },
      { label: this.translationService.translate('contractReminders.actions.renew'), icon: 'refresh', variant: 'primary', showLabel: false, onClick: (item) => this.onRenew(item as ContractReminder) },
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
      this.loadReminders();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
        this.notificationService.error(
          this.translationService.translate('common.error'),
          err.message || this.translationService.translate('contractReminders.loadingFailed'),
          { duration: 5000 }
        );
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
    if (reminder.isExpired) return this.translationService.translate('contractReminders.status.expired');
    if (reminder.daysUntilExpiry === 0) return this.translationService.translate('contractReminders.status.today');
    if (reminder.daysUntilExpiry === 1) return this.translationService.translate('contractReminders.status.tomorrow');
    return this.translationService.translate('contractReminders.status.daysLeft', { count: reminder.daysUntilExpiry });
  }

  onView(reminder: ContractReminder): void {
    this.selectedContract = reminder;
    this.isDetailModalOpen = true;
  }

  onRenew(reminder: ContractReminder): void {
    const employeeName = reminder.employeeName || 'N/A';
    this.dialogService.confirm({
      title: this.translationService.translate('contractReminders.renew.confirmTitle'),
      message: this.translationService.translate('contractReminders.renew.confirmMessage', { name: employeeName }),
      confirmText: this.translationService.translate('contractReminders.actions.renew'),
      cancelText: this.translationService.translate('common.cancel'),
      confirmVariant: 'primary',
      icon: 'refresh',
    }).pipe(first(), filter(c => c)).subscribe(() => {
      this.notificationService.success(
        this.translationService.translate('contractReminders.renew.successTitle'),
        this.translationService.translate('contractReminders.renew.successMessage', { name: employeeName }),
        { duration: 3000 }
      );
    });
  }

  onRowClick = (item: unknown) => this.onView(item as ContractReminder);
  onRetryLoad = () => this.loadReminders();
  onContractUpdated = () => this.loadReminders();
  onCloseDetailModal = () => { this.isDetailModalOpen = false; this.selectedContract = null; };
}
