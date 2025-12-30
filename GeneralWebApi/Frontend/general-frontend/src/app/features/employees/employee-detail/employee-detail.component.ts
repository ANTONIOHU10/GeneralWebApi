// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/employees/employee-detail/employee-detail.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, OnDestroy, SimpleChanges, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Employee } from 'app/contracts/employees/employee.model';
import { User } from 'app/users/user.model';
import {
  BaseModalComponent,
  BaseAvatarComponent,
  BaseBadgeComponent,
  BaseButtonComponent,
  BadgeVariant,
  BaseFormComponent,
  FormConfig,
  SelectOption,
} from '../../../Shared/components/base';
import { EmployeeHierarchyComponent } from '../employee-hierarchy/employee-hierarchy.component';
import { TranslatePipe } from '@core/pipes/translate.pipe';
import { TranslationService } from '@core/services/translation.service';
import { EmployeeFacade } from '@store/employee/employee.facade';
import { DepartmentFacade } from '@store/department/department.facade';
import { PositionFacade } from '@store/position/position.facade';
import { DialogService, OperationNotificationService, NotificationService } from '../../../Shared/services';
import { DocumentService } from '@core/services/document.service';
import { EmployeeService } from '@core/services/employee.service';
import { Observable, combineLatest, of, Subject } from 'rxjs';
import { filter, first, pairwise, debounceTime, startWith, catchError, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Department } from 'app/contracts/departments/department.model';
import { Position } from 'app/contracts/positions/position.model';

/**
 * EmployeeDetailComponent - Modal component for displaying detailed employee information
 * 
 * Features:
 * - Modal overlay with backdrop
 * - Detailed employee information display using base-card
 * - Close functionality via backdrop click, ESC key, or close button
 * - Responsive design
 */
@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [
    CommonModule,
    BaseModalComponent,
    BaseAvatarComponent,
    BaseBadgeComponent,
    BaseButtonComponent,
    BaseFormComponent,
    EmployeeHierarchyComponent,
    TranslatePipe,
  ],
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.scss'],
})
export class EmployeeDetailComponent implements OnInit, OnChanges, OnDestroy {
  private employeeFacade = inject(EmployeeFacade);
  private departmentFacade = inject(DepartmentFacade);
  private positionFacade = inject(PositionFacade);
  private dialogService = inject(DialogService);
  private operationNotification = inject(OperationNotificationService);
  private notificationService = inject(NotificationService);
  private translationService = inject(TranslationService);
  private documentService = inject(DocumentService);
  private employeeService = inject(EmployeeService);
  private cdr = inject(ChangeDetectorRef);

  @Input() employee: Employee | null = null;
  @Input() user: User | null = null; // Optional user information
  @Input() isOpen = false;
  @Input() mode: 'edit' | 'view' = 'edit'; // Mode: 'edit' for editing, 'view' for read-only

  @Output() closeEvent = new EventEmitter<void>();
  // send here the employee data to the parent component (list employee) to update the employee
  @Output() employeeUpdated = new EventEmitter<Employee>();

  // Loading state for form - tracks update operation progress (using signal for reactive updates)
  loading = signal(false);

  // Loading states for individual fields (for dropdown options loading)
  fieldLoading = signal<Record<string, boolean>>({
    departmentId: false,
    positionId: false,
    managerId: false,
  });

  // Form data
  formData: Record<string, unknown> = {};

  // Avatar upload state
  avatarPreview = signal<string>('');
  avatarUploading = signal(false);
  selectedAvatarFile: File | null = null;

  // Hierarchy modal state
  showHierarchyModal = signal(false);

  // Destroy subject for cleanup
  private destroy$ = new Subject<void>();

  // Form configuration - will be initialized with translations
  formConfig: FormConfig = {
    sections: [
      {
        title: 'User Information',
        description: 'User account details',
        order: -1,
        collapsible: true,
        collapsed: false,
      },
      {
        title: 'Personal Information',
        description: 'Employee personal details',
        order: 0,
      },
      {
        title: 'Work Information',
        description: 'Employment and work details',
        order: 1,
      },
      {
        title: 'Address Information',
        description: 'Address details',
        order: 2,
        collapsible: true,
        collapsed: false,
      },
      {
        title: 'Emergency Contact',
        description: 'Emergency contact information',
        order: 3,
        collapsible: true,
        collapsed: false, // Default to expanded
      },
    ],
    layout: {
      columns: 2,
      gap: '1.5rem',
      sectionGap: '2rem',
      labelPosition: 'top',
      showSectionDividers: true,
    },
    fields: [
      // User Information Section
      {
        key: 'username',
        type: 'input',
        label: 'Username',
        placeholder: 'Username',
        section: 'User Information',
        order: 0,
        colSpan: 1,
        readonly: true,
      },
      {
        key: 'userEmail',
        type: 'input',
        label: 'User Email',
        placeholder: 'User email',
        inputType: 'email',
        section: 'User Information',
        order: 1,
        colSpan: 1,
        readonly: true,
      },
      {
        key: 'userRole',
        type: 'select',
        label: 'Role',
        placeholder: 'User role',
        section: 'User Information',
        order: 2,
        colSpan: 1,
        readonly: true,
        options: [
          { value: 'Admin', label: 'Admin' },
          { value: 'Manager', label: 'Manager' },
          { value: 'User', label: 'User' },
        ] as SelectOption[],
      },
      {
        key: 'accountCreated',
        type: 'datepicker',
        label: 'Account Created',
        placeholder: 'Account creation date',
        section: 'User Information',
        order: 3,
        colSpan: 1,
        readonly: true,
      },
      {
        key: 'lastLogin',
        type: 'datepicker',
        label: 'Last Login',
        placeholder: 'Last login date',
        section: 'User Information',
        order: 4,
        colSpan: 1,
        readonly: true,
      },
      {
        key: 'isActive',
        type: 'select',
        label: 'Account Status',
        placeholder: 'Account status',
        section: 'User Information',
        order: 5,
        colSpan: 1,
        readonly: true,
        options: [
          { value: true, label: 'Active' },
          { value: false, label: 'Inactive' },
        ] as SelectOption[],
      },
      // Personal Information Section
      {
        key: 'firstName',
        type: 'input',
        label: 'First Name',
        placeholder: 'Enter first name',
        required: true,
        section: 'Personal Information',
        order: 0,
        colSpan: 1,
      },
      {
        key: 'lastName',
        type: 'input',
        label: 'Last Name',
        placeholder: 'Enter last name',
        required: true,
        section: 'Personal Information',
        order: 1,
        colSpan: 1,
      },
      {
        key: 'email',
        type: 'input',
        label: 'Email',
        placeholder: 'Enter email address',
        required: true,
        inputType: 'email',
        section: 'Personal Information',
        order: 2,
        colSpan: 1,
        validator: (value) => {
          if (!value) return null;
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value as string) ? null : 'Invalid email format';
        },
      },
      {
        key: 'phoneNumber',
        type: 'input',
        label: 'Phone Number',
        placeholder: 'Enter phone number',
        inputType: 'tel',
        section: 'Personal Information',
        order: 3,
        colSpan: 1,
      },
      {
        key: 'employeeNumber',
        type: 'input',
        label: 'Employee Number',
        placeholder: 'Employee number',
        section: 'Personal Information',
        order: 4,
        colSpan: 1,
        readonly: true,
      },
      // Work Information Section
      {
        key: 'employmentStatus',
        type: 'select',
        label: 'Employment Status',
        placeholder: 'Select employment status',
        required: true,
        section: 'Work Information',
        order: 0,
        colSpan: 1,
        options: [
          { value: 'Active', label: 'Active' },
          { value: 'Inactive', label: 'Inactive' },
          { value: 'Terminated', label: 'Terminated' },
          { value: 'OnLeave', label: 'On Leave' },
        ] as SelectOption[],
      },
      {
        key: 'employmentType',
        type: 'select',
        label: 'Employment Type',
        placeholder: 'Select employment type',
        required: true,
        section: 'Work Information',
        order: 1,
        colSpan: 1,
        options: [
          { value: 'FullTime', label: 'Full Time' },
          { value: 'PartTime', label: 'Part Time' },
          { value: 'Contract', label: 'Contract' },
          { value: 'Intern', label: 'Intern' },
        ] as SelectOption[],
      },
      {
        key: 'hireDate',
        type: 'datepicker',
        label: 'Hire Date',
        placeholder: 'Select hire date',
        required: true,
        section: 'Work Information',
        order: 2,
        colSpan: 1,
      },
      {
        key: 'terminationDate',
        type: 'datepicker',
        label: 'Termination Date',
        placeholder: 'Select termination date (optional)',
        section: 'Work Information',
        order: 3,
        colSpan: 1,
      },
      {
        key: 'departmentId',
        type: 'select',
        label: 'Department',
        placeholder: 'Select department',
        section: 'Work Information',
        order: 4,
        colSpan: 1,
        searchable: true,
        options: [] as SelectOption[], // Will be populated dynamically from backend
      },
      {
        key: 'positionId',
        type: 'select',
        label: 'Position',
        placeholder: 'Select position',
        section: 'Work Information',
        order: 5,
        colSpan: 1,
        searchable: true,
        options: [] as SelectOption[], // Will be populated dynamically from backend
      },
      {
        key: 'managerId',
        type: 'select',
        label: 'Manager',
        placeholder: 'Select manager',
        section: 'Work Information',
        order: 6,
        colSpan: 1,
        searchable: true,
        options: [] as SelectOption[], // Will be populated dynamically
      },
      {
        key: 'isManager',
        type: 'select',
        label: 'Is Manager',
        placeholder: 'Is this employee a manager?',
        section: 'Work Information',
        order: 7,
        colSpan: 1,
        options: [
          { value: true, label: 'Yes' },
          { value: false, label: 'No' },
        ] as SelectOption[],
      },
      {
        key: 'currentSalary',
        type: 'number',
        label: 'Current Salary',
        placeholder: 'Enter salary amount',
        section: 'Work Information',
        order: 8,
        colSpan: 1,
        min: 0,
      },
      {
        key: 'salaryCurrency',
        type: 'input',
        label: 'Salary Currency',
        placeholder: 'e.g., USD, EUR',
        section: 'Work Information',
        order: 9,
        colSpan: 1,
      },
      // Address Information Section
      {
        key: 'address',
        type: 'input',
        label: 'Street Address',
        placeholder: 'Enter street address',
        section: 'Address Information',
        order: 0,
        colSpan: 1,
      },
      {
        key: 'city',
        type: 'input',
        label: 'City',
        placeholder: 'Enter city',
        section: 'Address Information',
        order: 1,
        colSpan: 1,
      },
      {
        key: 'postalCode',
        type: 'input',
        label: 'Postal Code',
        placeholder: 'Enter postal code',
        section: 'Address Information',
        order: 2,
        colSpan: 1,
      },
      {
        key: 'country',
        type: 'input',
        label: 'Country',
        placeholder: 'Enter country',
        section: 'Address Information',
        order: 3,
        colSpan: 1,
      },
      // Emergency Contact Section
      {
        key: 'emergencyContactName',
        type: 'input',
        label: 'Contact Name',
        placeholder: 'Enter emergency contact name',
        section: 'Emergency Contact',
        order: 0,
        colSpan: 1,
      },
      {
        key: 'emergencyContactPhone',
        type: 'input',
        label: 'Contact Phone',
        placeholder: 'Enter emergency contact phone',
        inputType: 'tel',
        section: 'Emergency Contact',
        order: 1,
        colSpan: 1,
      },
      {
        key: 'emergencyContactRelation',
        type: 'input',
        label: 'Contact Relation',
        placeholder: 'e.g., Spouse, Parent',
        section: 'Emergency Contact',
        order: 2,
        colSpan: 1,
      },
    ],
    submitButtonText: 'Save Changes',
    cancelButtonText: 'Cancel',
    submitButtonVariant: 'primary',
    cancelButtonVariant: 'secondary',
  };

  ngOnInit(): void {
    // Wait for translations to load before initializing form config
    this.translationService.getTranslationsLoaded$().pipe(
      distinctUntilChanged(),
      filter(loaded => loaded),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.initializeFormConfig();
      // Initialize form config for current mode (edit/view)
      this.updateFormConfigForMode();
    });

    // Subscribe to operation progress to update loading state
    // Simplified: Direct subscription without effect wrapper
    this.employeeFacade.operationInProgress$.subscribe(operationState => {
      this.loading.set(operationState.loading && operationState.operation === 'update');
    });

    // Listen for successful update operation completion
    combineLatest([
      this.employeeFacade.operationInProgress$.pipe(
        startWith({ loading: false, operation: null })
      ),
      this.employeeFacade.error$.pipe(
        startWith(null)
      )
    ]).pipe(
      pairwise(), // Compare current with previous state
      filter(([prev, curr]) => {
        // Previous state: operation was in progress
        const wasUpdating = prev[0].loading === true && prev[0].operation === 'update';
        // Current state: operation completed
        const isCompleted = curr[0].loading === false && curr[0].operation === null;
        // Current state: no error
        const hasNoError = curr[1] === null;
        
        // Only trigger if all conditions are met
        return wasUpdating && isCompleted && hasNoError;
      }),
      debounceTime(150) // Wait 150ms for Store state to stabilize after filter
    ).subscribe(() => {
      // Operation completed successfully without errors - close modal and emit event
      if (this.employee) {
        this.employeeUpdated.emit(this.employee);
        this.onClose();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // When modal opens (isOpen changes from false/undefined to true), load fresh data
    // This ensures we always have the latest data when opening the modal
    if (changes['isOpen'] && this.isOpen && changes['isOpen'].previousValue !== true) {
      // Load departments and positions options - always refresh to get latest data
      // This ensures if user added new department/position in another component,
      // they will see it when opening this modal
      this.loadDepartmentOptions();
      this.loadPositionOptions();

      // Check if employees are already loaded in Store (for manager dropdown)
      this.employeeFacade.employees$.pipe(
        first() // Simplified - only check once
      ).subscribe(employees => {
        // Only load if no employees in Store
        if (employees.length === 0) {
          this.employeeFacade.loadEmployees();
        }
      });
    }

    if ((changes['employee'] && this.employee) || (changes['user'] && this.user)) {
      this.initializeFormData();
      if (this.employee) {
        this.loadManagerOptions();
      }
    }
    if (changes['mode'] || (changes['employee'] && this.employee) || (changes['user'] && this.user)) {
      // Update form config for mode
      this.updateFormConfigForMode();
    }
  }

  /**
   * Handle field dropdown open event
   * Load data when user clicks on department, position, or manager dropdown
   */
  onFieldDropdownOpen(key: string): void {
    if (key === 'departmentId') {
      this.loadDepartmentOptionsIfNeeded();
    } else if (key === 'positionId') {
      this.loadPositionOptionsIfNeeded();
    } else if (key === 'managerId') {
      this.loadManagerOptionsIfNeeded();
    }
  }


  getFullName(): string {
    if (!this.employee) return '';
    return `${this.employee.firstName} ${this.employee.lastName}`;
  }

  getInitials(): string {
    if (!this.employee) return '';
    return `${this.employee.firstName.charAt(0)}${this.employee.lastName.charAt(0)}`.toUpperCase();
  }

  getStatusVariant(): BadgeVariant {
    if (!this.employee) return 'primary';
    switch (this.employee.status?.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'terminated':
        return 'danger';
      default:
        return 'primary';
    }
  }

  /**
   * Initialize form config with translations
   */
  private initializeFormConfig(): void {
    const t = (key: string) => this.translationService.translate(key);
    
    // Get section titles
    const userInfoSection = t('employees.detail.sections.userInformation');
    const personalInfoSection = t('employees.detail.sections.personalInformation');
    const workInfoSection = t('employees.detail.sections.workInformation');
    const addressInfoSection = t('employees.detail.sections.addressInformation');
    const emergencyContactSection = t('employees.detail.sections.emergencyContact');

    // Get role options
    const roleOptions: SelectOption[] = [
      { value: 'Admin', label: t('employees.detail.options.role.admin') },
      { value: 'Manager', label: t('employees.detail.options.role.manager') },
      { value: 'User', label: t('employees.detail.options.role.user') },
    ];

    // Get account status options
    const accountStatusOptions: SelectOption[] = [
      { value: true, label: t('employees.detail.options.accountStatus.active') },
      { value: false, label: t('employees.detail.options.accountStatus.inactive') },
    ];

    // Get employment status options
    const employmentStatusOptions: SelectOption[] = [
      { value: 'Active', label: t('employees.detail.options.employmentStatus.active') },
      { value: 'Inactive', label: t('employees.detail.options.employmentStatus.inactive') },
      { value: 'Terminated', label: t('employees.detail.options.employmentStatus.terminated') },
      { value: 'OnLeave', label: t('employees.detail.options.employmentStatus.onLeave') },
    ];

    // Get employment type options
    const employmentTypeOptions: SelectOption[] = [
      { value: 'FullTime', label: t('employees.detail.options.employmentType.fullTime') },
      { value: 'PartTime', label: t('employees.detail.options.employmentType.partTime') },
      { value: 'Contract', label: t('employees.detail.options.employmentType.contract') },
      { value: 'Intern', label: t('employees.detail.options.employmentType.intern') },
    ];

    this.formConfig = {
      sections: [
        {
          title: userInfoSection,
          description: t('employees.detail.sections.userInformationDescription'),
          order: -1,
          collapsible: true,
          collapsed: false,
        },
        {
          title: personalInfoSection,
          description: t('employees.detail.sections.personalInformationDescription'),
          order: 0,
        },
        {
          title: workInfoSection,
          description: t('employees.detail.sections.workInformationDescription'),
          order: 1,
        },
        {
          title: addressInfoSection,
          description: t('employees.detail.sections.addressInformationDescription'),
          order: 2,
          collapsible: true,
          collapsed: false,
        },
        {
          title: emergencyContactSection,
          description: t('employees.detail.sections.emergencyContactDescription'),
          order: 3,
          collapsible: true,
          collapsed: false,
        },
      ],
      layout: {
        columns: 2,
        gap: '1.5rem',
        sectionGap: '2rem',
        labelPosition: 'top',
        showSectionDividers: true,
      },
      fields: [
        // User Information Section
        {
          key: 'username',
          type: 'input',
          label: t('employees.detail.fields.username'),
          placeholder: t('employees.detail.fields.usernamePlaceholder'),
          section: userInfoSection,
          order: 0,
          colSpan: 1,
          readonly: true,
        },
        {
          key: 'userEmail',
          type: 'input',
          label: t('employees.detail.fields.userEmail'),
          placeholder: t('employees.detail.fields.userEmailPlaceholder'),
          inputType: 'email',
          section: userInfoSection,
          order: 1,
          colSpan: 1,
          readonly: true,
        },
        {
          key: 'userRole',
          type: 'select',
          label: t('employees.detail.fields.role'),
          placeholder: t('employees.detail.fields.rolePlaceholder'),
          section: userInfoSection,
          order: 2,
          colSpan: 1,
          readonly: true,
          options: roleOptions,
        },
        {
          key: 'accountCreated',
          type: 'datepicker',
          label: t('employees.detail.fields.accountCreated'),
          placeholder: t('employees.detail.fields.accountCreatedPlaceholder'),
          section: userInfoSection,
          order: 3,
          colSpan: 1,
          readonly: true,
        },
        {
          key: 'lastLogin',
          type: 'datepicker',
          label: t('employees.detail.fields.lastLogin'),
          placeholder: t('employees.detail.fields.lastLoginPlaceholder'),
          section: userInfoSection,
          order: 4,
          colSpan: 1,
          readonly: true,
        },
        {
          key: 'isActive',
          type: 'select',
          label: t('employees.detail.fields.accountStatus'),
          placeholder: t('employees.detail.fields.accountStatusPlaceholder'),
          section: userInfoSection,
          order: 5,
          colSpan: 1,
          readonly: true,
          options: accountStatusOptions,
        },
        // Personal Information Section
        {
          key: 'firstName',
          type: 'input',
          label: t('employees.detail.fields.firstName'),
          placeholder: t('employees.detail.fields.firstNamePlaceholder'),
          required: true,
          section: personalInfoSection,
          order: 0,
          colSpan: 1,
        },
        {
          key: 'lastName',
          type: 'input',
          label: t('employees.detail.fields.lastName'),
          placeholder: t('employees.detail.fields.lastNamePlaceholder'),
          required: true,
          section: personalInfoSection,
          order: 1,
          colSpan: 1,
        },
        {
          key: 'email',
          type: 'input',
          label: t('employees.detail.fields.email'),
          placeholder: t('employees.detail.fields.emailPlaceholder'),
          required: true,
          inputType: 'email',
          section: personalInfoSection,
          order: 2,
          colSpan: 1,
          validator: (value) => {
            if (!value) return null;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value as string) ? null : 'Invalid email format';
          },
        },
        {
          key: 'phoneNumber',
          type: 'input',
          label: t('employees.detail.fields.phoneNumber'),
          placeholder: t('employees.detail.fields.phoneNumberPlaceholder'),
          inputType: 'tel',
          section: personalInfoSection,
          order: 3,
          colSpan: 1,
        },
        {
          key: 'employeeNumber',
          type: 'input',
          label: t('employees.detail.fields.employeeNumber'),
          placeholder: t('employees.detail.fields.employeeNumberPlaceholder'),
          section: personalInfoSection,
          order: 4,
          colSpan: 1,
          readonly: true,
        },
        // Work Information Section
        {
          key: 'employmentStatus',
          type: 'select',
          label: t('employees.detail.fields.employmentStatus'),
          placeholder: t('employees.detail.fields.employmentStatusPlaceholder'),
          required: true,
          section: workInfoSection,
          order: 0,
          colSpan: 1,
          options: employmentStatusOptions,
        },
        {
          key: 'employmentType',
          type: 'select',
          label: t('employees.detail.fields.employmentType'),
          placeholder: t('employees.detail.fields.employmentTypePlaceholder'),
          required: true,
          section: workInfoSection,
          order: 1,
          colSpan: 1,
          options: employmentTypeOptions,
        },
        {
          key: 'hireDate',
          type: 'datepicker',
          label: t('employees.detail.fields.hireDate'),
          placeholder: t('employees.detail.fields.hireDatePlaceholder'),
          required: true,
          section: workInfoSection,
          order: 2,
          colSpan: 1,
        },
        {
          key: 'terminationDate',
          type: 'datepicker',
          label: t('employees.detail.fields.terminationDate'),
          placeholder: t('employees.detail.fields.terminationDatePlaceholder'),
          section: workInfoSection,
          order: 3,
          colSpan: 1,
        },
        {
          key: 'departmentId',
          type: 'select',
          label: t('employees.detail.fields.department'),
          placeholder: t('employees.detail.fields.departmentPlaceholder'),
          section: workInfoSection,
          order: 4,
          colSpan: 1,
          searchable: true,
          options: [] as SelectOption[], // Will be populated dynamically from backend
        },
        {
          key: 'positionId',
          type: 'select',
          label: t('employees.detail.fields.position'),
          placeholder: t('employees.detail.fields.positionPlaceholder'),
          section: workInfoSection,
          order: 5,
          colSpan: 1,
          searchable: true,
          options: [] as SelectOption[], // Will be populated dynamically from backend
        },
        {
          key: 'managerId',
          type: 'select',
          label: t('employees.detail.fields.manager'),
          placeholder: t('employees.detail.fields.managerPlaceholder'),
          section: workInfoSection,
          order: 6,
          colSpan: 1,
          searchable: true,
          options: [] as SelectOption[], // Will be populated dynamically
        },
        {
          key: 'isManager',
          type: 'select',
          label: t('employees.detail.fields.isManager'),
          placeholder: t('employees.detail.fields.isManagerPlaceholder'),
          section: workInfoSection,
          order: 7,
          colSpan: 1,
          options: [
            { value: true, label: t('common.yes') },
            { value: false, label: t('common.no') },
          ] as SelectOption[],
        },
        {
          key: 'currentSalary',
          type: 'number',
          label: t('employees.detail.fields.currentSalary'),
          placeholder: t('employees.detail.fields.currentSalaryPlaceholder'),
          section: workInfoSection,
          order: 8,
          colSpan: 1,
          min: 0,
        },
        {
          key: 'salaryCurrency',
          type: 'input',
          label: t('employees.detail.fields.salaryCurrency'),
          placeholder: t('employees.detail.fields.salaryCurrencyPlaceholder'),
          section: workInfoSection,
          order: 9,
          colSpan: 1,
        },
        // Address Information Section
        {
          key: 'address',
          type: 'input',
          label: t('employees.detail.fields.streetAddress'),
          placeholder: t('employees.detail.fields.streetAddressPlaceholder'),
          section: addressInfoSection,
          order: 0,
          colSpan: 1,
        },
        {
          key: 'city',
          type: 'input',
          label: t('employees.detail.fields.city'),
          placeholder: t('employees.detail.fields.cityPlaceholder'),
          section: addressInfoSection,
          order: 1,
          colSpan: 1,
        },
        {
          key: 'postalCode',
          type: 'input',
          label: t('employees.detail.fields.postalCode'),
          placeholder: t('employees.detail.fields.postalCodePlaceholder'),
          section: addressInfoSection,
          order: 2,
          colSpan: 1,
        },
        {
          key: 'country',
          type: 'input',
          label: t('employees.detail.fields.country'),
          placeholder: t('employees.detail.fields.countryPlaceholder'),
          section: addressInfoSection,
          order: 3,
          colSpan: 1,
        },
        // Emergency Contact Section
        {
          key: 'emergencyContactName',
          type: 'input',
          label: t('employees.detail.fields.contactName'),
          placeholder: t('employees.detail.fields.contactNamePlaceholder'),
          section: emergencyContactSection,
          order: 0,
          colSpan: 1,
        },
        {
          key: 'emergencyContactPhone',
          type: 'input',
          label: t('employees.detail.fields.contactPhone'),
          placeholder: t('employees.detail.fields.contactPhonePlaceholder'),
          inputType: 'tel',
          section: emergencyContactSection,
          order: 1,
          colSpan: 1,
        },
        {
          key: 'emergencyContactRelation',
          type: 'input',
          label: t('employees.detail.fields.contactRelation'),
          placeholder: t('employees.detail.fields.contactRelationPlaceholder'),
          section: emergencyContactSection,
          order: 2,
          colSpan: 1,
        },
      ],
      submitButtonText: t('employees.detail.buttons.saveChanges'),
      cancelButtonText: t('employees.detail.buttons.cancel'),
      submitButtonVariant: 'primary',
      cancelButtonVariant: 'secondary',
    };
    this.cdr.markForCheck();
  }

  /**
   * Get modal title based on mode and whether user information is present
   */
  getModalTitle(): string {
    if (this.mode === 'edit') {
      return this.translationService.translate('employees.detail.title.edit');
    }
    // If user information is present, show "User Profile", otherwise "Employee Details"
    return this.user 
      ? this.translationService.translate('employees.detail.title.userProfile')
      : this.translationService.translate('employees.detail.title.view');
  }

  onClose(): void {
    this.closeEvent.emit();
  }

  onBackdropClick(): void {
    this.onClose();
  }

  /**
   * Initialize form data from employee and user
   */
  private initializeFormData(): void {
    if (!this.employee) return;

    // Initialize user information if available
    const userData: Record<string, unknown> = {};
    if (this.user) {
      userData['username'] = this.user.userName || '';
      userData['userEmail'] = this.user.email || '';
      userData['userRole'] = this.user.roles && this.user.roles.length > 0 ? this.user.roles[0] : 'User';
      userData['accountCreated'] = this.user.createdAt || null;
      userData['lastLogin'] = this.user.lastLoginAt || null;
      userData['isActive'] = this.user.isActive !== undefined ? this.user.isActive : true;
    }

    this.formData = {
      ...userData,
      firstName: this.employee.firstName || '',
      lastName: this.employee.lastName || '',
      email: this.employee.email || '',
      phoneNumber: this.employee.phone || '',
      employeeNumber: this.employee.employeeNumber || '',
      employmentStatus: this.employee.status || 'Active',
      employmentType: this.employee.employmentType || '',
      hireDate: this.employee.hireDate || '',
      terminationDate: this.employee.terminationDate || null,
      departmentId: this.employee.departmentId || null,
      positionId: this.employee.positionId || null,
      managerId: this.employee.managerId ? parseInt(this.employee.managerId) : null,
      isManager: this.employee.isManager ?? false,
      currentSalary: this.employee.salary || null,
      salaryCurrency: this.employee.salaryCurrency || '',
      address: this.employee.address?.street || '',
      city: this.employee.address?.city || '',
      postalCode: this.employee.address?.zipCode || '',
      country: this.employee.address?.country || '',
      emergencyContactName: this.employee.emergencyContact?.name || '',
      emergencyContactPhone: this.employee.emergencyContact?.phone || '',
      emergencyContactRelation: this.employee.emergencyContact?.relation || '',
    };

    // Initialize avatar preview
    if (this.employee.avatar) {
      this.avatarPreview.set(this.employee.avatar);
    } else {
      this.avatarPreview.set('');
    }
    this.selectedAvatarFile = null;
  }

  /**
   * Update form configuration based on mode (edit/view)
   * Also hide User Information section if user is not provided
   */
  private updateFormConfigForMode(): void {
    if (!this.formConfig.fields || this.formConfig.fields.length === 0) {
      return; // Fields not initialized yet
    }

    const isReadOnly = this.mode === 'view';
    const hasUser = this.user !== null;
    
    // Update sections - hide User Information section if no user provided
    const userInfoSectionTitle = this.translationService.translate('employees.detail.sections.userInformation');
    const updatedSections = (this.formConfig.sections || []).filter(section => {
      if (section.title === userInfoSectionTitle) {
        return hasUser; // Only show if user is provided
      }
      return true;
    });
    
    // Update all fields to be readonly/disabled in view mode
    // In edit mode, only preserve fields that should always be readonly (e.g., employeeNumber, user fields)
    const updatedFields = this.formConfig.fields.map(field => {
      // Check if this field should always be readonly
      // User information fields and employeeNumber should always be readonly
      const alwaysReadonly = field.key === 'employeeNumber' || 
                            field.key === 'username' || 
                            field.key === 'userEmail' || 
                            field.key === 'userRole' || 
                            field.key === 'accountCreated' || 
                            field.key === 'lastLogin' || 
                            field.key === 'isActive';
      
      return {
        ...field,
        // In edit mode: only readonly if field is always readonly
        // In view mode: all fields are readonly
        readonly: isReadOnly || alwaysReadonly,
        // In edit mode: disabled only if field is always readonly
        // In view mode: all fields are disabled
        // Note: disabled state will be managed by FormControl, not template binding
        disabled: isReadOnly || alwaysReadonly,
      };
    }).filter(field => {
      // Hide user information fields if no user provided
      const userInfoSectionTitle = this.translationService.translate('employees.detail.sections.userInformation');
      if (!hasUser && field.section === userInfoSectionTitle) {
        return false;
      }
      return true;
    });

    // Create a new formConfig object to trigger change detection
    // This ensures BaseFormComponent detects the change and updates FormControl disabled states
    this.formConfig = {
      ...this.formConfig,
      sections: updatedSections, // Updated sections (hide User Information if no user)
      fields: updatedFields, // New array reference
      showButtons: isReadOnly ? false : true,
      buttons: isReadOnly ? [
        {
          label: this.translationService.translate('employees.detail.buttons.close'),
          type: 'reset', // Use 'reset' type to trigger onCancel() in base-form
          variant: 'secondary',
          icon: 'close',
        },
      ] : undefined, // Use default buttons in edit mode
    };

    // Manually trigger change detection
    this.cdr.markForCheck();
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
   * Load department options from backend
   * Always refreshes to ensure latest data is available
   */
  private loadDepartmentOptions(): void {
    // Always reload departments to get the latest data
    // This ensures if user added a new department in another component,
    // it will be available in the dropdown
    this.departmentFacade.loadDepartments();
    
    // Wait for departments to load, then update options
    this.departmentFacade.departments$.pipe(
      filter(depts => depts.length > 0),
      first() // Simplified - only take first emission
    ).subscribe(loadedDepartments => {
      this.updateDepartmentOptions(loadedDepartments);
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

    const departmentField = this.formConfig.fields.find(f => f.key === 'departmentId');
    if (departmentField) {
      // Update options directly - Angular will detect the change
      departmentField.options = [...departmentOptions];
    }
    this.cdr.markForCheck();
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
   * Load position options from backend
   * Always refreshes to ensure latest data is available
   */
  private loadPositionOptions(): void {
    // Always reload positions to get the latest data
    // This ensures if user added a new position in another component,
    // it will be available in the dropdown
    this.positionFacade.loadPositions();
    
    // Wait for positions to load, then update options
    this.positionFacade.positions$.pipe(
      filter(positions => positions.length > 0),
      first() // Simplified - only take first emission
    ).subscribe(loadedPositions => {
      this.updatePositionOptions(loadedPositions);
    });
  }

  /**
   * Update position field options
   */
  private updatePositionOptions(positions: Position[]): void {
    const positionOptions: SelectOption[] = positions.map(pos => ({
      value: parseInt(pos.id),
      label: `${pos.title} (${pos.code})`
    }));

    const positionField = this.formConfig.fields.find(f => f.key === 'positionId');
    if (positionField) {
      // Update options directly - Angular will detect the change
      positionField.options = [...positionOptions];
    }
    this.cdr.markForCheck();
  }

  /**
   * Load manager options from backend when user clicks dropdown
   */
  private loadManagerOptionsIfNeeded(): void {
    // Set loading state
    this.fieldLoading.update(loading => ({ ...loading, managerId: true }));
    
    // Load managers from backend API
    const excludeEmployeeId = this.employee?.id;
    this.employeeService.getManagers(undefined, excludeEmployeeId)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('❌ Error loading managers:', error);
          this.fieldLoading.update(loading => ({ ...loading, managerId: false }));
          return of([]);
        })
      )
      .subscribe(managers => {
        this.updateManagerOptions(managers);
        this.fieldLoading.update(loading => ({ ...loading, managerId: false }));
      });
  }

  /**
   * Load manager options from employees list
   */
  private loadManagerOptions(): void {
    this.employeeFacade.employees$.pipe(
      first() // Simplified - only take first emission
    ).subscribe(employees => {
      this.updateManagerOptions(employees);
    });
  }

  /**
   * Update manager field options
   */
  private updateManagerOptions(managers: Employee[]): void {
    const managerOptions: SelectOption[] = managers.map(manager => ({
      value: parseInt(manager.id),
      label: `${manager.firstName} ${manager.lastName}${manager.employeeNumber ? ` (${manager.employeeNumber})` : ''}`
    }));

    const managerField = this.formConfig.fields.find(f => f.key === 'managerId');
    if (managerField) {
      // Update options directly - Angular will detect the change
      managerField.options = [...managerOptions];
    }
    this.cdr.markForCheck();
  }

  /**
   * Handle form submit
   */
  onFormSubmit(data: Record<string, unknown>): void {
    if (!this.employee) return;

    const firstName = (data['firstName'] as string)?.trim() || '';
    const lastName = (data['lastName'] as string)?.trim() || '';
    const employeeName = `${firstName} ${lastName}`;

    // Show confirmation dialog
    const confirm$: Observable<boolean> = this.dialogService.confirm({
      title: this.translationService.translate('employees.detail.confirm.title'),
      message: this.translationService.translate('employees.detail.confirm.message', { name: employeeName }),
      confirmText: this.translationService.translate('employees.detail.confirm.confirmText'),
      cancelText: this.translationService.translate('employees.detail.confirm.cancelText'),
      confirmVariant: 'primary',
      icon: 'save',
    });

    confirm$.pipe(
      first(), // Simplified - only take first emission
      filter((confirmed: boolean) => confirmed)
    ).subscribe(() => {
      // Track operation for success notification
      this.operationNotification.trackOperation({
        type: 'update',
        employeeName,
      });

      // Upload avatar if a new file was selected
      let avatarUrl = this.employee?.avatar || '';
      if (this.selectedAvatarFile) {
        this.avatarUploading.set(true);
        this.documentService.uploadFile(this.selectedAvatarFile).pipe(
          takeUntil(this.destroy$),
          catchError((error) => {
            console.error('Avatar upload failed:', error);
            this.avatarUploading.set(false);
            this.notificationService.error(
              this.translationService.translate('employees.detail.errors.avatarUploadFailed'),
              error.message || 'Failed to upload avatar'
            );
            return of(null);
          })
        ).subscribe({
          next: (uploadResponse) => {
            this.avatarUploading.set(false);
            if (uploadResponse) {
              // Build avatar URL from file ID
              avatarUrl = this.documentService.getFileDownloadUrl(uploadResponse.id);
              this.avatarPreview.set(avatarUrl);
              // Continue with employee update
              this.updateEmployeeWithAvatar(data, avatarUrl);
            }
          }
        });
        return; // Wait for avatar upload to complete
      }

      // No new avatar, proceed with update
      this.updateEmployeeWithAvatar(data, avatarUrl);
    });
  }

  /**
   * Update employee with avatar URL
   */
  private updateEmployeeWithAvatar(data: Record<string, unknown>, avatarUrl: string): void {
    if (!this.employee) return;

    const firstName = (data['firstName'] as string)?.trim() || '';
    const lastName = (data['lastName'] as string)?.trim() || '';

    // Prepare update data matching backend UpdateEmployeeDto
    const updateData: Partial<Employee> = {
      firstName,
      lastName,
      email: (data['email'] as string)?.trim() || '',
      phone: (data['phoneNumber'] as string)?.trim() || undefined,
      employeeNumber: (data['employeeNumber'] as string)?.trim() || undefined,
      hireDate: (data['hireDate'] as string) || '',
      terminationDate: (data['terminationDate'] as string) || null,
      status: (data['employmentStatus'] as string) as 'Active' | 'Inactive' | 'Terminated',
      employmentType: (data['employmentType'] as string) || undefined,
      departmentId: data['departmentId'] as number || null,
      positionId: data['positionId'] as number || null,
      managerId: data['managerId'] ? (data['managerId'] as number).toString() : null,
      isManager: (data['isManager'] as boolean) ?? false,
      salary: data['currentSalary'] as number || undefined,
      salaryCurrency: (data['salaryCurrency'] as string)?.trim() || undefined,
      avatar: avatarUrl, // Include avatar URL
      address: {
        street: (data['address'] as string)?.trim() || '',
        city: (data['city'] as string)?.trim() || '',
        state: '',
        zipCode: (data['postalCode'] as string)?.trim() || '',
        country: (data['country'] as string)?.trim() || '',
      },
      emergencyContact: {
        name: (data['emergencyContactName'] as string)?.trim() || '',
        phone: (data['emergencyContactPhone'] as string)?.trim() || '',
        relation: (data['emergencyContactRelation'] as string)?.trim() || '',
      },
    };

    // Dispatch update action through Facade
    if (this.employee) {
      this.employeeFacade.updateEmployee(this.employee.id, updateData);
    }
  }

  /**
   * Handle avatar file selection
   */
  onAvatarFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.notificationService.error(
        this.translationService.translate('employees.detail.errors.invalidImageType'),
        this.translationService.translate('employees.detail.errors.invalidImageTypeMessage')
      );
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      this.notificationService.error(
        this.translationService.translate('employees.detail.errors.imageTooLarge'),
        this.translationService.translate('employees.detail.errors.imageTooLargeMessage')
      );
      return;
    }

    // Store selected file
    this.selectedAvatarFile = file;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        this.avatarPreview.set(result);
      }
    };
    reader.readAsDataURL(file);

    // Reset input to allow selecting the same file again
    input.value = '';
  }

  /**
   * Remove selected avatar
   */
  onRemoveAvatar(): void {
    this.selectedAvatarFile = null;
    this.avatarPreview.set(this.employee?.avatar || '');
  }

  /**
   * View employee hierarchy (organization chart)
   */
  onViewHierarchy(): void {
    if (this.employee?.id) {
      this.showHierarchyModal.set(true);
    }
  }

  /**
   * Close hierarchy modal
   */
  onCloseHierarchyModal(): void {
    this.showHierarchyModal.set(false);
  }

  /**
   * Get full name for employee
   */
  getFullNameForHierarchy(): string {
    if (!this.employee) return '';
    return `${this.employee.firstName} ${this.employee.lastName}`;
  }

  /**
   * Handle form cancel
   */
  onFormCancel(): void {
    // Reset avatar selection
    this.selectedAvatarFile = null;
    if (this.employee) {
      this.avatarPreview.set(this.employee.avatar || '');
    }
    this.onClose();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}

