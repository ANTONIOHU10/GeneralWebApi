// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/contracts/add-contract/add-contract.component.ts
import { Component, inject, OnDestroy, OnInit, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, delay, of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  BaseFormComponent,
  FormConfig,
  SelectOption,
} from '../../../Shared/components/base';
import { DialogService, NotificationService } from '../../../Shared/services';
import { Contract, CONTRACT_TYPES, CONTRACT_STATUSES } from 'app/contracts/contracts/contract.model';

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
  private destroy$ = new Subject<void>();

  @Output() contractCreated = new EventEmitter<void>();

  loading = signal(false);

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

  // Mock employee options (in real app, this would come from EmployeeService)
  employeeOptions: SelectOption[] = [
    { value: 1, label: 'John Doe (ID: 1)' },
    { value: 2, label: 'Jane Smith (ID: 2)' },
    { value: 3, label: 'Bob Johnson (ID: 3)' },
    { value: 4, label: 'Alice Williams (ID: 4)' },
    { value: 5, label: 'Charlie Brown (ID: 5)' },
  ];

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
    // Component initialization
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFormSubmit(data: Record<string, unknown>): void {
    this.loading.set(true);

    // Simulate API call with mock data
    of({
      id: Date.now().toString(),
      employeeId: data['employeeId'] as number,
      employeeName: this.employeeOptions.find(e => e.value === data['employeeId'])?.label?.split(' (')[0] || 'Unknown',
      contractType: data['contractType'] as string,
      startDate: data['startDate'] as string,
      endDate: data['endDate'] as string | null || null,
      status: data['status'] as string,
      salary: data['salary'] as number | null || null,
      notes: data['notes'] as string || '',
      renewalReminderDate: data['renewalReminderDate'] as string | null || null,
      createdAt: new Date().toISOString(),
      updatedAt: null,
    } as Contract).pipe(
      delay(1000), // Simulate network delay
      takeUntil(this.destroy$)
    ).subscribe({
      next: (contract: Contract) => {
        this.loading.set(false);
        this.notificationService.success(
          'Contract Created',
          `Contract for ${contract.employeeName} has been created successfully`,
          { duration: 3000, autoClose: true }
        );
        this.contractCreated.emit();
        this.resetForm();
      },
      error: (error) => {
        this.loading.set(false);
        this.notificationService.error(
          'Creation Failed',
          error.message || 'Failed to create contract',
          { duration: 5000, persistent: false, autoClose: true }
        );
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

