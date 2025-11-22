// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/departments/search-department/search-department.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, of, Observable } from 'rxjs';
import { filter, startWith, first, catchError, take, delay } from 'rxjs/operators';
import { DepartmentDetailComponent } from '../department-detail/department-detail.component';
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
import { DepartmentFacade } from '@store/department/department.facade';
import { DepartmentService } from '@core/services/department.service';
import { NotificationService } from '../../../Shared/services/notification.service';
import { DialogService } from '../../../Shared/services/dialog.service';
import { Department } from 'app/contracts/departments/department.model';

@Component({
  selector: 'app-search-department',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DepartmentDetailComponent,
    BaseCardComponent,
    BaseAsyncStateComponent,
    BaseFormComponent,
    BaseTableComponent,
  ],
  templateUrl: './search-department.component.html',
  styleUrls: ['./search-department.component.scss'],
})
export class SearchDepartmentComponent implements OnInit {
  private departmentFacade = inject(DepartmentFacade);
  private departmentService = inject(DepartmentService);
  private notificationService = inject(NotificationService);
  private dialogService = inject(DialogService);

  // State
  allDepartments = signal<Department[]>([]); // All departments from API (already filtered by backend)
  loading = signal(false);

  // Loading states for individual fields (for dropdown options loading)
  fieldLoading = signal<Record<string, boolean>>({
    parentDepartmentId: false,
  });

  // Search filters
  searchFilters = signal<Record<string, unknown>>({
    name: '',
    code: '',
    description: '',
    parentDepartmentId: null,
    level: null,
  });

  // Observables from NgRx Store (for async pipe - automatically managed)
  departments$ = this.departmentFacade.departments$;

  // Observables for BaseAsyncStateComponent
  loading$ = new BehaviorSubject<boolean>(false);
  departmentsData$ = new BehaviorSubject<Department[] | null>(null);

  selectedDepartmentForDetail: Department | null = null;
  isDetailModalOpen = false;
  detailMode: 'edit' | 'view' = 'view';

  // Table configuration
  tableColumns: TableColumn[] = [
    { key: 'code', label: 'Code', sortable: true, width: '100px' },
    { key: 'name', label: 'Name', sortable: true, width: '200px' },
    { key: 'description', label: 'Description', sortable: false, width: '300px' },
    { key: 'parentDepartmentName', label: 'Parent Department', sortable: true, width: '180px' },
    { key: 'level', label: 'Level', sortable: true, width: '80px' },
    { key: 'path', label: 'Path', sortable: false, width: '200px' },
    { key: 'createdAt', label: 'Created At', sortable: true, type: 'date', width: '150px' },
  ];

  tableActions: TableAction[] = [
    {
      label: 'View',
      icon: 'visibility',
      variant: 'ghost',
      showLabel: false,
      onClick: (item: unknown) => this.onViewDepartment(item as Department),
    },
    {
      label: 'Edit',
      icon: 'edit',
      variant: 'primary',
      showLabel: false,
      onClick: (item: unknown) => this.onEditDepartment(item as Department),
    },
    {
      label: 'Delete',
      icon: 'delete',
      variant: 'danger',
      showLabel: false,
      onClick: (item: unknown) => this.onDeleteDepartment(item as Department),
    },
  ];

  // Search form configuration
  searchFormConfig: FormConfig = {
    sections: [
      {
        title: 'Search & Filter Departments',
        description: 'Filter departments by various criteria',
        order: 0,
        collapsible: false,
        collapsed: false,
      },
    ],
    layout: {
      columns: 3,
      gap: '1rem',
      sectionGap: '1.5rem',
      labelPosition: 'top',
      showSectionDividers: false,
    },
    fields: [
      {
        key: 'name',
        type: 'input',
        label: 'Department Name',
        placeholder: 'Search by name',
        section: 'Search & Filter Departments',
        order: 0,
        colSpan: 1,
      },
      {
        key: 'code',
        type: 'input',
        label: 'Department Code',
        placeholder: 'Search by code',
        section: 'Search & Filter Departments',
        order: 1,
        colSpan: 1,
      },
      {
        key: 'description',
        type: 'input',
        label: 'Description',
        placeholder: 'Search by description',
        section: 'Search & Filter Departments',
        order: 2,
        colSpan: 1,
      },
      {
        key: 'parentDepartmentId',
        type: 'select',
        label: 'Parent Department',
        placeholder: 'Filter by parent department',
        section: 'Search & Filter Departments',
        order: 3,
        colSpan: 1,
        searchable: true,
        options: [] as SelectOption[],
      },
      {
        key: 'level',
        type: 'select',
        label: 'Level',
        placeholder: 'Filter by level',
        section: 'Search & Filter Departments',
        order: 4,
        colSpan: 1,
        options: [
          { value: null, label: 'All Levels' },
          { value: 1, label: 'Level 1' },
          { value: 2, label: 'Level 2' },
          { value: 3, label: 'Level 3' },
          { value: 4, label: 'Level 4' },
        ] as SelectOption[],
      },
    ],
    submitButtonText: 'Search Departments',
    cancelButtonText: 'Clear',
    submitButtonVariant: 'primary',
    cancelButtonVariant: 'secondary',
  };

  ngOnInit(): void {
    // Load departments from store for parent department dropdown
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

  /**
   * Handle field dropdown open event
   * Load data when user clicks on parent department dropdown
   */
  onFieldDropdownOpen(key: string): void {
    if (key === 'parentDepartmentId') {
      this.loadParentDepartmentOptionsIfNeeded();
    }
  }

  /**
   * Load parent department options from store when user clicks dropdown
   */
  private loadParentDepartmentOptionsIfNeeded(): void {
    // Set loading state
    this.fieldLoading.update(loading => ({ ...loading, parentDepartmentId: true }));

    // Load from store
    this.departmentFacade.loadDepartments();

    // Wait for departments to load, then update options
    this.departmentFacade.departments$.pipe(
      filter(loadedDepts => loadedDepts.length > 0),
      first(),
      catchError(error => {
        console.error('❌ Error loading departments:', error);
        this.fieldLoading.update(loading => ({ ...loading, parentDepartmentId: false }));
        return of([]);
      })
    ).subscribe(loadedDepartments => {
      if (loadedDepartments.length > 0) {
        this.updateParentDepartmentOptions(loadedDepartments);
      }
      this.fieldLoading.update(loading => ({ ...loading, parentDepartmentId: false }));
    });
  }

  /**
   * Update form options when departments change
   */
  private updateFormOptions(): void {
    // Update parent department options when departments$ changes
    this.departments$.pipe(
      filter(depts => depts.length > 0)
    ).subscribe((depts: Department[]) => {
      this.updateParentDepartmentOptions(depts);
    });
  }

  /**
   * Update parent department field options
   */
  private updateParentDepartmentOptions(departments: Department[]): void {
    const parentOptions: SelectOption[] = [
      { value: null, label: 'All Departments' },
      ...departments.map(dept => ({
        value: parseInt(dept.id),
        label: `${dept.name} (${dept.code})`
      }))
    ];

    const parentField = this.searchFormConfig.fields.find(f => f.key === 'parentDepartmentId');
    if (parentField) {
      parentField.options = [...parentOptions];
    }
  }

  /**
   * Search departments with backend API
   */
  private searchDepartmentsWithBackend(filters: Record<string, unknown>): void {
    this.loading.set(true);
    this.loading$.next(true);

    // Convert filters to search parameters
    const searchParams = {
      name: filters['name'] as string || '',
      code: filters['code'] as string || '',
      description: filters['description'] as string || '',
      parentDepartmentId: filters['parentDepartmentId'] !== null && filters['parentDepartmentId'] !== undefined
        ? (typeof filters['parentDepartmentId'] === 'number' ? filters['parentDepartmentId'] : parseInt(filters['parentDepartmentId'] as string))
        : null,
      level: filters['level'] !== null && filters['level'] !== undefined
        ? (typeof filters['level'] === 'number' ? filters['level'] : parseInt(filters['level'] as string))
        : null,
    };

    // HTTP requests complete automatically, so no need for takeUntil
    // Using first() to ensure we only take the first value (HTTP emits once and completes)
    this.departmentService.searchDepartmentsWithFilters(searchParams).pipe(
      first(),
      catchError(err => {
        const errorMessage = err.message || 'Failed to search departments';
        this.loading.set(false);
        this.loading$.next(false);
        this.allDepartments.set([]);
        this.departmentsData$.next([]);

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
      next: (departments: Department[]) => {
        this.allDepartments.set(departments);
        // Update departmentsData$ Observable for BaseAsyncStateComponent
        this.departmentsData$.next(departments);
        // Departments are already filtered by backend
        this.loading.set(false);
        this.loading$.next(false);

        // Show success notification if departments found
        if (departments.length > 0) {
          this.notificationService.info(
            'Search Completed',
            `Found ${departments.length} department(s) matching your criteria`,
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
      name: data['name'] || '',
      code: data['code'] || '',
      description: data['description'] || '',
      parentDepartmentId: data['parentDepartmentId'] ?? null,
      level: data['level'] ?? null,
    });

    // Search departments using backend with all filters
    this.searchDepartmentsWithBackend(this.searchFilters());
  }

  /**
   * Handle search form cancel (clear filters)
   */
  onSearchFormCancel(): void {
    this.searchFilters.set({
      name: '',
      code: '',
      description: '',
      parentDepartmentId: null,
      level: null,
    });

    // Clear departments
    this.allDepartments.set([]);
    this.departmentsData$.next([]);
  }

  onEditDepartment(department: Department): void {
    this.selectedDepartmentForDetail = department;
    this.detailMode = 'edit';
    this.isDetailModalOpen = true;
  }

  /**
   * Handle delete department action with confirmation
   * Uses NgRx architecture: Dialog → Facade → Effect → Store → Notification
   */
  onDeleteDepartment(department: Department): void {
    const departmentName = department.name;

    // Show confirmation dialog first
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
      filter((confirmed: boolean) => confirmed)
    ).subscribe(() => {
      // Delete department through Facade (NgRx architecture)
      this.departmentFacade.deleteDepartment(department.id);

      // Reload search results after delete operation completes
      this.reloadSearchAfterOperation();
    });
  }

  onViewDepartment(department: Department): void {
    this.selectedDepartmentForDetail = department;
    this.detailMode = 'view';
    this.isDetailModalOpen = true;
  }

  /**
   * Handle table row click event
   */
  onRowClick(item: unknown): void {
    this.onViewDepartment(item as Department);
  }

  onCloseDetailModal(): void {
    this.isDetailModalOpen = false;
    this.selectedDepartmentForDetail = null;
    this.detailMode = 'view';
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onDepartmentUpdated(department: Department): void {
    // Reload search results after update operation completes
    this.reloadSearchAfterOperation();
  }

  /**
   * Wait for operation to complete and reload search results
   * Prevents showing both global loading (from operation) and component loading (from search)
   */
  private reloadSearchAfterOperation(): void {
    this.departmentFacade.operationInProgress$.pipe(
      filter(op => !op.loading && op.operation === null), // Wait for operation to complete
      take(1),
      delay(100) // Small delay to ensure state is fully updated
    ).subscribe(() => {
      this.searchDepartmentsWithBackend(this.searchFilters());
    });
  }

  onRetryLoad = (): void => {
    // Retry search with current filters
    this.searchDepartmentsWithBackend(this.searchFilters());
  };
}

