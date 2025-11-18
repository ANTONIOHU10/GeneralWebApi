// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/employees/employee-detail/employee-detail.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, OnDestroy, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Employee } from 'app/contracts/employees/employee.model';
import {
  BaseModalComponent,
  BaseAvatarComponent,
  BaseBadgeComponent,
  BadgeVariant,
  BaseFormComponent,
  FormConfig,
  SelectOption,
} from '../../../Shared/components/base';
import { EmployeeFacade } from '@store/employee/employee.facade';
import { DialogService, OperationNotificationService } from '../../../Shared/services';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, filter, take, pairwise, debounceTime, startWith } from 'rxjs/operators';

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
    BaseFormComponent,
  ],
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.scss'],
})
export class EmployeeDetailComponent implements OnInit, OnChanges, OnDestroy {
  private employeeFacade = inject(EmployeeFacade);
  private dialogService = inject(DialogService);
  private operationNotification = inject(OperationNotificationService);
  private destroy$ = new Subject<void>();

  @Input() employee: Employee | null = null;
  @Input() isOpen = false;
  @Input() mode: 'edit' | 'view' = 'edit'; // Mode: 'edit' for editing, 'view' for read-only

  @Output() closeEvent = new EventEmitter<void>();
  // send here the employee data to the parent component (list employee) to update the employee
  @Output() employeeUpdated = new EventEmitter<Employee>();

  // Loading state for form - tracks update operation progress
  loading = false;

  // Form data
  formData: Record<string, unknown> = {};

  // Form configuration - will be updated based on mode
  formConfig: FormConfig = {
    sections: [
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
        options: [
          { value: 1, label: 'Human Resources' },
          { value: 2, label: 'Information Technology' },
          { value: 3, label: 'Finance' },
          { value: 4, label: 'Marketing' },
          { value: 5, label: 'Sales' },
        ] as SelectOption[],
      },
      {
        key: 'positionId',
        type: 'select',
        label: 'Position',
        placeholder: 'Select position',
        section: 'Work Information',
        order: 5,
        colSpan: 1,
        options: [
          { value: 1, label: 'Manager' },
          { value: 2, label: 'Developer' },
          { value: 3, label: 'Analyst' },
          { value: 4, label: 'Designer' },
          { value: 5, label: 'Coordinator' },
        ] as SelectOption[],
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
        key: 'currentSalary',
        type: 'number',
        label: 'Current Salary',
        placeholder: 'Enter salary amount',
        section: 'Work Information',
        order: 7,
        colSpan: 1,
        step: 0.01,
        min: 0,
      },
      {
        key: 'salaryCurrency',
        type: 'input',
        label: 'Salary Currency',
        placeholder: 'e.g., USD, EUR',
        section: 'Work Information',
        order: 8,
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
    // Initialize form config for current mode (edit/view)
    this.updateFormConfigForMode();

    // Subscribe to operation progress to update loading state for form (loading)
    this.employeeFacade.operationInProgress$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(operationState => {
      // Update loading state when update operation is in progress
      this.loading = operationState.loading && operationState.operation === 'update';
    });

    // Listen for successful update operation completion (success/ failed)
    // Use combineLatest to check BOTH operation state AND error state together
    combineLatest([
      this.employeeFacade.operationInProgress$.pipe(
        startWith({ loading: false, operation: null })
      ),
      this.employeeFacade.error$.pipe(
        startWith(null)
      )
    ]).pipe(
      takeUntil(this.destroy$),
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

    // Load employees for manager dropdown
    this.employeeFacade.loadEmployees();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['employee'] && this.employee) {
      this.initializeFormData();
      this.loadManagerOptions();
    }
    if (changes['mode'] || (changes['employee'] && this.employee)) {
      // Use setTimeout to ensure formConfig is updated after Angular change detection
      setTimeout(() => {
        this.updateFormConfigForMode();
      }, 0);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  onClose(): void {
    this.closeEvent.emit();
  }

  onBackdropClick(): void {
    this.onClose();
  }

  /**
   * Initialize form data from employee
   */
  private initializeFormData(): void {
    if (!this.employee) return;

    this.formData = {
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
  }

  /**
   * Update form configuration based on mode (edit/view)
   */
  private updateFormConfigForMode(): void {
    if (!this.formConfig.fields || this.formConfig.fields.length === 0) {
      return; // Fields not initialized yet
    }

    const isReadOnly = this.mode === 'view';
    
    // Update all fields to be readonly/disabled in view mode
    // In edit mode, only preserve fields that should always be readonly (e.g., employeeNumber)
    const updatedFields = this.formConfig.fields.map(field => {
      // Check if this field should always be readonly (e.g., employeeNumber)
      const alwaysReadonly = field.key === 'employeeNumber';
      
      return {
        ...field,
        // In edit mode: only readonly if field is always readonly
        // In view mode: all fields are readonly
        readonly: isReadOnly || alwaysReadonly,
        // In edit mode: disabled only if field is always readonly
        // In view mode: all fields are disabled
        disabled: isReadOnly || alwaysReadonly,
      };
    });

    // Create a completely new formConfig object to trigger change detection
    // This ensures base-form component detects the change
    this.formConfig = {
      ...this.formConfig,
      fields: updatedFields, // New array reference
      showButtons: isReadOnly ? false : true,
      buttons: isReadOnly ? [
        {
          label: 'Close',
          type: 'reset', // Use 'reset' type to trigger onCancel() in base-form
          variant: 'secondary',
          icon: 'close',
        },
      ] : undefined, // Use default buttons in edit mode
    };
  }


  /**
   * Load manager options from employees list
   */
  private loadManagerOptions(): void {
    this.employeeFacade.employees$.pipe(
      takeUntil(this.destroy$),
      take(1)
    ).subscribe(employees => {
      const managerOptions: SelectOption[] = employees
        .filter(emp => emp.id !== this.employee?.id && emp.isManager)
        .map(emp => ({
          value: parseInt(emp.id),
          label: `${emp.firstName} ${emp.lastName}`
        }));
      
      // Update manager field options
      const managerField = this.formConfig.fields.find(f => f.key === 'managerId');
      if (managerField) {
        managerField.options = managerOptions;
      }
    });
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
      title: 'Confirm Update',
      message: `Are you sure you want to update employee ${employeeName}?`,
      confirmText: 'Update',
      cancelText: 'Cancel',
      confirmVariant: 'primary',
      icon: 'save',
    });

    confirm$.pipe(
      take(1),
      takeUntil(this.destroy$),
      filter((confirmed: boolean) => confirmed)
    ).subscribe(() => {
      // Track operation for success notification
      this.operationNotification.trackOperation({
        type: 'update',
        employeeName,
      });

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
        // Format salary to ensure precision (2 decimal places)
        // This prevents floating point precision issues with JavaScript number type
        salary: data['currentSalary'] 
          ? parseFloat(Number(data['currentSalary'] as number).toFixed(2))
          : undefined,
        salaryCurrency: (data['salaryCurrency'] as string)?.trim() || undefined,
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
    });
  }

  /**
   * Handle form cancel
   */
  onFormCancel(): void {
    this.onClose();
  }

}

