// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/contracts/contract-list/contract-list.component.ts
import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, Observable, BehaviorSubject, delay, of } from 'rxjs';
import { takeUntil, filter, take } from 'rxjs/operators';
import { ContractCardComponent } from '../contract-card/contract-card.component';
import { AddContractComponent } from '../add-contract/add-contract.component';
import { ContractDetailComponent } from '../contract-detail/contract-detail.component';
import { SearchContractComponent } from '../search-contract/search-contract.component';
import {
  BasePrivatePageContainerComponent,
  BaseSearchComponent,
  BaseAsyncStateComponent,
  TabItem,
} from '../../../Shared/components/base';
import { Contract } from 'app/contracts/contracts/contract.model';
import {
  DialogService,
  NotificationService,
} from '../../../Shared/services';

@Component({
  selector: 'app-contract-list',
  standalone: true,
  imports: [
    CommonModule,
    ContractCardComponent,
    AddContractComponent,
    ContractDetailComponent,
    SearchContractComponent,
    BasePrivatePageContainerComponent,
    BaseSearchComponent,
    BaseAsyncStateComponent,
  ],
  templateUrl: './contract-list.component.html',
  styleUrls: ['./contract-list.component.scss'],
})
export class ContractListComponent implements OnInit, OnDestroy {
  private dialogService = inject(DialogService);
  private notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();

  // Local state with mock data
  contracts$ = new BehaviorSubject<Contract[]>([]);
  loading$ = new BehaviorSubject<boolean>(false);
  error$ = new BehaviorSubject<string | null>(null);

  // Local state
  activeTab = signal<'list' | 'add' | 'search'>('list');
  selectedContractForDetail: Contract | null = null;
  isDetailModalOpen = false;
  detailMode: 'edit' | 'view' = 'view';
  searchTerm = signal<string>('');

  // Tab configuration
  tabs: TabItem[] = [
    { id: 'list', label: 'Contract List', icon: 'list' },
    { id: 'add', label: 'Add Contract', icon: 'add' },
    { id: 'search', label: 'Search Contract', icon: 'search' },
  ];

  ngOnInit() {
    this.loadContracts();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadContracts() {
    console.log('🔄 Loading contracts...');
    this.loading$.next(true);
    this.error$.next(null);

    // Simulate API call with mock data
    const mockContracts: Contract[] = [
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
    ];

    of(mockContracts).pipe(
      delay(500), // Simulate network delay
      takeUntil(this.destroy$)
    ).subscribe({
      next: (contracts) => {
        this.contracts$.next(contracts);
        this.loading$.next(false);
        console.log('✅ Contracts loaded:', contracts.length);
      },
      error: (error) => {
        this.error$.next(error.message || 'Failed to load contracts');
        this.loading$.next(false);
        this.notificationService.error(
          'Load Failed',
          error.message || 'Failed to load contracts',
          { duration: 5000, persistent: false, autoClose: true }
        );
      }
    });
  }

  onEditContract(contract: Contract) {
    this.selectedContractForDetail = contract;
    this.detailMode = 'edit';
    this.isDetailModalOpen = true;
  }

  onDeleteContract(contract: Contract) {
    const employeeName = contract.employeeName || 'Unknown';

    const confirm$: Observable<boolean> = this.dialogService.confirm({
      title: 'Confirm Delete',
      message: `Are you sure you want to delete the contract for ${employeeName}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmVariant: 'danger',
      icon: 'warning',
    });

    confirm$.pipe(
      take(1),
      takeUntil(this.destroy$),
      filter((confirmed: boolean) => confirmed)
    ).subscribe(() => {
      this.loading$.next(true);

      // Simulate API call
      of(true).pipe(
        delay(500),
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          // Remove from local state
          const currentContracts = this.contracts$.value;
          const updatedContracts = currentContracts.filter(c => c.id !== contract.id);
          this.contracts$.next(updatedContracts);
          this.loading$.next(false);

          this.notificationService.success(
            'Contract Deleted',
            `Contract for ${employeeName} has been deleted successfully`,
            { duration: 3000, autoClose: true }
          );
        },
        error: (error) => {
          this.loading$.next(false);
          this.notificationService.error(
            'Delete Failed',
            error.message || 'Failed to delete contract',
            { duration: 5000, persistent: false, autoClose: true }
          );
        }
      });
    });
  }

  onViewContract(contract: Contract) {
    this.selectedContractForDetail = contract;
    this.detailMode = 'view';
    this.isDetailModalOpen = true;
  }

  onCloseDetailModal() {
    this.isDetailModalOpen = false;
    this.selectedContractForDetail = null;
    this.detailMode = 'view';
  }

  onContractUpdated(contract: Contract) {
    // Update contract in local state
    const currentContracts = this.contracts$.value;
    const updatedContracts = currentContracts.map(c =>
      c.id === contract.id ? contract : c
    );
    this.contracts$.next(updatedContracts);
  }

  onContractCreated() {
    // Reload contracts
    this.loadContracts();
    // Switch to list tab
    this.setActiveTab('list');
  }

  setActiveTab(tab: 'list' | 'add' | 'search'): void {
    this.activeTab.set(tab);
  }

  onTabChange(tabId: string): void {
    const newTab = tabId as 'list' | 'add' | 'search';
    this.setActiveTab(newTab);
  }

  onSearchChange(searchTerm: string) {
    this.searchTerm.set(searchTerm);
    // Filter contracts based on search term
    if (!searchTerm.trim()) {
      this.loadContracts();
      return;
    }

    const currentContracts = this.contracts$.value;
    const filtered = currentContracts.filter(contract =>
      contract.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.contractType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.id.includes(searchTerm)
    );
    this.contracts$.next(filtered);
  }

  clearError() {
    this.error$.next(null);
  }

  onRetryLoad = () => {
    this.loadContracts();
  };

  onEmptyActionClick = () => {
    this.setActiveTab('add');
  };
}
