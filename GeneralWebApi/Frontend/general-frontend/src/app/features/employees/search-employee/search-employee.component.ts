// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/employees/search-employee/search-employee.component.ts
import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, of, Observable } from 'rxjs';
import { filter, startWith, first, catchError, take } from 'rxjs/operators';
import { EmployeeDetailComponent } from '../employee-detail/employee-detail.component';
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
import { EmployeeService } from '@core/services/employee.service';
import { EmployeeFacade } from '@store/employee/employee.facade';
import { DepartmentFacade } from '@store/department/department.facade';
import { PositionFacade } from '@store/position/position.facade';
import { NotificationService } from '../../../Shared/services/notification.service';
import { DialogService } from '../../../Shared/services/dialog.service';
import { Employee } from 'app/contracts/employees/employee.model';
import { Department } from 'app/contracts/departments/department.model';
import { Position } from 'app/contracts/positions/position.model';

@Component({
  selector: 'app-search-employee',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EmployeeDetailComponent,
    BaseCardComponent,
    BaseAsyncStateComponent,
    BaseFormComponent,
    BaseTableComponent,
  ],
  templateUrl: './search-employee.component.html',
  styleUrls: ['./search-employee.component.scss'],
})
export class SearchEmployeeComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  private employeeFacade = inject(EmployeeFacade);
  private departmentFacade = inject(DepartmentFacade);
  private positionFacade = inject(PositionFacade);
  private notificationService = inject(NotificationService);
  private dialogService = inject(DialogService);

  // State
  selectedDepartmentId = signal<number | null>(null);
  allEmployees = signal<Employee[]>([]); // All employees from API (before filtering)
  loading = signal(false);
  error = signal<string | null>(null);

  // Loading states for individual fields (for dropdown options loading)
  fieldLoading = signal<Record<string, boolean>>({
    departmentId: false,
    positionId: false,
  });

  // Search filters
  searchFilters = signal<Record<string, unknown>>({
    departmentId: null,
    firstName: '',
    lastName: '',
    email: '',
    employeeNumber: '',
    phone: '',
    positionId: null,
    employmentStatus: '',
    hireDateFrom: '',
    hireDateTo: '',
  });

  // Employees from backend (already filtered by backend)
  // No need for frontend filtering anymore - backend handles all filtering
  filteredEmployees = computed(() => {
    return this.allEmployees();
  });

  // Observables from NgRx Store (for async pipe - automatically managed)
  departments$ = this.departmentFacade.departments$;
  positions$ = this.positionFacade.positions$;

  // Observables for BaseAsyncStateComponent
  // Note: error$ removed - errors will be shown via NotificationService instead
  loading$ = new BehaviorSubject<boolean>(false);
  employees$ = new BehaviorSubject<Employee[] | null>(null);

  selectedEmployeeForDetail: Employee | null = null;
  isDetailModalOpen = false;
  detailMode: 'edit' | 'view' = 'view';

  // Table configuration
  tableColumns: TableColumn[] = [
    { key: 'employeeNumber', label: 'Employee Number', sortable: true, width: '120px' },
    { key: 'firstName', label: 'First Name', sortable: true, width: '120px' },
    { key: 'lastName', label: 'Last Name', sortable: true, width: '120px' },
    { key: 'email', label: 'Email', sortable: true, width: '200px' },
    { key: 'phone', label: 'Phone', sortable: false, width: '120px' },
    { key: 'department', label: 'Department', sortable: true, width: '150px' },
    { key: 'position', label: 'Position', sortable: true, width: '150px' },
    { key: 'status', label: 'Status', sortable: true, width: '100px' },
    { key: 'hireDate', label: 'Hire Date', sortable: true, type: 'date', width: '120px' },
  ];

  tableActions: TableAction[] = [
    {
      label: 'View',
      icon: 'visibility',
      variant: 'ghost',
      showLabel: false, // Icon-only button
      onClick: (item: unknown) => this.onViewEmployee(item as Employee),
    },
    {
      label: 'Edit',
      icon: 'edit',
      variant: 'primary',
      showLabel: false, // Icon-only button
      onClick: (item: unknown) => this.onEditEmployee(item as Employee),
    },
    {
      label: 'Delete',
      icon: 'delete',
      variant: 'danger',
      showLabel: false, // Icon-only button
      onClick: (item: unknown) => this.onDeleteEmployee(item as Employee),
    },
  ];

  // Search form configuration
  searchFormConfig: FormConfig = {
    sections: [
      {
        title: 'Search & Filter Employees',
        description: 'Select department and filter employees by various criteria',
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
        key: 'departmentId',
        type: 'select',
        label: 'Department',
        placeholder: 'Select a department (required)',
        required: true,
        section: 'Search & Filter Employees',
        order: 0,
        colSpan: 1,
        searchable: true,
        options: [] as SelectOption[],
      },
      {
        key: 'firstName',
        type: 'input',
        label: 'First Name',
        placeholder: 'Search by first name',
        section: 'Search & Filter Employees',
        order: 1,
        colSpan: 1,
      },
      {
        key: 'lastName',
        type: 'input',
        label: 'Last Name',
        placeholder: 'Search by last name',
        section: 'Search & Filter Employees',
        order: 2,
        colSpan: 1,
      },
      {
        key: 'email',
        type: 'input',
        label: 'Email',
        placeholder: 'Search by email',
        inputType: 'email',
        section: 'Search & Filter Employees',
        order: 3,
        colSpan: 1,
      },
      {
        key: 'employeeNumber',
        type: 'input',
        label: 'Employee Number',
        placeholder: 'Search by employee number',
        section: 'Search & Filter Employees',
        order: 4,
        colSpan: 1,
      },
      {
        key: 'phone',
        type: 'input',
        label: 'Phone',
        placeholder: 'Search by phone',
        inputType: 'tel',
        section: 'Search & Filter Employees',
        order: 5,
        colSpan: 1,
      },
      {
        key: 'positionId',
        type: 'select',
        label: 'Position',
        placeholder: 'Filter by position',
        section: 'Search & Filter Employees',
        order: 6,
        colSpan: 1,
        searchable: true,
        options: [] as SelectOption[],
      },
      {
        key: 'employmentStatus',
        type: 'select',
        label: 'Employment Status',
        placeholder: 'Filter by status',
        section: 'Search & Filter Employees',
        order: 7,
        colSpan: 1,
        options: [
          { value: '', label: 'All Statuses' },
          { value: 'Active', label: 'Active' },
          { value: 'Inactive', label: 'Inactive' },
          { value: 'Terminated', label: 'Terminated' },
        ] as SelectOption[],
      },
      {
        key: 'hireDateFrom',
        type: 'datepicker',
        label: 'Hire Date From',
        placeholder: 'Select start date',
        section: 'Search & Filter Employees',
        order: 8,
        colSpan: 1,
      },
      {
        key: 'hireDateTo',
        type: 'datepicker',
        label: 'Hire Date To',
        placeholder: 'Select end date',
        section: 'Search & Filter Employees',
        order: 9,
        colSpan: 1,
      },
    ],
    submitButtonText: 'Load Employees',
    cancelButtonText: 'Clear',
    submitButtonVariant: 'primary',
    cancelButtonVariant: 'secondary',
  };

  ngOnInit(): void {
    // Trigger initial load if needed (simplified - using first() to only check once)
    this.departments$.pipe(
      startWith([]),
      filter(depts => depts.length === 0),
      first()
    ).subscribe(() => {
      this.departmentFacade.loadDepartments();
    });

    this.positions$.pipe(
      startWith([]),
      filter(pos => pos.length === 0),
      first()
    ).subscribe(() => {
      this.positionFacade.loadPositions();
    });

    // Update form options when data changes (using effect)
    this.updateFormOptions();

    // Effect to update employees$ when filteredEmployees changes
    effect(() => {
      const filtered = this.filteredEmployees();
      this.employees$.next(filtered);
    });
  }


  /**
   * Handle field dropdown open event
   * Load data when user clicks on department or position dropdown
   */
  onFieldDropdownOpen(key: string): void {
    if (key === 'departmentId') {
      this.loadDepartmentOptionsIfNeeded();
    } else if (key === 'positionId') {
      this.loadPositionOptionsIfNeeded();
    }
  }

  /**
   * Load department options from backend when user clicks dropdown
   */
  private loadDepartmentOptionsIfNeeded(): void {
    // Set loading state
    this.fieldLoading.update(loading => ({ ...loading, departmentId: true }));
    
    // Always load from API to ensure latest data
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
   * Load position options from backend when user clicks dropdown
   */
  private loadPositionOptionsIfNeeded(): void {
    // Set loading state
    this.fieldLoading.update(loading => ({ ...loading, positionId: true }));
    
    // Always load from API to ensure latest data
    this.positionFacade.loadPositions();
    
    // Wait for positions to load, then update options
    this.positionFacade.positions$.pipe(
      filter(loadedPos => loadedPos.length > 0),
      first(),
      catchError(error => {
        console.error('❌ Error loading positions:', error);
        this.fieldLoading.update(loading => ({ ...loading, positionId: false }));
        return of([]);
      })
    ).subscribe(loadedPositions => {
      if (loadedPositions.length > 0) {
        this.updatePositionOptions(loadedPositions);
      }
      this.fieldLoading.update(loading => ({ ...loading, positionId: false }));
    });
  }

  /**
   * Update form options when departments or positions change
   * Simplified subscription - no need for takeUntil as these are long-lived Observables
   */
  private updateFormOptions(): void {
    // Update department options when departments$ changes
    this.departments$.pipe(
      filter(depts => depts.length > 0)
    ).subscribe((depts: Department[]) => {
      this.updateDepartmentOptions(depts);
    });

    // Update position options when positions$ changes
    this.positions$.pipe(
      filter(pos => pos.length > 0)
    ).subscribe((pos: Position[]) => {
      this.updatePositionOptions(pos);
    });
  }

  /**
   * Update department field options
   */
  private updateDepartmentOptions(departments: Department[]): void {
    const departmentOptions: SelectOption[] = departments.map(dept => ({
      value: parseInt(dept.id),
      label: `${dept.name} (${dept.code})`
    }));
    
    const departmentField = this.searchFormConfig.fields.find(f => f.key === 'departmentId');
    if (departmentField) {
      // Update options directly - Angular will detect the change
      departmentField.options = [...departmentOptions];
    }
  }

  /**
   * Update position field options
   */
  private updatePositionOptions(positions: Position[]): void {
    const positionOptions: SelectOption[] = [
      { value: null, label: 'All Positions' },
      ...positions.map(p => ({
        value: parseInt(p.id),
        label: `${p.title} (${p.code})`
      }))
    ];
    
    const positionField = this.searchFormConfig.fields.find(f => f.key === 'positionId');
    if (positionField) {
      // Update options directly - Angular will detect the change
      positionField.options = [...positionOptions];
    }
  }

  /**
   * Handle department change from form
   * This will be called when user selects a department in the form
   */
  onDepartmentChange(departmentId: number | null): void {
    if (!departmentId) {
      this.selectedDepartmentId.set(null);
      this.allEmployees.set([]);
      this.employees$.next([]);
      this.loading$.next(false);
      this.error.set(null);
      return;
    }

    this.selectedDepartmentId.set(departmentId);
    // Don't auto-load here - wait for form submit
  }

  private searchEmployeesWithBackend(filters: Record<string, unknown>): void {
    this.loading.set(true);
    this.loading$.next(true);
    this.error.set(null);

    // Convert filters to search parameters
    const searchParams = {
      departmentId: filters['departmentId'] ? (typeof filters['departmentId'] === 'number' ? filters['departmentId'] : parseInt(filters['departmentId'] as string)) : null,
      firstName: filters['firstName'] as string || '',
      lastName: filters['lastName'] as string || '',
      email: filters['email'] as string || '',
      employeeNumber: filters['employeeNumber'] as string || '',
      phone: filters['phone'] as string || '',
      positionId: filters['positionId'] !== null && filters['positionId'] !== undefined ? (typeof filters['positionId'] === 'number' ? filters['positionId'] : parseInt(filters['positionId'] as string)) : null,
      employmentStatus: filters['employmentStatus'] as string || '',
      hireDateFrom: filters['hireDateFrom'] as string || '',
      hireDateTo: filters['hireDateTo'] as string || '',
    };

    // HTTP requests complete automatically, so no need for takeUntil
    // Using first() to ensure we only take the first value (HTTP emits once and completes)
    this.employeeService.searchEmployeesWithFilters(searchParams).pipe(
      first(),
      catchError(err => {
        const errorMessage = err.message || 'Failed to search employees';
        this.error.set(errorMessage);
        this.loading.set(false);
        this.loading$.next(false);
        this.allEmployees.set([]);
        this.employees$.next([]);
        
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
      next: (employees: Employee[]) => {
        this.allEmployees.set(employees);
        // Update employees$ Observable for BaseAsyncStateComponent
        this.employees$.next(employees);
        // Employees are already filtered by backend
        this.loading.set(false);
        this.loading$.next(false);
        
        // Show success notification if employees found
        if (employees.length > 0) {
          this.notificationService.info(
            'Search Completed',
            `Found ${employees.length} employee(s) matching your criteria`,
            {
              duration: 3000,
              autoClose: true,
            }
          );
        }
      }
    });
  }

  // Frontend filtering removed - backend handles all filtering now

  /**
   * Handle search form submit
   * Now uses backend search instead of frontend filtering
   */
  onSearchFormSubmit(data: Record<string, unknown>): void {
    const departmentId = data['departmentId'] ? (typeof data['departmentId'] === 'number' ? data['departmentId'] : parseInt(data['departmentId'] as string)) : null;
    
    // Update search filters
    this.searchFilters.set({
      departmentId: departmentId,
      firstName: data['firstName'] || '',
      lastName: data['lastName'] || '',
      email: data['email'] || '',
      employeeNumber: data['employeeNumber'] || '',
      phone: data['phone'] || '',
      positionId: data['positionId'] ?? null,
      employmentStatus: data['employmentStatus'] || '',
      hireDateFrom: data['hireDateFrom'] || '',
      hireDateTo: data['hireDateTo'] || '',
    });
    
    // Search employees using backend with all filters
    if (departmentId) {
      this.selectedDepartmentId.set(departmentId);
      this.searchEmployeesWithBackend(this.searchFilters());
    } else {
      // Clear employees if no department selected
      this.selectedDepartmentId.set(null);
      this.allEmployees.set([]);
      this.employees$.next([]);
      this.loading.set(false);
      this.loading$.next(false);
    }
  }

  /**
   * Handle search form cancel (clear filters)
   */
  onSearchFormCancel(): void {
    this.searchFilters.set({
      departmentId: null,
      firstName: '',
      lastName: '',
      email: '',
      employeeNumber: '',
      phone: '',
      positionId: null,
      employmentStatus: '',
      hireDateFrom: '',
      hireDateTo: '',
    });
    
    // Clear employees
    this.selectedDepartmentId.set(null);
    this.allEmployees.set([]);
    this.employees$.next([]);
    // Filtered employees will be updated automatically via computed signal and effect
  }


  onEditEmployee(employee: Employee): void {
    this.selectedEmployeeForDetail = employee;
    this.detailMode = 'edit';
    this.isDetailModalOpen = true;
  }

  /**
   * Handle delete employee action with confirmation
   * Uses NgRx architecture: Dialog → Facade → Effect → Store → Notification
   */
  onDeleteEmployee(employee: Employee): void {
    const employeeName = `${employee.firstName} ${employee.lastName}`;
    
    // Show confirmation dialog first
    const confirm$: Observable<boolean> = this.dialogService.confirm({
      title: 'Confirm Delete',
      message: `Are you sure you want to delete ${employeeName}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmVariant: 'danger',
      icon: 'warning',
    });
    
    confirm$.pipe(
      take(1),
      filter((confirmed: boolean) => confirmed)
    ).subscribe(() => {
      // Delete employee through Facade (NgRx architecture)
      this.employeeFacade.deleteEmployee(employee.id);
      
      // Show success notification
      this.notificationService.success(
        'Employee Deleted',
        `${employeeName} has been deleted successfully.`,
        {
          duration: 3000,
          autoClose: true,
        }
      );
      
      // Reload employees with current search filters after a short delay
      // to allow the backend to process the deletion
      setTimeout(() => {
        this.searchEmployeesWithBackend(this.searchFilters());
      }, 500);
    });
  }

  onViewEmployee(employee: Employee): void {
    this.selectedEmployeeForDetail = employee;
    this.detailMode = 'view';
    this.isDetailModalOpen = true;
  }

  /**
   * Handle table row click event
   * Converts unknown to Employee type
   */
  onRowClick(item: unknown): void {
    this.onViewEmployee(item as Employee);
  }

  onCloseDetailModal(): void {
    this.isDetailModalOpen = false;
    this.selectedEmployeeForDetail = null;
    this.detailMode = 'view';
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onEmployeeUpdated(employee: Employee): void {
    // Reload employees with current search filters
    // employee parameter kept for interface compatibility
    this.searchEmployeesWithBackend(this.searchFilters());
  }

  onRetryLoad = (): void => {
    // Retry search with current filters
    this.searchEmployeesWithBackend(this.searchFilters());
  };
}

