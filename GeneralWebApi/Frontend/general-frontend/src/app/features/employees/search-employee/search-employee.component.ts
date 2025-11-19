// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/employees/search-employee/search-employee.component.ts
import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, of } from 'rxjs';
import { filter, startWith, first, catchError } from 'rxjs/operators';
import { EmployeeCardComponent } from '../employee-card/employee-card.component';
import { EmployeeDetailComponent } from '../employee-detail/employee-detail.component';
import {
  BaseCardComponent,
  BaseAsyncStateComponent,
  BaseFormComponent,
  SelectOption,
  FormConfig,
} from '../../../Shared/components/base';
import { EmployeeService } from '@core/services/employee.service';
import { DepartmentFacade } from '@store/department/department.facade';
import { PositionFacade } from '@store/position/position.facade';
import { Employee } from 'app/contracts/employees/employee.model';
import { Department } from 'app/contracts/departments/department.model';
import { Position } from 'app/contracts/positions/position.model';

@Component({
  selector: 'app-search-employee',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EmployeeCardComponent,
    EmployeeDetailComponent,
    BaseCardComponent,
    BaseAsyncStateComponent,
    BaseFormComponent,
  ],
  templateUrl: './search-employee.component.html',
  styleUrls: ['./search-employee.component.scss'],
})
export class SearchEmployeeComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  private departmentFacade = inject(DepartmentFacade);
  private positionFacade = inject(PositionFacade);

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

  // Filtered employees based on search criteria
  filteredEmployees = computed(() => {
    const employees = this.allEmployees();
    const filters = this.searchFilters();
    
    return this.applyFilters(employees, filters);
  });

  // Observables from NgRx Store (for async pipe - automatically managed)
  departments$ = this.departmentFacade.departments$;
  positions$ = this.positionFacade.positions$;

  // Observables for BaseAsyncStateComponent
  loading$ = new BehaviorSubject<boolean>(false);
  error$ = new BehaviorSubject<string | null>(null);
  employees$ = new BehaviorSubject<Employee[] | null>(null);

  selectedEmployeeForDetail: Employee | null = null;
  isDetailModalOpen = false;
  detailMode: 'edit' | 'view' = 'view';

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
      this.error$.next(null);
      return;
    }

    this.selectedDepartmentId.set(departmentId);
    // Don't auto-load here - wait for form submit
  }

  private loadEmployeesByDepartment(departmentId: number): void {
    this.loading.set(true);
    this.loading$.next(true);
    this.error.set(null);
    this.error$.next(null);

    // HTTP requests complete automatically, so no need for takeUntil
    // Using first() to ensure we only take the first value (HTTP emits once and completes)
    this.employeeService.getEmployeesByDepartment(departmentId).pipe(
      first()
    ).subscribe({
      next: (employees: Employee[]) => {
        this.allEmployees.set(employees);
        // Filtered employees will be updated automatically via computed signal and effect
        this.loading.set(false);
        this.loading$.next(false);
      },
      error: (err) => {
        const errorMessage = err.message || 'Failed to load employees';
        this.error.set(errorMessage);
        this.error$.next(errorMessage);
        this.loading.set(false);
        this.loading$.next(false);
        this.allEmployees.set([]);
        this.employees$.next([]);
      }
    });
  }

  /**
   * Apply search filters to employees (frontend virtual filtering)
   */
  private applyFilters(employees: Employee[], filters: Record<string, unknown>): Employee[] {
    if (!employees || employees.length === 0) {
      return [];
    }

    let filtered = [...employees];

    // Filter by firstName
    if (filters['firstName'] && typeof filters['firstName'] === 'string' && filters['firstName'].trim()) {
      const searchTerm = filters['firstName'].toLowerCase().trim();
      filtered = filtered.filter(emp => 
        emp.firstName?.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by lastName
    if (filters['lastName'] && typeof filters['lastName'] === 'string' && filters['lastName'].trim()) {
      const searchTerm = filters['lastName'].toLowerCase().trim();
      filtered = filtered.filter(emp => 
        emp.lastName?.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by email
    if (filters['email'] && typeof filters['email'] === 'string' && filters['email'].trim()) {
      const searchTerm = filters['email'].toLowerCase().trim();
      filtered = filtered.filter(emp => 
        emp.email?.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by employeeNumber
    if (filters['employeeNumber'] && typeof filters['employeeNumber'] === 'string' && filters['employeeNumber'].trim()) {
      const searchTerm = filters['employeeNumber'].toLowerCase().trim();
      filtered = filtered.filter(emp => 
        emp.employeeNumber?.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by phone
    if (filters['phone'] && typeof filters['phone'] === 'string' && filters['phone'].trim()) {
      const searchTerm = filters['phone'].toLowerCase().trim();
      filtered = filtered.filter(emp => 
        emp.phone?.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by positionId
    if (filters['positionId'] !== null && filters['positionId'] !== undefined && filters['positionId'] !== '') {
      const positionId = typeof filters['positionId'] === 'number' 
        ? filters['positionId'] 
        : parseInt(filters['positionId'] as string);
      filtered = filtered.filter(emp => emp.positionId === positionId);
    }

    // Filter by employmentStatus
    if (filters['employmentStatus'] && typeof filters['employmentStatus'] === 'string' && filters['employmentStatus'].trim()) {
      filtered = filtered.filter(emp => emp.status === filters['employmentStatus']);
    }

    // Filter by hireDateFrom
    if (filters['hireDateFrom'] && typeof filters['hireDateFrom'] === 'string' && filters['hireDateFrom'].trim()) {
      const fromDate = new Date(filters['hireDateFrom']);
      filtered = filtered.filter(emp => {
        if (!emp.hireDate) return false;
        const hireDate = new Date(emp.hireDate);
        return hireDate >= fromDate;
      });
    }

    // Filter by hireDateTo
    if (filters['hireDateTo'] && typeof filters['hireDateTo'] === 'string' && filters['hireDateTo'].trim()) {
      const toDate = new Date(filters['hireDateTo']);
      toDate.setHours(23, 59, 59, 999); // Include entire day
      filtered = filtered.filter(emp => {
        if (!emp.hireDate) return false;
        const hireDate = new Date(emp.hireDate);
        return hireDate <= toDate;
      });
    }

    return filtered;
  }

  /**
   * Handle search form submit
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
    
    // Load employees if department is selected
    if (departmentId) {
      this.selectedDepartmentId.set(departmentId);
      this.loadEmployeesByDepartment(departmentId);
    } else {
      // Clear employees if no department selected
      this.selectedDepartmentId.set(null);
      this.allEmployees.set([]);
      this.employees$.next([]);
    }
    // Filtered employees will be updated automatically via computed signal and effect
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

  onDeleteEmployee(employee: Employee): void {
    // This will be handled by parent component if needed
    console.log('Delete employee:', employee);
  }

  onViewEmployee(employee: Employee): void {
    this.selectedEmployeeForDetail = employee;
    this.detailMode = 'view';
    this.isDetailModalOpen = true;
  }

  onCloseDetailModal(): void {
    this.isDetailModalOpen = false;
    this.selectedEmployeeForDetail = null;
    this.detailMode = 'view';
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onEmployeeUpdated(employee: Employee): void {
    // Reload employees for the selected department
    // employee parameter kept for interface compatibility
    const departmentId = this.selectedDepartmentId();
    if (departmentId) {
      this.loadEmployeesByDepartment(departmentId);
    }
  }

  onRetryLoad = (): void => {
    const departmentId = this.selectedDepartmentId();
    if (departmentId) {
      this.loadEmployeesByDepartment(departmentId);
    }
  };
}

