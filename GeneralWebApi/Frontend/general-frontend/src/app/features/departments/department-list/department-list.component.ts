// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/departments/department-list/department-list.component.ts
import { Component, signal, inject, OnInit, OnDestroy, AfterViewInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, Observable } from 'rxjs';
import { takeUntil, filter, take, map } from 'rxjs/operators';
import { DepartmentCardComponent } from '../department-card/department-card.component';
import { AddDepartmentComponent } from '../add-department/add-department.component';
import { DepartmentDetailComponent } from '../department-detail/department-detail.component';
import { SearchDepartmentComponent } from '../search-department/search-department.component';
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
import { DepartmentFacade } from '@store/department/department.facade';
import { Department } from 'app/contracts/departments/department.model';
import {
  DialogService,
  NotificationService,
  OperationNotificationService,
} from '../../../Shared/services';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [
    CommonModule,
    DepartmentCardComponent,
    AddDepartmentComponent,
    DepartmentDetailComponent,
    SearchDepartmentComponent,
    BasePrivatePageContainerComponent,
    BaseSearchComponent,
    BaseAsyncStateComponent,
    BaseTableComponent,
    BaseBadgeComponent,
    BaseButtonComponent,
  ],
  templateUrl: './department-list.component.html',
  styleUrls: ['./department-list.component.scss'],
})
export class DepartmentListComponent implements OnInit, OnDestroy, AfterViewInit {
  private departmentFacade = inject(DepartmentFacade);
  private dialogService = inject(DialogService);
  private notificationService = inject(NotificationService);
  private operationNotification = inject(OperationNotificationService);
  private destroy$ = new Subject<void>();

  // Observable streams from NgRx store
  departments$ = this.departmentFacade.filteredDepartments$;
  loading$ = this.departmentFacade.loading$;
  error$ = this.departmentFacade.error$;
  pagination$ = this.departmentFacade.pagination$;
  filters$ = this.departmentFacade.filters$;
  operationInProgress$ = this.departmentFacade.operationInProgress$;

  // Local state
  activeTab = signal<'list' | 'add' | 'search'>('list');
  selectedDepartmentForDetail: Department | null = null;
  isDetailModalOpen = false;
  detailMode: 'edit' | 'view' = 'view';
  
  // View mode: 'table' or 'card'
  viewMode = signal<'table' | 'card'>('table');

  // Table configuration
  @ViewChild('levelTemplate', { static: false }) levelTemplate!: TemplateRef<unknown>;
  
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
    emptyMessage: 'No departments found',
  };
  
  // Convert departments$ to array for table
  departmentsArray$ = this.departments$.pipe(
    map(departments => departments || [])
  );

  // Tab configuration
  tabs: TabItem[] = [
    { id: 'list', label: 'Department List', icon: 'list' },
    { id: 'add', label: 'Add Department', icon: 'add' },
    { id: 'search', label: 'Search Department', icon: 'search' },
  ];

  ngOnInit() {
    this.loadDepartments();
    this.setupOperationListeners();
    this.initializeTable();
  }

  ngAfterViewInit(): void {
    // Set template references for custom columns
    const levelColumn = this.tableColumns.find(col => col.key === 'level');
    if (levelColumn && this.levelTemplate) {
      levelColumn.template = this.levelTemplate;
    }
  }

  /**
   * Initialize table columns and actions
   */
  private initializeTable(): void {
    this.tableColumns = [
      {
        key: 'code',
        label: 'Code',
        width: '100px',
        align: 'left',
        type: 'text',
        sortable: true,
      },
      {
        key: 'name',
        label: 'Name',
        width: '200px',
        align: 'left',
        type: 'text',
        sortable: true,
      },
      {
        key: 'description',
        label: 'Description',
        width: '250px',
        align: 'left',
        type: 'text',
        sortable: false,
      },
      {
        key: 'parentDepartmentName',
        label: 'Parent Department',
        width: '180px',
        align: 'left',
        type: 'text',
        sortable: false, // Backend doesn't support sorting by parentDepartmentName
      },
      {
        key: 'level',
        label: 'Level',
        width: '80px',
        align: 'center',
        type: 'custom',
        sortable: true,
      },
      {
        key: 'path',
        label: 'Path',
        width: '200px',
        align: 'left',
        type: 'text',
        sortable: false,
      },
      {
        key: 'createdAt',
        label: 'Created At',
        width: '150px',
        align: 'left',
        type: 'date',
        sortable: true,
      },
    ];

    this.tableActions = [
      {
        label: 'View',
        icon: 'visibility',
        variant: 'primary',
        showLabel: false,
        onClick: (department: unknown) => {
          this.onViewDepartment(department as Department);
        },
      },
      {
        label: 'Edit',
        icon: 'edit',
        variant: 'warning',
        showLabel: false,
        onClick: (department: unknown) => {
          this.onEditDepartment(department as Department);
        },
      },
      {
        label: 'Delete',
        icon: 'delete',
        variant: 'danger',
        showLabel: false,
        onClick: (department: unknown) => {
          this.onDeleteDepartment(department as Department);
        },
      },
    ];
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
   * Handle table row click - view department details
   */
  onTableRowClick(department: unknown): void {
    this.onViewDepartment(department as Department);
  }

  /**
   * Handle table sort change
   * Maps frontend column keys to backend sort field names
   */
  onTableSortChange(event: { column: string; direction: 'asc' | 'desc' }): void {
    // Map frontend column keys to backend sort field names
    // Backend allows: "Name", "Code", "Level", "CreatedAt"
    const sortFieldMap: Record<string, string> = {
      'name': 'Name',
      'code': 'Code',
      'level': 'Level',
      'createdAt': 'CreatedAt',
    };

    const backendSortField = sortFieldMap[event.column.toLowerCase()] || event.column;
    this.departmentFacade.setFilters({ 
      sortBy: backendSortField, 
      sortDescending: event.direction === 'desc' 
    });
  }

  /**
   * Handle table page change
   */
  onTablePageChange(page: number): void {
    this.departmentFacade.setPagination({ currentPage: page });
  }

  private setupOperationListeners(): void {
    this.operationNotification.setup({
      error$: this.departmentFacade.error$,
      operationInProgress$: this.departmentFacade.operationInProgress$,
      destroy$: this.destroy$,
      autoShowLoading: true,
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDepartments() {
    console.log('🔄 Loading departments...');
    this.departmentFacade.loadDepartments();
  }

  onEditDepartment(department: Department) {
    this.departmentFacade.selectDepartment(department);
    this.selectedDepartmentForDetail = department;
    this.detailMode = 'edit';
    this.isDetailModalOpen = true;
  }

  onDeleteDepartment(department: Department) {
    const departmentName = department.name;

    const confirm$: Observable<boolean> = this.dialogService.confirm({
      title: 'Confirm Delete',
      message: `Are you sure you want to delete ${departmentName}? This action cannot be undone.`,
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
      this.operationNotification.trackOperation({
        type: 'delete',
        employeeName: departmentName,
      });

      this.departmentFacade.deleteDepartment(department.id);
    });
  }

  onViewDepartment(department: Department) {
    this.departmentFacade.selectDepartment(department);
    this.selectedDepartmentForDetail = department;
    this.detailMode = 'view';
    this.isDetailModalOpen = true;
  }

  onCloseDetailModal() {
    this.isDetailModalOpen = false;
    this.selectedDepartmentForDetail = null;
    this.detailMode = 'view';
  }

  onDepartmentUpdated(department: Department) {
    // Effect will handle reload automatically
  }

  onDepartmentCreated() {
    // Don't reload - the store automatically adds the new department to the list
  }

  setActiveTab(tab: 'list' | 'add' | 'search'): void {
    this.activeTab.set(tab);
  }

  onTabChange(tabId: string): void {
    const newTab = tabId as 'list' | 'add' | 'search';
    this.setActiveTab(newTab);

    if (newTab === 'list') {
      this.operationInProgress$.pipe(take(1)).subscribe(operation => {
        if (!operation.loading) {
          this.clearError();
        }
      });
    }
  }

  onSearchChange(searchTerm: string) {
    this.departmentFacade.setFilters({ searchTerm });
  }

  clearFilters() {
    this.departmentFacade.clearFilters();
  }

  clearError() {
    this.departmentFacade.clearError();
  }

  onRetryLoad = () => {
    this.loadDepartments();
  };

  onEmptyActionClick = () => {
    this.setActiveTab('add');
  };
}
