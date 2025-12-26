// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/positions/position-list/position-list.component.ts
import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, Observable, combineLatest } from 'rxjs';
import { takeUntil, filter, take, map, distinctUntilChanged } from 'rxjs/operators';
import { PositionCardComponent } from '../position-card/position-card.component';
import { AddPositionComponent } from '../add-position/add-position.component';
import { PositionDetailComponent } from '../position-detail/position-detail.component';
import { SearchPositionComponent } from '../search-position/search-position.component';
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
} from '../../../Shared/components/base';
import { TranslatePipe } from '@core/pipes/translate.pipe';
import { TranslationService } from '@core/services/translation.service';
import { PositionFacade } from '@store/position/position.facade';
import { Position } from 'app/contracts/positions/position.model';
import {
  DialogService,
  NotificationService,
  OperationNotificationService,
} from '../../../Shared/services';

@Component({
  selector: 'app-position-list',
  standalone: true,
  imports: [
    CommonModule,
    PositionCardComponent,
    AddPositionComponent,
    PositionDetailComponent,
    SearchPositionComponent,
    BasePrivatePageContainerComponent,
    BaseSearchComponent,
    BaseAsyncStateComponent,
    BaseTableComponent,
    BaseBadgeComponent,
    BaseButtonComponent,
    TranslatePipe,
  ],
  templateUrl: './position-list.component.html',
  styleUrls: ['./position-list.component.scss'],
})
export class PositionListComponent implements OnInit, OnDestroy {
  private positionFacade = inject(PositionFacade);
  private dialogService = inject(DialogService);
  private notificationService = inject(NotificationService);
  private operationNotification = inject(OperationNotificationService);
  private translationService = inject(TranslationService);
  private destroy$ = new Subject<void>();

  // Observable streams from NgRx store
  positions$ = this.positionFacade.filteredPositions$;
  loading$ = this.positionFacade.loading$;
  error$ = this.positionFacade.error$;
  pagination$ = this.positionFacade.pagination$;
  filters$ = this.positionFacade.filters$;
  operationInProgress$ = this.positionFacade.operationInProgress$;

  // Local state
  activeTab = signal<'list' | 'add' | 'search'>('list');
  selectedPositionForDetail: Position | null = null;
  isDetailModalOpen = false;
  detailMode: 'edit' | 'view' = 'view';
  
  // View mode: 'table' or 'card'
  viewMode = signal<'table' | 'card'>('table');

  // Table configuration
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
    emptyMessage: '', // Will be set after translations load
  };
  
  // Convert positions$ to array for table
  positionsArray$ = this.positions$.pipe(
    map(positions => positions || [])
  );

  // Tab configuration - will be initialized in ngOnInit
  tabs: TabItem[] = [];

  ngOnInit() {
    // Wait for translations to load before initializing tabs and table
    this.translationService.getTranslationsLoaded$().pipe(
      filter(loaded => loaded),
      take(1),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.initializeTabs();
      this.initializeTable();
    });

    // Also listen for language changes to reinitialize translations
    this.translationService.getTranslationsLoaded$().pipe(
      distinctUntilChanged(),
      filter(loaded => loaded),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.initializeTabs();
      this.initializeTable();
    });

    this.loadPositions();
    this.setupOperationListeners();
  }

  /**
   * Initialize tabs with translations
   */
  private initializeTabs(): void {
    this.tabs = [
      { id: 'list', label: this.translationService.translate('positions.tabs.list'), icon: 'list' },
      { id: 'add', label: this.translationService.translate('positions.tabs.add'), icon: 'add' },
      { id: 'search', label: this.translationService.translate('positions.tabs.search'), icon: 'search' },
    ];
  }

  // Removed ngAfterViewInit - templates are now accessed via ContentChild in base-table component

  /**
   * Initialize table columns and actions
   */
  private initializeTable(): void {
    // Update table config with translated empty message
    this.tableConfig = {
      ...this.tableConfig,
      emptyMessage: this.translationService.translate('positions.emptyTitle'),
    };

    this.tableColumns = [
      {
        key: 'code',
        label: this.translationService.translate('positions.columns.code'),
        width: '100px',
        align: 'left',
        type: 'text',
        sortable: true,
      },
      {
        key: 'title',
        label: this.translationService.translate('positions.columns.name'),
        width: '200px',
        align: 'left',
        type: 'text',
        sortable: true,
      },
      {
        key: 'description',
        label: this.translationService.translate('positions.columns.description'),
        width: '250px',
        align: 'left',
        type: 'text',
        sortable: false,
      },
      {
        key: 'departmentName',
        label: this.translationService.translate('positions.columns.department'),
        width: '150px',
        align: 'left',
        type: 'text',
        sortable: false, // Backend doesn't support sorting by departmentName
      },
      {
        key: 'level',
        label: this.translationService.translate('positions.columns.level'),
        width: '80px',
        align: 'center',
        type: 'number',
        sortable: true,
      },
      {
        key: 'isManagement',
        label: this.translationService.translate('positions.columns.isManagement'),
        width: '120px',
        align: 'center',
        type: 'custom',
        templateKey: 'isManagement', // Matches ContentChild reference name
        sortable: false, // Backend doesn't support sorting by isManagement
      },
      {
        key: 'minSalary',
        label: this.translationService.translate('positions.columns.minSalary'),
        width: '120px',
        align: 'right',
        type: 'number',
        sortable: true,
      },
      {
        key: 'maxSalary',
        label: this.translationService.translate('positions.columns.maxSalary'),
        width: '120px',
        align: 'right',
        type: 'number',
        sortable: true,
      },
    ];

    this.tableActions = [
      {
        label: this.translationService.translate('table.actions.view'),
        icon: 'visibility',
        variant: 'primary',
        showLabel: false,
        onClick: (position: unknown) => {
          this.onViewPosition(position as Position);
        },
      },
      {
        label: this.translationService.translate('table.actions.edit'),
        icon: 'edit',
        variant: 'warning',
        showLabel: false,
        onClick: (position: unknown) => {
          this.onEditPosition(position as Position);
        },
      },
      {
        label: this.translationService.translate('table.actions.delete'),
        icon: 'delete',
        variant: 'danger',
        showLabel: false,
        onClick: (position: unknown) => {
          this.onDeletePosition(position as Position);
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
    return this.viewMode() === 'table' 
      ? this.translationService.translate('view.cardView') 
      : this.translationService.translate('view.tableView');
  }

  /**
   * Handle table row click - view position details
   */
  onTableRowClick(position: unknown): void {
    this.onViewPosition(position as Position);
  }

  /**
   * Handle table sort change
   * Maps frontend column keys to backend sort field names
   */
  onTableSortChange(event: { column: string; direction: 'asc' | 'desc' }): void {
    // Map frontend column keys to backend sort field names
    // Backend allows: "Title", "Code", "Level", "MinSalary", "MaxSalary", "CreatedAt"
    const sortFieldMap: Record<string, string> = {
      'title': 'Title',
      'code': 'Code',
      'level': 'Level',
      'minSalary': 'MinSalary',
      'maxSalary': 'MaxSalary',
      'createdAt': 'CreatedAt',
    };

    const backendSortField = sortFieldMap[event.column.toLowerCase()] || event.column;
    this.positionFacade.setFilters({ 
      sortBy: backendSortField, 
      sortDescending: event.direction === 'desc' 
    });
  }

  /**
   * Handle table page change
   */
  onTablePageChange(page: number): void {
    this.positionFacade.setPagination({ currentPage: page });
  }

  private setupOperationListeners(): void {
    this.operationNotification.setup({
      error$: this.positionFacade.error$,
      operationInProgress$: this.positionFacade.operationInProgress$,
      destroy$: this.destroy$,
      autoShowLoading: true,
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPositions() {
    console.log('🔄 Loading positions...');
    this.positionFacade.loadPositions();
  }

  onEditPosition(position: Position) {
    this.positionFacade.selectPosition(position);
    this.selectedPositionForDetail = position;
    this.detailMode = 'edit';
    this.isDetailModalOpen = true;
  }

  onDeletePosition(position: Position) {
    const positionTitle = position.title;

    const confirm$: Observable<boolean> = this.dialogService.confirm({
      title: this.translationService.translate('positions.delete.confirmTitle'),
      message: this.translationService.translate('positions.delete.confirmMessage', { name: positionTitle }),
      confirmText: this.translationService.translate('common.delete'),
      cancelText: this.translationService.translate('common.cancel'),
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
        employeeName: positionTitle,
      });

      this.positionFacade.deletePosition(position.id);
    });
  }

  onViewPosition(position: Position) {
    this.positionFacade.selectPosition(position);
    this.selectedPositionForDetail = position;
    this.detailMode = 'view';
    this.isDetailModalOpen = true;
  }

  onCloseDetailModal() {
    this.isDetailModalOpen = false;
    this.selectedPositionForDetail = null;
    this.detailMode = 'view';
  }

  onPositionUpdated(position: Position) {
    // Effect will handle reload automatically
  }

  onPositionCreated() {
    // Don't reload - the store automatically adds the new position to the list
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
    this.positionFacade.setFilters({ searchTerm });
  }

  clearFilters() {
    this.positionFacade.clearFilters();
  }

  clearError() {
    this.positionFacade.clearError();
  }

  onRetryLoad = () => {
    this.loadPositions();
  };

  onEmptyActionClick = () => {
    this.setActiveTab('add');
  };
}
