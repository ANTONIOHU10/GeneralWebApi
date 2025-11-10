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
import { Employee } from 'app/contracts/employees/employee.model';

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

  // 表单数据
  employeeForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    startDate: '',
    salary: '',
  };

  // 部门选项
  departments = [
    { value: 'hr', label: 'Human Resources' },
    { value: 'it', label: 'Information Technology' },
    { value: 'finance', label: 'Finance' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'sales', label: 'Sales' },
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

      // Prepare employee data (Omit<Employee, 'id'>)
      const newEmployee: Omit<Employee, 'id'> = {
        firstName: this.employeeForm.firstName,
        lastName: this.employeeForm.lastName,
        email: this.employeeForm.email,
        phone: this.employeeForm.phone || undefined,
        department: this.employeeForm.department || undefined,
        position: this.employeeForm.position || undefined,
        hireDate: this.employeeForm.startDate || undefined,
        status: 'Active', // Default status for new employees
        salary: this.employeeForm.salary ? parseFloat(this.employeeForm.salary) : undefined,
      };

      // Dispatch action through Facade (NgRx architecture)
      // Effect will handle HTTP call, Reducer will update Store,
      // OperationNotificationService will show notifications
      // Form reset will be handled in ngOnInit subscription only on success
      this.employeeFacade.createEmployee(newEmployee);
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
   * Validate form fields
   */
  private isFormValid(): boolean {
    return !!(
      this.employeeForm.firstName &&
      this.employeeForm.lastName &&
      this.employeeForm.email &&
      this.employeeForm.department &&
      this.employeeForm.position &&
      this.employeeForm.startDate
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
      phone: '',
      department: '',
      position: '',
      startDate: '',
      salary: '',
    };
  }
}
