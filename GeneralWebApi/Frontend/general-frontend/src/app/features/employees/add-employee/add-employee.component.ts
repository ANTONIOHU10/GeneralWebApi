// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/employees/add-employee/add-employee.component.ts
import { Component, inject, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, Observable, combineLatest } from 'rxjs';
import { takeUntil, filter, take, pairwise, debounceTime } from 'rxjs/operators';
import {
  BaseFormComponent,
  FormConfig,
  SelectOption,
} from '../../../Shared/components/base';
import { DialogService, OperationNotificationService } from '../../../Shared/services';
import { EmployeeFacade } from '@store/employee/employee.facade';
import { CreateEmployeeRequest } from 'app/contracts/employees/employee.model';

@Component({
  selector: 'app-add-employee',
  standalone: true,
  imports: [
    CommonModule,
    BaseFormComponent,
  ],
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.scss'],
})
export class AddEmployeeComponent implements OnInit, OnDestroy {
  private dialogService = inject(DialogService);
  private employeeFacade = inject(EmployeeFacade);
  private operationNotification = inject(OperationNotificationService);
  private destroy$ = new Subject<void>();

  /**
   * Event emitted when employee is successfully created
   * Parent component can listen to this to switch tabs or perform other actions
   */
  @Output() employeeCreated = new EventEmitter<void>();

  // Loading state for form - tracks create operation progress
  loading = false;

  // Form data - matches backend CreateEmployeeDto requirements
  formData: Record<string, unknown> = {
    // Required fields
    firstName: '',
    lastName: '',
    email: '',
    hireDate: '',
    employmentStatus: 'Active',
    employmentType: 'FullTime',
    // Optional fields
    employeeNumber: '', // Optional: if empty, backend will auto-generate
    phoneNumber: '',
    departmentId: null,
    positionId: null,
    managerId: null,
    currentSalary: null,
    salaryCurrency: 'USD',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    taxCode: '', // Required: Tax code
  };

  // Form configuration
  formConfig: FormConfig = {
    sections: [
      {
        title: 'Personal Information',
        description: 'Enter the employee\'s personal details',
        order: 0,
      },
      {
        title: 'Work Information',
        description: 'Enter employment details',
        order: 1,
      },
      {
        title: 'Address Information',
        description: 'Optional address details',
        order: 2,
        collapsible: true,
        collapsed: false,
      },
      {
        title: 'Emergency Contact',
        description: 'Optional emergency contact information',
        order: 3,
        collapsible: true,
        collapsed: true,
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
        placeholder: 'Enter phone number (optional)',
        inputType: 'tel',
        section: 'Personal Information',
        order: 3,
        colSpan: 1,
      },
      {
        key: 'employeeNumber',
        type: 'input',
        label: 'Employee Number',
        placeholder: 'Leave empty to auto-generate (optional)',
        section: 'Personal Information',
        order: 4,
        colSpan: 1,
      },
      {
        key: 'taxCode',
        type: 'input',
        label: 'Tax Code',
        placeholder: 'Enter tax code / fiscal code',
        required: true,
        section: 'Personal Information',
        order: 5,
        colSpan: 1,
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
        key: 'departmentId',
        type: 'select',
        label: 'Department',
        placeholder: 'Select department (optional)',
        section: 'Work Information',
        order: 3,
        colSpan: 1,
        searchable: true,
        options: [
          { value: null, label: '' },
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
        placeholder: 'Select position (optional)',
        section: 'Work Information',
        order: 4,
        colSpan: 1,
        options: [
          { value: null, label: '' },
          { value: 1, label: 'Manager' },
          { value: 2, label: 'Developer' },
          { value: 3, label: 'Analyst' },
          { value: 4, label: 'Designer' },
          { value: 5, label: 'Coordinator' },
        ] as SelectOption[],
      },
      {
        key: 'currentSalary',
        type: 'number',
        label: 'Current Salary',
        placeholder: 'Enter salary amount (optional)',
        section: 'Work Information',
        order: 5,
        colSpan: 1,
        step: 0.01,
        min: 0,
      },
      {
        key: 'salaryCurrency',
        type: 'input',
        label: 'Salary Currency',
        placeholder: 'e.g., USD, EUR (optional)',
        section: 'Work Information',
        order: 6,
        colSpan: 1,
      },
      // Address Information Section
      {
        key: 'address',
        type: 'input',
        label: 'Address',
        placeholder: 'Enter street address (optional)',
        section: 'Address Information',
        order: 0,
        colSpan: 1,
      },
      {
        key: 'city',
        type: 'input',
        label: 'City',
        placeholder: 'Enter city (optional)',
        section: 'Address Information',
        order: 1,
        colSpan: 1,
      },
      {
        key: 'postalCode',
        type: 'input',
        label: 'Postal Code',
        placeholder: 'Enter postal code (optional)',
        section: 'Address Information',
        order: 2,
        colSpan: 1,
      },
      {
        key: 'country',
        type: 'input',
        label: 'Country',
        placeholder: 'Enter country (optional)',
        section: 'Address Information',
        order: 3,
        colSpan: 1,
      },
      // Emergency Contact Section
      {
        key: 'emergencyContactName',
        type: 'input',
        label: 'Contact Name',
        placeholder: 'Enter emergency contact name (optional)',
        section: 'Emergency Contact',
        order: 0,
        colSpan: 1,
      },
      {
        key: 'emergencyContactPhone',
        type: 'input',
        label: 'Contact Phone',
        placeholder: 'Enter emergency contact phone (optional)',
        inputType: 'tel',
        section: 'Emergency Contact',
        order: 1,
        colSpan: 1,
      },
      {
        key: 'emergencyContactRelation',
        type: 'input',
        label: 'Contact Relation',
        placeholder: 'e.g., Spouse, Parent (optional)',
        section: 'Emergency Contact',
        order: 2,
        colSpan: 1,
      },
    ],
    submitButtonText: 'Add Employee',
    cancelButtonText: 'Cancel',
    submitButtonVariant: 'primary',
    cancelButtonVariant: 'secondary',
  };

  ngOnInit() {
    // Note: OperationNotificationService is already setup in parent component (employee-list)
    // No need to setup again here to avoid duplicate notifications

    // Subscribe to operation progress to update loading state for form
    this.employeeFacade.operationInProgress$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(operationState => {
      // Update loading state when create operation is in progress
      this.loading = operationState.loading && operationState.operation === 'create';
    });

    // Listen for successful create operation completion
    // Use combineLatest to check BOTH operation state AND error state together
    // Add debounceTime to wait for Store state to stabilize after operation completion
    combineLatest([
      this.employeeFacade.operationInProgress$,
      this.employeeFacade.error$
    ]).pipe(
      takeUntil(this.destroy$),
      pairwise(), // Compare current with previous state
      debounceTime(50), // Wait 50ms for Store state to stabilize
      filter(([prev, curr]) => {
        // Previous state: operation was in progress
        const wasCreating = prev[0].loading === true && prev[0].operation === 'create';
        // Current state: operation completed
        const isCompleted = curr[0].loading === false && curr[0].operation === null;
        // Current state: no error
        const hasNoError = curr[1] === null;
        
        // Only trigger if all conditions are met
        return wasCreating && isCompleted && hasNoError;
      })
    ).subscribe(() => {
      // Operation completed successfully without errors - reset form
      this.resetForm();
      // Emit event to parent component
      this.employeeCreated.emit();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Handle form submit from base-form component
   * Uses NgRx architecture: Dialog → Facade → Effect → Store → Notification
   */
  onFormSubmit(data: Record<string, unknown>): void {
    const firstName = (data['firstName'] as string)?.trim() || '';
    const lastName = (data['lastName'] as string)?.trim() || '';
    const employeeName = `${firstName} ${lastName}`;
    
    // Show confirmation dialog first
    const confirm$: Observable<boolean> = this.dialogService.confirm({
      title: 'Confirm Create',
      message: `Are you sure you want to create employee ${employeeName}?`,
      confirmText: 'Create',
      cancelText: 'Cancel',
      confirmVariant: 'primary',
      icon: 'add',
    });
    
    confirm$.pipe(
      take(1),
      takeUntil(this.destroy$),
      filter((confirmed: boolean) => confirmed)
    ).subscribe(() => {
      // Track operation for success notification
      this.operationNotification.trackOperation({
        type: 'create',
        employeeName,
      });

      // Prepare employee data matching backend CreateEmployeeDto
      const createRequest: CreateEmployeeRequest = {
        // Required fields
        firstName: firstName,
        lastName: lastName,
        email: (data['email'] as string)?.trim() || '',
        hireDate: (data['hireDate'] as string) || '',
        employmentStatus: (data['employmentStatus'] as string) || 'Active',
        employmentType: (data['employmentType'] as string) || 'FullTime',
        // Optional fields - only include if provided
        ...((data['employeeNumber'] as string)?.trim() ? {
          employeeNumber: (data['employeeNumber'] as string).trim(),
        } : {}),
        ...((data['phoneNumber'] as string)?.trim() ? {
          phoneNumber: (data['phoneNumber'] as string).trim(),
        } : {}),
        ...(data['departmentId'] ? {
          departmentId: data['departmentId'] as number,
        } : {}),
        ...(data['positionId'] ? {
          positionId: data['positionId'] as number,
        } : {}),
        ...(data['managerId'] ? {
          managerId: data['managerId'] as number,
        } : {}),
        ...(data['currentSalary'] ? {
          // Format salary to ensure precision (2 decimal places)
          // This prevents floating point precision issues with JavaScript number type
          currentSalary: parseFloat(Number(data['currentSalary'] as number).toFixed(2)),
        } : {}),
        ...((data['salaryCurrency'] as string)?.trim() ? {
          salaryCurrency: (data['salaryCurrency'] as string).trim(),
        } : {}),
        ...((data['address'] as string)?.trim() ? {
          address: (data['address'] as string).trim(),
        } : {}),
        ...((data['city'] as string)?.trim() ? {
          city: (data['city'] as string).trim(),
        } : {}),
        ...((data['postalCode'] as string)?.trim() ? {
          postalCode: (data['postalCode'] as string).trim(),
        } : {}),
        ...((data['country'] as string)?.trim() ? {
          country: (data['country'] as string).trim(),
        } : {}),
        ...((data['emergencyContactName'] as string)?.trim() ? {
          emergencyContactName: (data['emergencyContactName'] as string).trim(),
        } : {}),
        ...((data['emergencyContactPhone'] as string)?.trim() ? {
          emergencyContactPhone: (data['emergencyContactPhone'] as string).trim(),
        } : {}),
        ...((data['emergencyContactRelation'] as string)?.trim() ? {
          emergencyContactRelation: (data['emergencyContactRelation'] as string).trim(),
        } : {}),
        // TaxCode is required - always include it
        taxCode: (data['taxCode'] as string)?.trim() || '',
      };

      // Dispatch action through Facade (NgRx architecture)
      // Effect will handle HTTP call, Reducer will update Store,
      // OperationNotificationService will show notifications
      // Form reset will be handled in ngOnInit subscription only on success
      this.employeeFacade.createEmployee(createRequest as any);
    });
  }

  /**
   * Handle form cancel from base-form component
   * Parent component can listen to this or handle tab switching separately
   */
  onFormCancel(): void {
    // Reset form
    this.resetForm();
  }

  /**
   * Reset form to initial state
   */
  private resetForm(): void {
    this.formData = {
      firstName: '',
      lastName: '',
      email: '',
      hireDate: '',
      employmentStatus: 'Active',
      employmentType: 'FullTime',
      employeeNumber: '',
      phoneNumber: '',
      departmentId: null,
      positionId: null,
      managerId: null,
      currentSalary: null,
      salaryCurrency: 'USD',
      address: '',
      city: '',
      postalCode: '',
      country: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelation: '',
      taxCode: '',
    };
  }
}
