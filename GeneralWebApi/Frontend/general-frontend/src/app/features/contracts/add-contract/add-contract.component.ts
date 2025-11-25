// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/contracts/add-contract/add-contract.component.ts
import { Component, inject, OnDestroy, OnInit, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, of } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import {
  BaseFormComponent,
  FormConfig,
  SelectOption,
} from '../../../Shared/components/base';
import { DialogService, NotificationService } from '../../../Shared/services';
import { CONTRACT_TYPES, CONTRACT_STATUSES, CreateContractRequest } from 'app/contracts/contracts/contract.model';
import { ContractService } from '../../../core/services/contract.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { Employee } from 'app/contracts/employees/employee.model';

@Component({
  selector: 'app-add-contract',
  standalone: true,
  imports: [
    CommonModule,
    BaseFormComponent,
  ],
  templateUrl: './add-contract.component.html',
  styleUrls: ['./add-contract.component.scss'],
})
export class AddContractComponent implements OnInit, OnDestroy {
  private dialogService = inject(DialogService);
  private notificationService = inject(NotificationService);
  private contractService = inject(ContractService);
  private employeeService = inject(EmployeeService);
  private destroy$ = new Subject<void>();

  @Output() contractCreated = new EventEmitter<void>();

  loading = signal(false);
  loadingEmployees = signal(false);

  formData: Record<string, unknown> = {
    employeeId: null,
    contractType: 'Indefinite',
    startDate: new Date().toISOString().split('T')[0],
    endDate: null,
    status: 'Active',
    salary: null,
    notes: '',
    renewalReminderDate: null,
  };

  // Employee options loaded from backend
  employeeOptions: SelectOption[] = [];

  formConfig: FormConfig = {
    sections: [
      {
        title: 'Contract Information',
        description: 'Enter contract details',
        order: 0,
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
      {
        key: 'employeeId',
        type: 'select',
        label: 'Employee',
        placeholder: 'Select employee',
        required: true,
        section: 'Contract Information',
        order: 0,
        colSpan: 2,
        searchable: true,
        options: this.employeeOptions,
      },
      {
        key: 'contractType',
        type: 'select',
        label: 'Contract Type',
        placeholder: 'Select contract type',
        required: true,
        section: 'Contract Information',
        order: 1,
        colSpan: 1,
        options: CONTRACT_TYPES.map(type => ({
          value: type.value,
          label: type.label,
        })) as SelectOption[],
      },
      {
        key: 'status',
        type: 'select',
        label: 'Status',
        placeholder: 'Select status',
        required: true,
        section: 'Contract Information',
        order: 2,
        colSpan: 1,
        options: CONTRACT_STATUSES.map(status => ({
          value: status.value,
          label: status.label,
        })) as SelectOption[],
      },
      {
        key: 'startDate',
        type: 'datepicker',
        label: 'Start Date',
        placeholder: 'Select start date',
        required: true,
        section: 'Contract Information',
        order: 3,
        colSpan: 1,
      },
      {
        key: 'endDate',
        type: 'datepicker',
        label: 'End Date',
        placeholder: 'Select end date (optional)',
        required: false,
        section: 'Contract Information',
        order: 4,
        colSpan: 1,
      },
      {
        key: 'salary',
        type: 'number',
        label: 'Salary',
        placeholder: 'Enter salary (optional)',
        required: false,
        section: 'Contract Information',
        order: 5,
        colSpan: 1,
        min: 0,
      },
      {
        key: 'renewalReminderDate',
        type: 'datepicker',
        label: 'Renewal Reminder Date',
        placeholder: 'Select renewal reminder date (optional)',
        required: false,
        section: 'Contract Information',
        order: 6,
        colSpan: 1,
      },
      {
        key: 'notes',
        type: 'textarea',
        label: 'Notes',
        placeholder: 'Enter additional notes (optional)',
        required: false,
        section: 'Contract Information',
        order: 7,
        colSpan: 2,
        rows: 4,
      },
    ],
    submitButtonText: 'Create Contract',
    cancelButtonText: 'Clear',
    submitButtonVariant: 'primary',
    cancelButtonVariant: 'secondary',
  };

  ngOnInit(): void {
    // Load employees for dropdown
    this.loadEmployees();
  }

  /**
   * Load employees from backend for dropdown selection
   */
  private loadEmployees(): void {
    this.loadingEmployees.set(true);
    
    this.employeeService.getEmployees({
      pageNumber: 1,
      pageSize: 100, // Load first 100 employees for selection (backend limit: 100)
    }).pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('❌ Error loading employees:', error);
        this.loadingEmployees.set(false);
        this.notificationService.error(
          'Load Failed',
          'Failed to load employees. Please try again.',
          { duration: 5000, persistent: false, autoClose: true }
        );
        return of(null);
      })
    ).subscribe({
      next: (response) => {
        if (response?.data) {
          this.employeeOptions = response.data.map((employee: Employee) => ({
            value: parseInt(employee.id, 10),
            label: `${employee.firstName} ${employee.lastName} (ID: ${employee.id})${employee.employeeNumber ? ` - ${employee.employeeNumber}` : ''}`,
          }));
          
          // Update form config with loaded employee options
          const employeeField = this.formConfig.fields.find(f => f.key === 'employeeId');
          if (employeeField) {
            employeeField.options = this.employeeOptions;
          }
          
          this.loadingEmployees.set(false);
          console.log('✅ Employees loaded:', this.employeeOptions.length);
        } else {
          this.loadingEmployees.set(false);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFormSubmit(data: Record<string, unknown>): void {
    this.loading.set(true);

    // Get employee name for notification
    const selectedEmployee = this.employeeOptions.find(
      e => e.value === data['employeeId']
    );
    const employeeName = selectedEmployee?.label?.split(' (')[0] || 'Unknown';

    // Prepare request data matching backend CreateContractDto
    const createRequest: CreateContractRequest = {
      EmployeeId: data['employeeId'] as number,
      ContractType: data['contractType'] as string,
      StartDate: data['startDate'] as string,
      EndDate: (data['endDate'] as string) || null,
      Status: (data['status'] as string) || 'Active',
      Salary: (data['salary'] as number) || null,
      Notes: (data['notes'] as string) || '',
      RenewalReminderDate: (data['renewalReminderDate'] as string) || null,
    };

    this.contractService.createContract(createRequest).pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        this.loading.set(false);
        this.notificationService.error(
          'Creation Failed',
          error.message || 'Failed to create contract',
          { duration: 5000, persistent: false, autoClose: true }
        );
        return of(null);
      })
    ).subscribe({
      next: (contract) => {
        if (contract) {
          this.loading.set(false);
          this.notificationService.success(
            'Contract Created',
            `Contract for ${employeeName} has been created successfully`,
            { duration: 3000, autoClose: true }
          );
          this.contractCreated.emit();
          this.resetForm();
        }
      }
    });
  }

  onFormCancel(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.formData = {
      employeeId: null,
      contractType: 'Indefinite',
      startDate: new Date().toISOString().split('T')[0],
      endDate: null,
      status: 'Active',
      salary: null,
      notes: '',
      renewalReminderDate: null,
    };
  }
}

