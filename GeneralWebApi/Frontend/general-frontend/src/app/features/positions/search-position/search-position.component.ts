// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/positions/search-position/search-position.component.ts
import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, of, Observable, Subject } from 'rxjs';
import { filter, startWith, first, catchError, take, delay, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { PositionDetailComponent } from '../position-detail/position-detail.component';
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
import { PositionFacade } from '@store/position/position.facade';
import { DepartmentFacade } from '@store/department/department.facade';
import { PositionService } from '@core/services/position.service';
import { NotificationService } from '../../../Shared/services/notification.service';
import { DialogService } from '../../../Shared/services/dialog.service';
import { TranslationService } from '@core/services/translation.service';
import { TranslatePipe } from '@core/pipes/translate.pipe';
import { Position } from 'app/contracts/positions/position.model';

@Component({
  selector: 'app-search-position',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PositionDetailComponent,
    BaseCardComponent,
    BaseAsyncStateComponent,
    BaseFormComponent,
    BaseTableComponent,
    TranslatePipe,
  ],
  templateUrl: './search-position.component.html',
  styleUrls: ['./search-position.component.scss'],
})
export class SearchPositionComponent implements OnInit, OnDestroy {
  private positionFacade = inject(PositionFacade);
  private departmentFacade = inject(DepartmentFacade);
  private positionService = inject(PositionService);
  private notificationService = inject(NotificationService);
  private dialogService = inject(DialogService);
  private translationService = inject(TranslationService);
  private destroy$ = new Subject<void>();

  // State
  allPositions = signal<Position[]>([]); // All positions from API (already filtered by backend)

  // Loading states for individual fields (for dropdown options loading)
  fieldLoading = signal<Record<string, boolean>>({
    departmentId: false,
  });

  // Search filters
  searchFilters = signal<Record<string, unknown>>({
    title: '',
    code: '',
    description: '',
    departmentId: null,
    level: null,
    isManagement: null,
  });

  // Observables from NgRx Store (for async pipe - automatically managed)
  departments$ = this.departmentFacade.departments$;

  // Observables for BaseAsyncStateComponent
  loading$ = new BehaviorSubject<boolean>(false);
  positionsData$ = new BehaviorSubject<Position[] | null>(null);

  selectedPositionForDetail: Position | null = null;
  isDetailModalOpen = false;
  detailMode: 'edit' | 'view' = 'view';

  // Table configuration
  tableColumns: TableColumn[] = [
    { key: 'code', label: 'Code', sortable: true, width: '100px' },
    { key: 'title', label: 'Title', sortable: true, width: '200px' },
    { key: 'description', label: 'Description', sortable: false, width: '300px' },
    { key: 'departmentName', label: 'Department', sortable: true, width: '150px' },
    { key: 'level', label: 'Level', sortable: true, width: '80px' },
    { key: 'isManagement', label: 'Management', sortable: true, width: '100px', type: 'boolean' },
    { key: 'minSalary', label: 'Min Salary', sortable: true, width: '120px', type: 'number' },
    { key: 'maxSalary', label: 'Max Salary', sortable: true, width: '120px', type: 'number' },
    { key: 'createdAt', label: 'Created At', sortable: true, type: 'date', width: '150px' },
  ];

  tableActions: TableAction[] = [
    {
      label: 'View',
      icon: 'visibility',
      variant: 'ghost',
      showLabel: false,
      onClick: (item: unknown) => this.onViewPosition(item as Position),
    },
    {
      label: 'Edit',
      icon: 'edit',
      variant: 'primary',
      showLabel: false,
      onClick: (item: unknown) => this.onEditPosition(item as Position),
    },
    {
      label: 'Delete',
      icon: 'delete',
      variant: 'danger',
      showLabel: false,
      onClick: (item: unknown) => this.onDeletePosition(item as Position),
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
        { key: 'title', type: 'input', label: this.translationService.translate('positions.search.fields.title'), placeholder: this.translationService.translate('positions.search.fields.titlePlaceholder'), order: 0, colSpan: 1 },
        { key: 'code', type: 'input', label: this.translationService.translate('positions.search.fields.code'), placeholder: this.translationService.translate('positions.search.fields.codePlaceholder'), order: 1, colSpan: 1 },
        { key: 'description', type: 'input', label: this.translationService.translate('positions.search.fields.description'), placeholder: this.translationService.translate('positions.search.fields.descriptionPlaceholder'), order: 2, colSpan: 1 },
        { key: 'departmentId', type: 'select', label: this.translationService.translate('positions.search.fields.department'), placeholder: this.translationService.translate('positions.search.fields.departmentPlaceholder'), order: 3, colSpan: 1, searchable: true, options: [{ value: null, label: this.translationService.translate('positions.search.fields.allDepartments') }] as SelectOption[] },
        { key: 'level', type: 'select', label: this.translationService.translate('positions.search.fields.level'), placeholder: this.translationService.translate('positions.search.fields.levelPlaceholder'), order: 4, colSpan: 1, options: [
          { value: null, label: this.translationService.translate('positions.search.fields.allLevels') },
          { value: 1, label: 'Level 1' }, { value: 2, label: 'Level 2' }, { value: 3, label: 'Level 3' }, { value: 4, label: 'Level 4' }
        ] as SelectOption[] },
        { key: 'isManagement', type: 'select', label: this.translationService.translate('positions.search.fields.isManagement'), placeholder: this.translationService.translate('positions.search.fields.isManagementPlaceholder'), order: 5, colSpan: 1, options: [
          { value: null, label: this.translationService.translate('positions.search.fields.allPositions') },
          { value: true, label: this.translationService.translate('positions.search.fields.management') },
          { value: false, label: this.translationService.translate('positions.search.fields.nonManagement') }
        ] as SelectOption[] },
      ],
      submitButtonText: this.translationService.translate('positions.search.submitButton'),
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

    // Load departments from store for department dropdown
    this.departments$.pipe(
      startWith([]),
      filter(depts => depts.length === 0),
      first()
    ).subscribe(() => {
      this.departmentFacade.loadDepartments();
    });

    // Update form options when data changes
    this.updateFormOptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Handle field dropdown open event
   * Load data when user clicks on department dropdown
   */
  onFieldDropdownOpen(key: string): void {
    if (key === 'departmentId') {
      this.loadDepartmentOptionsIfNeeded();
    }
  }

  /**
   * Load department options from store when user clicks dropdown
   */
  private loadDepartmentOptionsIfNeeded(): void {
    // Set loading state
    this.fieldLoading.update(loading => ({ ...loading, departmentId: true }));

    // Load from store
    this.departmentFacade.loadDepartments();

    // Wait for departments to load, then update options
    this.departmentFacade.departments$.pipe(
      filter(loadedDepts => loadedDepts.length > 0),
      first(),
      catchError(error => {
        console.error('❌ Error loading departments:', error);
        this.fieldLoading.update(loading => ({ ...loading, departmentId: false }));
        return of([]);
      })
    ).subscribe(loadedDepartments => {
      if (loadedDepartments.length > 0) {
        this.updateDepartmentOptions(loadedDepartments);
      }
      this.fieldLoading.update(loading => ({ ...loading, departmentId: false }));
    });
  }

  /**
   * Update form options when departments change
   */
  private updateFormOptions(): void {
    // Update department options when departments$ changes
    this.departments$.pipe(
      filter(depts => depts.length > 0)
    ).subscribe((depts) => {
      this.updateDepartmentOptions(depts);
    });
  }

  /**
   * Update department field options
   */
  private updateDepartmentOptions(departments: any[]): void {
    const departmentOptions: SelectOption[] = [
      { value: null, label: 'All Departments' },
      ...departments.map(dept => ({
        value: parseInt(dept.id),
        label: `${dept.name} (${dept.code})`
      }))
    ];

    const departmentField = this.searchFormConfig.fields.find(f => f.key === 'departmentId');
    if (departmentField) {
      departmentField.options = [...departmentOptions];
    }
  }

  /**
   * Search positions with backend API
   */
  private searchPositionsWithBackend(filters: Record<string, unknown>): void {
    this.loading$.next(true);

    // Convert filters to search parameters
    const searchParams = {
      title: filters['title'] as string || '',
      code: filters['code'] as string || '',
      description: filters['description'] as string || '',
      departmentId: filters['departmentId'] !== null && filters['departmentId'] !== undefined
        ? (typeof filters['departmentId'] === 'number' ? filters['departmentId'] : parseInt(filters['departmentId'] as string))
        : null,
      level: filters['level'] !== null && filters['level'] !== undefined
        ? (typeof filters['level'] === 'number' ? filters['level'] : parseInt(filters['level'] as string))
        : null,
      isManagement: filters['isManagement'] !== null && filters['isManagement'] !== undefined
        ? (typeof filters['isManagement'] === 'boolean' ? filters['isManagement'] : filters['isManagement'] === 'true' || filters['isManagement'] === true)
        : null,
    };

    // HTTP requests complete automatically, so no need for takeUntil
    // Using first() to ensure we only take the first value (HTTP emits once and completes)
    this.positionService.searchPositionsWithFilters(searchParams).pipe(
      first(),
      catchError(err => {
        const errorMessage = err.message || 'Failed to search positions';
        this.loading$.next(false);
        this.allPositions.set([]);
        this.positionsData$.next([]);

        // Show error notification instead of displaying in page
        this.notificationService.error(
          'Search Failed',
          errorMessage,
          {
            duration: 5000,
            persistent: false,
            autoClose: true,
          }
        );

        return of([]);
      })
    ).subscribe({
      next: (positions: Position[]) => {
        this.allPositions.set(positions);
        // Update positionsData$ Observable for BaseAsyncStateComponent
        this.positionsData$.next(positions);
        // Positions are already filtered by backend
        this.loading$.next(false);

        // Show success notification if positions found
        if (positions.length > 0) {
          this.notificationService.info(
            'Search Completed',
            `Found ${positions.length} position(s) matching your criteria`,
            {
              duration: 3000,
              autoClose: true,
            }
          );
        }
      }
    });
  }

  /**
   * Handle search form submit
   * Now uses backend search instead of frontend filtering
   */
  onSearchFormSubmit(data: Record<string, unknown>): void {
    // Update search filters
    this.searchFilters.set({
      title: data['title'] || '',
      code: data['code'] || '',
      description: data['description'] || '',
      departmentId: data['departmentId'] ?? null,
      level: data['level'] ?? null,
      isManagement: data['isManagement'] ?? null,
    });

    // Search positions using backend with all filters
    this.searchPositionsWithBackend(this.searchFilters());
  }

  /**
   * Handle search form cancel (clear filters)
   */
  onSearchFormCancel(): void {
    this.searchFilters.set({
      title: '',
      code: '',
      description: '',
      departmentId: null,
      level: null,
      isManagement: null,
    });

    // Clear positions
    this.allPositions.set([]);
    this.positionsData$.next([]);
  }

  onEditPosition(position: Position): void {
    this.selectedPositionForDetail = position;
    this.detailMode = 'edit';
    this.isDetailModalOpen = true;
  }

  /**
   * Handle delete position action with confirmation
   * Uses NgRx architecture: Dialog → Facade → Effect → Store → Notification
   */
  onDeletePosition(position: Position): void {
    const positionTitle = position.title;

    // Show confirmation dialog first
    const confirm$: Observable<boolean> = this.dialogService.confirm({
      title: this.translationService.translate('common.deleteConfirm.title'),
      message: this.translationService.translate('positions.delete.confirmMessage', { name: positionTitle }),
      confirmText: this.translationService.translate('common.delete'),
      cancelText: this.translationService.translate('common.cancel'),
      confirmVariant: 'danger',
      icon: 'warning',
    });

    confirm$.pipe(
      take(1),
      filter((confirmed: boolean) => confirmed)
    ).subscribe(() => {
      // Delete position through Facade (NgRx architecture)
      this.positionFacade.deletePosition(position.id);

      // Reload search results after delete operation completes
      this.reloadSearchAfterOperation();
    });
  }

  onViewPosition(position: Position): void {
    this.selectedPositionForDetail = position;
    this.detailMode = 'view';
    this.isDetailModalOpen = true;
  }

  /**
   * Handle table row click event
   */
  onRowClick(item: unknown): void {
    this.onViewPosition(item as Position);
  }

  onCloseDetailModal(): void {
    this.isDetailModalOpen = false;
    this.selectedPositionForDetail = null;
    this.detailMode = 'view';
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onPositionUpdated(position: Position): void {
    // Reload search results after update operation completes
    this.reloadSearchAfterOperation();
  }

  /**
   * Wait for operation to complete and reload search results
   * Prevents showing both global loading (from operation) and component loading (from search)
   */
  private reloadSearchAfterOperation(): void {
    this.positionFacade.operationInProgress$.pipe(
      filter(op => !op.loading && op.operation === null), // Wait for operation to complete
      take(1),
      delay(100) // Small delay to ensure state is fully updated
    ).subscribe(() => {
      this.searchPositionsWithBackend(this.searchFilters());
    });
  }

  onRetryLoad = (): void => {
    // Retry search with current filters
    this.searchPositionsWithBackend(this.searchFilters());
  };
}

