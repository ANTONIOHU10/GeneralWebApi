// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/contracts/contract-list/contract-list.component.ts
import { Component, signal, inject, OnInit, OnDestroy, AfterViewInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { takeUntil, filter, take, catchError, map } from 'rxjs/operators';
import { ContractCardComponent } from '../contract-card/contract-card.component';
import { AddContractComponent } from '../add-contract/add-contract.component';
import { ContractDetailComponent } from '../contract-detail/contract-detail.component';
import { SearchContractComponent } from '../search-contract/search-contract.component';
import { SubmitContractApprovalComponent } from '../submit-contract-approval/submit-contract-approval.component';
import {
  BasePrivatePageContainerComponent,
  BaseSearchComponent,
  BaseAsyncStateComponent,
  BaseTableComponent,
  BaseBadgeComponent,
  BaseButtonComponent,
  TabItem,
  TableColumn,
  TableAction,
  TableConfig,
  BadgeVariant,
} from '../../../Shared/components/base';
import { Contract } from 'app/contracts/contracts/contract.model';
import {
  DialogService,
  NotificationService,
} from '../../../Shared/services';
import { ContractService } from '../../../core/services/contract.service';
import { of } from 'rxjs';

@Component({
  selector: 'app-contract-list',
  standalone: true,
  imports: [
    CommonModule,
    ContractCardComponent,
    AddContractComponent,
    ContractDetailComponent,
    SearchContractComponent,
    SubmitContractApprovalComponent,
    BasePrivatePageContainerComponent,
    BaseSearchComponent,
    BaseAsyncStateComponent,
    BaseTableComponent,
    BaseBadgeComponent,
    BaseButtonComponent,
  ],
  templateUrl: './contract-list.component.html',
  styleUrls: ['./contract-list.component.scss'],
})
export class ContractListComponent implements OnInit, OnDestroy, AfterViewInit {
  private dialogService = inject(DialogService);
  private notificationService = inject(NotificationService);
  private contractService = inject(ContractService);
  private destroy$ = new Subject<void>();

  // Local state
  contracts$ = new BehaviorSubject<Contract[]>([]);
  loading$ = new BehaviorSubject<boolean>(false);
  error$ = new BehaviorSubject<string | null>(null);

  // Local state
  activeTab = signal<'list' | 'add' | 'search' | 'submit-approval'>('list');
  selectedContractForDetail: Contract | null = null;
  isDetailModalOpen = false;
  detailMode: 'edit' | 'view' = 'view';
  searchTerm = signal<string>('');
  
  // View mode: 'table' or 'card'
  viewMode = signal<'table' | 'card'>('table');

  // Table configuration
  @ViewChild('statusTemplate', { static: false }) statusTemplate!: TemplateRef<unknown>;
  
  tableColumns: TableColumn[] = [];
  tableActions: TableAction[] = [];
  tableConfig: TableConfig = {
    showHeader: true,
    showFooter: true,
    showPagination: true,
    showSearch: false,
    showActions: true,
    striped: true,
    hoverable: true,
    bordered: false,
    size: 'medium',
    loading: false,
    emptyMessage: 'No contracts found',
  };
  
  // Convert contracts$ to array for table
  contractsArray$ = this.contracts$.pipe(
    map(contracts => contracts || [])
  );

  // Tab configuration
  tabs: TabItem[] = [
    { id: 'list', label: 'Contract List', icon: 'list' },
    { id: 'add', label: 'Add Contract', icon: 'add' },
    { id: 'submit-approval', label: 'Submit for Approval', icon: 'check_circle' },
    { id: 'search', label: 'Search Contract', icon: 'search' },
  ];

  ngOnInit() {
    this.loadContracts();
    this.initializeTable();
  }

  ngAfterViewInit(): void {
    // Set template references for custom columns
    const statusColumn = this.tableColumns.find(col => col.key === 'status');
    if (statusColumn && this.statusTemplate) {
      statusColumn.template = this.statusTemplate;
    }
  }

  /**
   * Initialize table columns and actions
   */
  private initializeTable(): void {
    this.tableColumns = [
      {
        key: 'employeeName',
        label: 'Employee',
        width: '180px',
        align: 'left',
        type: 'text',
        sortable: true,
      },
      {
        key: 'contractType',
        label: 'Contract Type',
        width: '140px',
        align: 'left',
        type: 'text',
        sortable: true,
      },
      {
        key: 'startDate',
        label: 'Start Date',
        width: '120px',
        align: 'left',
        type: 'date',
        sortable: true,
      },
      {
        key: 'endDate',
        label: 'End Date',
        width: '120px',
        align: 'left',
        type: 'date',
        sortable: true,
      },
      {
        key: 'status',
        label: 'Status',
        width: '120px',
        align: 'center',
        type: 'custom',
        sortable: true,
      },
      {
        key: 'salary',
        label: 'Salary',
        width: '120px',
        align: 'right',
        type: 'number',
        sortable: true,
      },
    ];

    this.tableActions = [
      {
        label: 'View',
        icon: 'visibility',
        variant: 'primary',
        showLabel: false,
        onClick: (contract: unknown) => {
          this.onViewContract(contract as Contract);
        },
      },
      {
        label: 'Edit',
        icon: 'edit',
        variant: 'warning',
        showLabel: false,
        onClick: (contract: unknown) => {
          this.onEditContract(contract as Contract);
        },
      },
      {
        label: 'Delete',
        icon: 'delete',
        variant: 'danger',
        showLabel: false,
        onClick: (contract: unknown) => {
          this.onDeleteContract(contract as Contract);
        },
      },
    ];
  }

  /**
   * Get status variant for badge
   */
  getStatusVariant(status: string): BadgeVariant {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'success';
      case 'expired':
        return 'warning';
      case 'terminated':
        return 'danger';
      case 'pending':
        return 'secondary';
      default:
        return 'primary';
    }
  }

  /**
   * Toggle between table and card view
   */
  toggleViewMode(): void {
    this.viewMode.set(this.viewMode() === 'table' ? 'card' : 'table');
  }

  /**
   * Get view mode icon
   */
  getViewModeIcon(): string {
    return this.viewMode() === 'table' ? 'view_module' : 'table_view';
  }

  /**
   * Get view mode label
   */
  getViewModeLabel(): string {
    return this.viewMode() === 'table' ? 'Card View' : 'Table View';
  }

  /**
   * Handle table row click - view contract details
   */
  onTableRowClick(contract: unknown): void {
    this.onViewContract(contract as Contract);
  }

  /**
   * Handle table sort change (not implemented for contracts yet)
   */
  onTableSortChange(event: { column: string; direction: 'asc' | 'desc' }): void {
    // TODO: Implement sorting for contracts
    console.log('Sort changed:', event);
  }

  /**
   * Handle table page change (not implemented for contracts yet)
   */
  onTablePageChange(page: number): void {
    // TODO: Implement pagination for contracts
    console.log('Page changed:', page);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadContracts(searchTerm?: string) {
    console.log('🔄 Loading contracts...');
    this.loading$.next(true);
    this.error$.next(null);

    const params = {
      pageNumber: 1,
      pageSize: 100, // Load first 100 contracts
      ...(searchTerm && searchTerm.trim() ? { searchTerm: searchTerm.trim() } : {}),
    };

    this.contractService.getContracts(params).pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        const errorMessage = error.message || 'Failed to load contracts';
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
          this.contracts$.next(response.data);
          this.loading$.next(false);
          console.log('✅ Contracts loaded:', response.data.length);
        } else {
          this.contracts$.next([]);
          this.loading$.next(false);
        }
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

      this.contractService.deleteContract(contract.id).pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          this.loading$.next(false);
          this.notificationService.error(
            'Delete Failed',
            error.message || 'Failed to delete contract',
            { duration: 5000, persistent: false, autoClose: true }
          );
          return of(null);
        })
      ).subscribe({
        next: () => {
          // Reload contracts after successful deletion
          this.loadContracts(this.searchTerm());
          this.notificationService.success(
            'Contract Deleted',
            `Contract for ${employeeName} has been deleted successfully`,
            { duration: 3000, autoClose: true }
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

  setActiveTab(tab: 'list' | 'add' | 'search' | 'submit-approval'): void {
    this.activeTab.set(tab);
  }

  onTabChange(tabId: string): void {
    const newTab = tabId as 'list' | 'add' | 'search' | 'submit-approval';
    this.setActiveTab(newTab);
  }

  onApprovalSubmitted(): void {
    // Reload contracts to reflect status changes
    this.loadContracts();
    // Switch to list tab
    this.setActiveTab('list');
  }

  onSearchChange(searchTerm: string) {
    this.searchTerm.set(searchTerm);
    // Reload contracts with search term from backend
    this.loadContracts(searchTerm);
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
