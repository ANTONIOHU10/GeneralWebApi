// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/employees/add-employee/add-employee.component.ts
import { Component, inject, OnInit, Output, EventEmitter, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, combineLatest } from 'rxjs';
import { filter, first, pairwise, debounceTime, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  BaseFormComponent,
  FormConfig,
  SelectOption,
} from '../../../Shared/components/base';
import { DialogService, OperationNotificationService } from '../../../Shared/services';
import { TranslatePipe } from '@core/pipes/translate.pipe';
import { TranslationService } from '@core/services/translation.service';
import { EmployeeFacade } from '@store/employee/employee.facade';
import { DepartmentFacade } from '@store/department/department.facade';
import { PositionFacade } from '@store/position/position.facade';
import { CreateEmployeeRequest, Employee } from 'app/contracts/employees/employee.model';
import { Department } from 'app/contracts/departments/department.model';
import { Position } from 'app/contracts/positions/position.model';

@Component({
  selector: 'app-add-employee',
  standalone: true,
  imports: [
    CommonModule,
    BaseFormComponent,
    TranslatePipe,
  ],
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.scss'],
})
export class AddEmployeeComponent implements OnInit {
  private dialogService = inject(DialogService);
  private employeeFacade = inject(EmployeeFacade);
  private departmentFacade = inject(DepartmentFacade);
  private positionFacade = inject(PositionFacade);
  private operationNotification = inject(OperationNotificationService);
  private translationService = inject(TranslationService);
  private cdr = inject(ChangeDetectorRef);

  /**
   * Event emitted when employee is successfully created
   * Parent component can listen to this to switch tabs or perform other actions
   */
  @Output() employeeCreated = new EventEmitter<void>();

  // Loading state for form - tracks create operation progress (using signal for reactive updates)
  loading = signal(false);

  // Loading states for individual fields (for dropdown options loading)
  fieldLoading = signal<Record<string, boolean>>({
    departmentId: false,
    positionId: false,
  });

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
        options: [] as SelectOption[], // Will be populated dynamically
      },
      {
        key: 'positionId',
        type: 'select',
        label: 'Position',
        placeholder: 'Select position (optional)',
        section: 'Work Information',
        order: 4,
        colSpan: 1,
        options: [] as SelectOption[], // Will be populated dynamically
      },
      {
        key: 'currentSalary',
        type: 'number',
        label: 'Current Salary',
        placeholder: 'Enter salary amount (optional)',
        section: 'Work Information',
        order: 5,
        colSpan: 1,
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
    submitButtonText: '', // Will be set in applyTranslationsToFormConfig
    cancelButtonText: '', // Will be set in applyTranslationsToFormConfig
    submitButtonVariant: 'primary',
    cancelButtonVariant: 'secondary',
  };

  ngOnInit() {
    // Apply translations to form config
    this.applyTranslationsToFormConfig();

    // Note: OperationNotificationService is already setup in parent component (employee-list)
    // No need to setup again here to avoid duplicate notifications

    // Subscribe to operation progress to update loading state
    // Simplified: Direct subscription without effect wrapper
    this.employeeFacade.operationInProgress$.subscribe(operationState => {
      this.loading.set(operationState.loading && operationState.operation === 'create');
    });

    // Listen for successful create operation completion
    combineLatest([
      this.employeeFacade.operationInProgress$,
      this.employeeFacade.error$
    ]).pipe(
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
      first(), // Simplified - only take first emission
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
          currentSalary: data['currentSalary'] as number,
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

      // Convert CreateEmployeeRequest to Omit<Employee, 'id'> for Facade
      // Facade uses Employee format, but we have CreateEmployeeRequest
      const employeeData: Omit<Employee, 'id'> = {
        firstName: createRequest.firstName,
        lastName: createRequest.lastName,
        email: createRequest.email,
        employeeNumber: createRequest.employeeNumber,
        phone: createRequest.phoneNumber,
        departmentId: createRequest.departmentId,
        positionId: createRequest.positionId,
        managerId: createRequest.managerId ? createRequest.managerId.toString() : null,
        hireDate: createRequest.hireDate,
        status: createRequest.employmentStatus as 'Active' | 'Inactive' | 'Terminated',
        employmentType: createRequest.employmentType,
        salary: createRequest.currentSalary,
        salaryCurrency: createRequest.salaryCurrency,
        address: createRequest.address || createRequest.city || createRequest.postalCode || createRequest.country
          ? {
              street: createRequest.address || '',
              city: createRequest.city || '',
              state: '',
              zipCode: createRequest.postalCode || '',
              country: createRequest.country || '',
            }
          : undefined,
        emergencyContact: createRequest.emergencyContactName || createRequest.emergencyContactPhone || createRequest.emergencyContactRelation
          ? {
              name: createRequest.emergencyContactName || '',
              phone: createRequest.emergencyContactPhone || '',
              relation: createRequest.emergencyContactRelation || '',
            }
          : undefined,
        taxCode: createRequest.taxCode,
      };

      // Dispatch action through Facade (NgRx architecture)
      // Effect will handle HTTP call, Reducer will update Store,
      // OperationNotificationService will show notifications
      // Form reset will be handled in ngOnInit subscription only on success
      this.employeeFacade.createEmployee(employeeData);
    });
  }

  /**
   * Handle field dropdown open event
   * Load data when user clicks on department or position dropdown
   */
  onFieldDropdownOpen(key: string): void {
    console.log('🔍 Dropdown opened for field:', key);
    if (key === 'departmentId') {
      console.log('📥 Loading departments...');
      this.loadDepartmentOptionsIfNeeded();
    } else if (key === 'positionId') {
      console.log('📥 Loading positions...');
      this.loadPositionOptionsIfNeeded();
    }
  }

  /**
   * Load department options from backend when user clicks dropdown
   * Always loads to ensure latest data
   */
  private loadDepartmentOptionsIfNeeded(): void {
    console.log('🔍 loadDepartmentOptionsIfNeeded called');
    
    // Set loading state
    this.fieldLoading.update(loading => ({ ...loading, departmentId: true }));
    
    // Always load from API to ensure latest data
    console.log('🚀 Loading departments from API...');
    this.departmentFacade.loadDepartments();
    
    // Wait for departments to load, then update options
    this.departmentFacade.departments$.pipe(
      filter(loadedDepts => loadedDepts.length > 0),
      first(), // Simplified - only take first emission
      catchError(error => {
        console.error('❌ Error loading departments:', error);
        // Clear loading state on error
        this.fieldLoading.update(loading => ({ ...loading, departmentId: false }));
        return of([]);
      })
    ).subscribe(loadedDepartments => {
      if (loadedDepartments.length > 0) {
        console.log('✅ Departments loaded:', loadedDepartments.length);
        this.updateDepartmentOptions(loadedDepartments);
      }
      // Clear loading state
      this.fieldLoading.update(loading => ({ ...loading, departmentId: false }));
    });
  }

  /**
   * Load department options from backend
   * Always refreshes to ensure latest data is available
   */
  private loadDepartmentOptions(): void {
    // Always reload departments to get the latest data
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
   * Updates the field options directly without recreating the entire formConfig
   * This prevents form reinitialization and dropdown closing
   */
  private updateDepartmentOptions(departments: Department[]): void {
    const departmentOptions: SelectOption[] = departments.map(dept => ({
      value: parseInt(dept.id),
      label: `${dept.name} (${dept.code})`
    }));

    // Find and update the department field directly
    const departmentField = this.formConfig.fields.find(f => f.key === 'departmentId');
    if (departmentField) {
      // Update options directly - Angular will detect the change
      departmentField.options = [...departmentOptions];
      console.log('🔄 Updated department options:', departmentOptions.length);
    }
    
    // Manually trigger change detection
    this.cdr.markForCheck();
  }

  /**
   * Load position options from backend when user clicks dropdown
   * Always loads to ensure latest data
   */
  private loadPositionOptionsIfNeeded(): void {
    console.log('🔍 loadPositionOptionsIfNeeded called');
    
    // Set loading state
    this.fieldLoading.update(loading => ({ ...loading, positionId: true }));
    
    // Always load from API to ensure latest data
    console.log('🚀 Loading positions from API...');
    this.positionFacade.loadPositions();
    
    // Wait for positions to load, then update options
    this.positionFacade.positions$.pipe(
      filter(loadedPos => loadedPos.length > 0),
      first(), // Simplified - only take first emission
      catchError(error => {
        console.error('❌ Error loading positions:', error);
        // Clear loading state on error
        this.fieldLoading.update(loading => ({ ...loading, positionId: false }));
        return of([]);
      })
    ).subscribe(loadedPositions => {
      if (loadedPositions.length > 0) {
        console.log('✅ Positions loaded:', loadedPositions.length);
        this.updatePositionOptions(loadedPositions);
      }
      // Clear loading state
      this.fieldLoading.update(loading => ({ ...loading, positionId: false }));
    });
  }

  /**
   * Load position options from backend
   * Always refreshes to ensure latest data is available
   */
  private loadPositionOptions(): void {
    // Always reload positions to get the latest data
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
   * Updates the field options directly without recreating the entire formConfig
   * This prevents form reinitialization and dropdown closing
   */
  private updatePositionOptions(positions: Position[]): void {
    const positionOptions: SelectOption[] = positions.map(pos => ({
      value: parseInt(pos.id),
      label: `${pos.title} (${pos.code})`
    }));

    // Find and update the position field directly
    const positionField = this.formConfig.fields.find(f => f.key === 'positionId');
    if (positionField) {
      // Update options directly - Angular will detect the change
      positionField.options = [...positionOptions];
      console.log('🔄 Updated position options:', positionOptions.length);
    }
    
    // Manually trigger change detection
    this.cdr.markForCheck();
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
   * Apply translations to form config
   */
  private applyTranslationsToFormConfig(): void {
    // Translate sections
    if (this.formConfig.sections) {
      this.formConfig.sections.forEach(section => {
      if (section.title === 'Personal Information') {
        section.title = this.translationService.translate('employees.add.sections.personalInformation');
        section.description = this.translationService.translate('employees.add.sections.personalInformationDescription');
      } else if (section.title === 'Work Information') {
        section.title = this.translationService.translate('employees.add.sections.workInformation');
        section.description = this.translationService.translate('employees.add.sections.workInformationDescription');
      } else if (section.title === 'Address Information') {
        section.title = this.translationService.translate('employees.add.sections.addressInformation');
        section.description = this.translationService.translate('employees.add.sections.addressInformationDescription');
      } else if (section.title === 'Emergency Contact') {
        section.title = this.translationService.translate('employees.add.sections.emergencyContact');
        section.description = this.translationService.translate('employees.add.sections.emergencyContactDescription');
      }
      });
    }

    // Translate fields
    if (this.formConfig.fields) {
      this.formConfig.fields.forEach(field => {
        const fieldKey = String(field.key);
        const translationKey = `employees.add.fields.${fieldKey}`;
      const translatedLabel = this.translationService.translate(translationKey);
      const translatedPlaceholder = this.translationService.translate(`${translationKey}Placeholder`);
      
      if (translatedLabel && translatedLabel !== translationKey) {
        field.label = translatedLabel;
      }
      if (translatedPlaceholder && translatedPlaceholder !== `${translationKey}Placeholder`) {
        field.placeholder = translatedPlaceholder;
      }

      // Translate section names in fields
      if (field.section === 'Personal Information') {
        field.section = this.translationService.translate('employees.add.sections.personalInformation');
      } else if (field.section === 'Work Information') {
        field.section = this.translationService.translate('employees.add.sections.workInformation');
      } else if (field.section === 'Address Information') {
        field.section = this.translationService.translate('employees.add.sections.addressInformation');
      } else if (field.section === 'Emergency Contact') {
        field.section = this.translationService.translate('employees.add.sections.emergencyContact');
      }
      });
    }

    // Translate button texts
    this.formConfig.submitButtonText = this.translationService.translate('employees.tabs.add');
    this.formConfig.cancelButtonText = this.translationService.translate('common.cancel');
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
