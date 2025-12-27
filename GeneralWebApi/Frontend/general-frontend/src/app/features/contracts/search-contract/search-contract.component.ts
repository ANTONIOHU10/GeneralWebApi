// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/contracts/search-contract/search-contract.component.ts
import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, of, delay, Subject } from 'rxjs';
import { first, catchError, filter, takeUntil, distinctUntilChanged } from 'rxjs/operators';
import { ContractDetailComponent } from '../contract-detail/contract-detail.component';
import {
  BaseCardComponent,
  BaseAsyncStateComponent,
  BaseFormComponent,
  BaseTableComponent,
  SelectOption,
  FormConfig,
  TableColumn,
  TableAction,
} from '../../../Shared/components/base';
import { NotificationService } from '../../../Shared/services/notification.service';
import { DialogService } from '../../../Shared/services/dialog.service';
import { TranslationService } from '@core/services/translation.service';
import { TranslatePipe } from '@core/pipes/translate.pipe';
import { Contract, CONTRACT_TYPES, CONTRACT_STATUSES } from 'app/contracts/contracts/contract.model';

@Component({
  selector: 'app-search-contract',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ContractDetailComponent,
    BaseCardComponent,
    BaseAsyncStateComponent,
    BaseFormComponent,
    BaseTableComponent,
    TranslatePipe,
  ],
  templateUrl: './search-contract.component.html',
  styleUrls: ['./search-contract.component.scss'],
})
export class SearchContractComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);
  private dialogService = inject(DialogService);
  private translationService = inject(TranslationService);
  private destroy$ = new Subject<void>();

  // State
  allContracts = signal<Contract[]>([]);

  // Search filters
  searchFilters = signal<Record<string, unknown>>({
    employeeName: '',
    contractType: null,
    status: null,
    startDateFrom: null,
    startDateTo: null,
  });

  // Observables for BaseAsyncStateComponent
  loading$ = new BehaviorSubject<boolean>(false);
  contractsData$ = new BehaviorSubject<Contract[] | null>(null);

  selectedContractForDetail: Contract | null = null;
  isDetailModalOpen = false;
  detailMode: 'edit' | 'view' = 'view';

  // Mock data for search
  private mockContracts: Contract[] = [
    {
      id: '1',
      employeeId: 1,
      employeeName: 'John Doe',
      contractType: 'Indefinite',
      startDate: '2023-01-01T00:00:00Z',
      endDate: null,
      status: 'Active',
      salary: 50000,
      notes: 'Full-time permanent contract',
      renewalReminderDate: null,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: null,
    },
    {
      id: '2',
      employeeId: 2,
      employeeName: 'Jane Smith',
      contractType: 'Fixed',
      startDate: '2023-06-01T00:00:00Z',
      endDate: '2025-06-01T00:00:00Z',
      status: 'Active',
      salary: 60000,
      notes: 'Two-year fixed term contract',
      renewalReminderDate: '2025-05-01T00:00:00Z',
      createdAt: '2023-06-01T00:00:00Z',
      updatedAt: null,
    },
    {
      id: '3',
      employeeId: 3,
      employeeName: 'Bob Johnson',
      contractType: 'PartTime',
      startDate: '2023-03-15T00:00:00Z',
      endDate: null,
      status: 'Active',
      salary: 30000,
      notes: 'Part-time contract, 20 hours per week',
      renewalReminderDate: null,
      createdAt: '2023-03-15T00:00:00Z',
      updatedAt: null,
    },
    {
      id: '4',
      employeeId: 4,
      employeeName: 'Alice Williams',
      contractType: 'Fixed',
      startDate: '2022-01-01T00:00:00Z',
      endDate: '2024-01-01T00:00:00Z',
      status: 'Expired',
      salary: 55000,
      notes: 'Contract has expired',
      renewalReminderDate: null,
      createdAt: '2022-01-01T00:00:00Z',
      updatedAt: null,
    },
    {
      id: '5',
      employeeId: 5,
      employeeName: 'Charlie Brown',
      contractType: 'Temporary',
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-12-31T00:00:00Z',
      status: 'Active',
      salary: 40000,
      notes: 'Temporary contract for project duration',
      renewalReminderDate: '2024-11-01T00:00:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: null,
    },
    {
      id: '6',
      employeeId: 6,
      employeeName: 'David Lee',
      contractType: 'Internship',
      startDate: '2024-06-01T00:00:00Z',
      endDate: '2024-12-31T00:00:00Z',
      status: 'Active',
      salary: 25000,
      notes: 'Internship contract',
      renewalReminderDate: null,
      createdAt: '2024-06-01T00:00:00Z',
      updatedAt: null,
    },
  ];

  // Table configuration
  tableColumns: TableColumn[] = [
    { key: 'id', label: 'ID', sortable: true, width: '80px' },
    { key: 'employeeName', label: 'Employee', sortable: true, width: '150px' },
    { key: 'contractType', label: 'Type', sortable: true, width: '120px' },
    { key: 'status', label: 'Status', sortable: true, width: '100px' },
    { key: 'startDate', label: 'Start Date', sortable: true, type: 'date', width: '120px' },
    { key: 'endDate', label: 'End Date', sortable: true, type: 'date', width: '120px' },
    { key: 'salary', label: 'Salary', sortable: true, type: 'number', width: '120px' },
    { key: 'createdAt', label: 'Created At', sortable: true, type: 'date', width: '150px' },
  ];

  tableActions: TableAction[] = [
    {
      label: 'View',
      icon: 'visibility',
      variant: 'ghost',
      showLabel: false,
      onClick: (item: unknown) => this.onViewContract(item as Contract),
    },
    {
      label: 'Edit',
      icon: 'edit',
      variant: 'primary',
      showLabel: false,
      onClick: (item: unknown) => this.onEditContract(item as Contract),
    },
    {
      label: 'Delete',
      icon: 'delete',
      variant: 'danger',
      showLabel: false,
      onClick: (item: unknown) => this.onDeleteContract(item as Contract),
    },
  ];

  // Search form configuration
  searchFormConfig: FormConfig = {
    sections: [],
    layout: { columns: 3, gap: '1rem', sectionGap: '1.5rem', labelPosition: 'top', showSectionDividers: false },
    fields: [],
    submitButtonText: '',
    cancelButtonText: '',
    submitButtonVariant: 'primary',
    cancelButtonVariant: 'secondary',
  };

  /**
   * Initialize form config with translations
   * Note: sections is empty because the form is wrapped in a card that already has title
   */
  private initializeSearchFormConfig(): void {
    this.searchFormConfig = {
      sections: [], // No sections - card already has title
      layout: { columns: 3, gap: '1rem', sectionGap: '1.5rem', labelPosition: 'top', showSectionDividers: false },
      fields: [
        { key: 'employeeName', type: 'input', label: this.translationService.translate('contracts.search.fields.employeeName'), placeholder: this.translationService.translate('contracts.search.fields.employeeNamePlaceholder'), order: 0, colSpan: 1 },
        { key: 'contractType', type: 'select', label: this.translationService.translate('contracts.search.fields.contractType'), placeholder: this.translationService.translate('contracts.search.fields.contractTypePlaceholder'), order: 1, colSpan: 1, options: [
          { value: null, label: this.translationService.translate('contracts.search.fields.allTypes') },
          ...CONTRACT_TYPES.map(type => ({ value: type.value, label: type.label })) as SelectOption[]
        ] },
        { key: 'status', type: 'select', label: this.translationService.translate('contracts.search.fields.status'), placeholder: this.translationService.translate('contracts.search.fields.statusPlaceholder'), order: 2, colSpan: 1, options: [
          { value: null, label: this.translationService.translate('contracts.search.fields.allStatuses') },
          ...CONTRACT_STATUSES.map(status => ({ value: status.value, label: status.label })) as SelectOption[]
        ] },
        { key: 'startDateFrom', type: 'datepicker', label: this.translationService.translate('contracts.search.fields.startDateFrom'), placeholder: this.translationService.translate('contracts.search.fields.startDateFromPlaceholder'), order: 3, colSpan: 1 },
        { key: 'startDateTo', type: 'datepicker', label: this.translationService.translate('contracts.search.fields.startDateTo'), placeholder: this.translationService.translate('contracts.search.fields.startDateToPlaceholder'), order: 4, colSpan: 1 },
      ],
      submitButtonText: this.translationService.translate('contracts.search.submitButton'),
      cancelButtonText: this.translationService.translate('common.clear'),
      submitButtonVariant: 'primary',
      cancelButtonVariant: 'secondary',
    };
  }

  ngOnInit(): void {
    // Wait for translations to load before initializing form config
    this.translationService.getTranslationsLoaded$().pipe(
      distinctUntilChanged(),
      filter(loaded => loaded),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.initializeSearchFormConfig();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Search contracts with filters (using mock data)
   */
  private searchContractsWithFilters(filters: Record<string, unknown>): void {
    this.loading$.next(true);

    // Simulate API call with delay
    of(this.mockContracts).pipe(
      delay(500), // Simulate network delay
      first(),
      catchError(err => {
        const errorMessage = err.message || 'Failed to search contracts';
        this.loading$.next(false);
        this.allContracts.set([]);
        this.contractsData$.next([]);
        this.notificationService.error(
          'Search Failed',
          errorMessage,
          { duration: 5000, persistent: false, autoClose: true }
        );
        return of([]);
      })
    ).subscribe({
      next: (contracts: Contract[]) => {
        // Apply filters to mock data
        let filteredContracts = [...contracts];

        // Filter by employee name
        if (filters['employeeName'] && (filters['employeeName'] as string).trim()) {
          const searchTerm = (filters['employeeName'] as string).toLowerCase().trim();
          filteredContracts = filteredContracts.filter(c =>
            c.employeeName?.toLowerCase().includes(searchTerm)
          );
        }

        // Filter by contract type
        if (filters['contractType']) {
          filteredContracts = filteredContracts.filter(c =>
            c.contractType === filters['contractType']
          );
        }

        // Filter by status
        if (filters['status']) {
          filteredContracts = filteredContracts.filter(c =>
            c.status === filters['status']
          );
        }

        // Filter by start date range
        if (filters['startDateFrom']) {
          const fromDate = new Date(filters['startDateFrom'] as string);
          filteredContracts = filteredContracts.filter(c => {
            const contractDate = new Date(c.startDate);
            return contractDate >= fromDate;
          });
        }

        if (filters['startDateTo']) {
          const toDate = new Date(filters['startDateTo'] as string);
          filteredContracts = filteredContracts.filter(c => {
            const contractDate = new Date(c.startDate);
            return contractDate <= toDate;
          });
        }

        this.allContracts.set(filteredContracts);
        this.contractsData$.next(filteredContracts);
        this.loading$.next(false);

        if (filteredContracts.length > 0) {
          this.notificationService.info(
            'Search Completed',
            `Found ${filteredContracts.length} contract(s) matching your criteria`,
            { duration: 3000, autoClose: true }
          );
        } else {
          this.notificationService.info(
            'No Results',
            'No contracts found matching your criteria',
            { duration: 3000, autoClose: true }
          );
        }
      }
    });
  }

  /**
   * Handle search form submit
   */
  onSearchFormSubmit(data: Record<string, unknown>): void {
    // Update search filters
    this.searchFilters.set({
      employeeName: data['employeeName'] || '',
      contractType: data['contractType'] ?? null,
      status: data['status'] ?? null,
      startDateFrom: data['startDateFrom'] ?? null,
      startDateTo: data['startDateTo'] ?? null,
    });

    // Search contracts with filters
    this.searchContractsWithFilters(this.searchFilters());
  }

  /**
   * Handle search form cancel (clear filters)
   */
  onSearchFormCancel(): void {
    this.searchFilters.set({
      employeeName: '',
      contractType: null,
      status: null,
      startDateFrom: null,
      startDateTo: null,
    });

    // Clear contracts
    this.allContracts.set([]);
    this.contractsData$.next([]);
  }

  onEditContract(contract: Contract): void {
    this.selectedContractForDetail = contract;
    this.detailMode = 'edit';
    this.isDetailModalOpen = true;
  }

  /**
   * Handle delete contract action with confirmation
   */
  onDeleteContract(contract: Contract): void {
    const employeeName = contract.employeeName || 'Unknown';

    this.dialogService.confirm({
      title: this.translationService.translate('common.deleteConfirm.title'),
      message: this.translationService.translate('contracts.delete.confirmMessage', { name: employeeName }),
      confirmText: this.translationService.translate('common.delete'),
      cancelText: this.translationService.translate('common.cancel'),
      confirmVariant: 'danger',
      icon: 'warning',
    }).pipe(
      first(),
      filter((confirmed: boolean) => confirmed)
    ).subscribe(() => {
      // Remove from local state
      const currentContracts = this.allContracts();
      const updatedContracts = currentContracts.filter(c => c.id !== contract.id);
      this.allContracts.set(updatedContracts);
      this.contractsData$.next(updatedContracts);

      this.notificationService.success(
        'Contract Deleted',
        `Contract for ${employeeName} has been deleted successfully`,
        { duration: 3000, autoClose: true }
      );
    });
  }

  onViewContract(contract: Contract): void {
    this.selectedContractForDetail = contract;
    this.detailMode = 'view';
    this.isDetailModalOpen = true;
  }

  /**
   * Handle table row click event
   */
  onRowClick(item: unknown): void {
    this.onViewContract(item as Contract);
  }

  onCloseDetailModal(): void {
    this.isDetailModalOpen = false;
    this.selectedContractForDetail = null;
    this.detailMode = 'view';
  }

  onContractUpdated(contract: Contract): void {
    // Update contract in local state
    const currentContracts = this.allContracts();
    const updatedContracts = currentContracts.map(c =>
      c.id === contract.id ? contract : c
    );
    this.allContracts.set(updatedContracts);
    this.contractsData$.next(updatedContracts);
  }

  onRetryLoad = (): void => {
    // Retry search with current filters
    this.searchContractsWithFilters(this.searchFilters());
  };

  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatCurrency(amount: number | null | undefined): string {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }
}

