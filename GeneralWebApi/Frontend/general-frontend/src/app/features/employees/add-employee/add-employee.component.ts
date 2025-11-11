// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/employees/add-employee/add-employee.component.ts
import { Component, inject, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Observable, combineLatest } from 'rxjs';
import { takeUntil, filter, take, pairwise, debounceTime } from 'rxjs/operators';
import { BaseButtonComponent } from '../../../Shared/components/base/base-button/base-button.component';
import { BaseInputComponent } from '../../../Shared/components/base/base-input/base-input.component';
import { BaseSelectComponent } from '../../../Shared/components/base/base-select/base-select.component';
import { DialogService, OperationNotificationService } from '../../../Shared/services';
import { EmployeeFacade } from '@store/employee/employee.facade';
import { Employee, CreateEmployeeRequest } from 'app/contracts/employees/employee.model';

@Component({
  selector: 'app-add-employee',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BaseButtonComponent,
    BaseInputComponent,
    BaseSelectComponent,
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

  // Form data - matches backend CreateEmployeeDto requirements
  employeeForm = {
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
    departmentId: null as number | null,
    positionId: null as number | null,
    managerId: null as number | null,
    currentSalary: null as number | null,
    salaryCurrency: 'USD',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    taxCode: '', // Optional: Tax code
  };

  // Employment status options
  employmentStatusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'Terminated', label: 'Terminated' },
    { value: 'OnLeave', label: 'On Leave' },
  ];

  // Employment type options
  employmentTypeOptions = [
    { value: 'FullTime', label: 'Full Time' },
    { value: 'PartTime', label: 'Part Time' },
    { value: 'Contract', label: 'Contract' },
    { value: 'Intern', label: 'Intern' },
  ];

  // Department options (should be loaded from API, using placeholder for now)
  departments = [
    { value: 1, label: 'Human Resources' },
    { value: 2, label: 'Information Technology' },
    { value: 3, label: 'Finance' },
    { value: 4, label: 'Marketing' },
    { value: 5, label: 'Sales' },
  ];

  // Position options (should be loaded from API, using placeholder for now)
  positions = [
    { value: 1, label: 'Manager' },
    { value: 2, label: 'Developer' },
    { value: 3, label: 'Analyst' },
    { value: 4, label: 'Designer' },
    { value: 5, label: 'Coordinator' },
  ];

  ngOnInit() {
    // Note: OperationNotificationService is already setup in parent component (employee-list)
    // No need to setup again here to avoid duplicate notifications

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
   * Handle create employee action with confirmation
   * Uses NgRx architecture: Dialog → Facade → Effect → Store → Notification
   * Follows the same pattern as deleteEmployee in employee-list.component.ts
   */
  onSubmit() {
    // Validate form
    if (!this.isFormValid()) {
      return;
    }

    const employeeName = `${this.employeeForm.firstName} ${this.employeeForm.lastName}`;
    
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
        firstName: this.employeeForm.firstName.trim(),
        lastName: this.employeeForm.lastName.trim(),
        email: this.employeeForm.email.trim(),
        hireDate: this.employeeForm.hireDate,
        employmentStatus: this.employeeForm.employmentStatus,
        employmentType: this.employeeForm.employmentType,
        // Optional fields - only include if provided
        ...(this.employeeForm.employeeNumber.trim() && {
          employeeNumber: this.employeeForm.employeeNumber.trim(),
        }),
        ...(this.employeeForm.phoneNumber.trim() && {
          phoneNumber: this.employeeForm.phoneNumber.trim(),
        }),
        ...(this.employeeForm.departmentId && {
          departmentId: this.employeeForm.departmentId,
        }),
        ...(this.employeeForm.positionId && {
          positionId: this.employeeForm.positionId,
        }),
        ...(this.employeeForm.managerId && {
          managerId: this.employeeForm.managerId,
        }),
        ...(this.employeeForm.currentSalary && {
          currentSalary: this.employeeForm.currentSalary,
        }),
        ...(this.employeeForm.salaryCurrency && {
          salaryCurrency: this.employeeForm.salaryCurrency,
        }),
        ...(this.employeeForm.address.trim() && {
          address: this.employeeForm.address.trim(),
        }),
        ...(this.employeeForm.city.trim() && {
          city: this.employeeForm.city.trim(),
        }),
        ...(this.employeeForm.postalCode.trim() && {
          postalCode: this.employeeForm.postalCode.trim(),
        }),
        ...(this.employeeForm.country.trim() && {
          country: this.employeeForm.country.trim(),
        }),
        ...(this.employeeForm.emergencyContactName.trim() && {
          emergencyContactName: this.employeeForm.emergencyContactName.trim(),
        }),
        ...(this.employeeForm.emergencyContactPhone.trim() && {
          emergencyContactPhone: this.employeeForm.emergencyContactPhone.trim(),
        }),
        ...(this.employeeForm.emergencyContactRelation.trim() && {
          emergencyContactRelation: this.employeeForm.emergencyContactRelation.trim(),
        }),
        // TaxCode is required - always include it
        taxCode: this.employeeForm.taxCode.trim(),
      };

      // Dispatch action through Facade (NgRx architecture)
      // Note: We need to cast to Omit<Employee, 'id'> for now, but ideally should update the action type
      // Effect will handle HTTP call, Reducer will update Store,
      // OperationNotificationService will show notifications
      // Form reset will be handled in ngOnInit subscription only on success
      this.employeeFacade.createEmployee(createRequest as any);
    });
  }

  /**
   * Handle cancel action - reset form
   * Parent component can listen to this or handle tab switching separately
   */
  onCancel() {
    // Reset form
    this.resetForm();
  }

  /**
   * Validate form fields - check required fields only
   */
  private isFormValid(): boolean {
    return !!(
      this.employeeForm.firstName?.trim() &&
      this.employeeForm.lastName?.trim() &&
      this.employeeForm.email?.trim() &&
      this.employeeForm.hireDate &&
      this.employeeForm.employmentStatus &&
      this.employeeForm.employmentType &&
      this.employeeForm.taxCode?.trim()
    );
  }

  /**
   * Reset form to initial state
   */
  private resetForm(): void {
    this.employeeForm = {
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
