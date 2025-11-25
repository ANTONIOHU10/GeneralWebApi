// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/contracts/contract-detail/contract-detail.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, delay, of } from 'rxjs';
import { filter, first, takeUntil } from 'rxjs/operators';
import { Contract, CONTRACT_TYPES, CONTRACT_STATUSES } from 'app/contracts/contracts/contract.model';
import {
  BaseModalComponent,
  BaseFormComponent,
  FormConfig,
  SelectOption,
} from '../../../Shared/components/base';
import { DialogService, NotificationService } from '../../../Shared/services';

/**
 * ContractDetailComponent - Modal component for displaying detailed contract information
 */
@Component({
  selector: 'app-contract-detail',
  standalone: true,
  imports: [
    CommonModule,
    BaseModalComponent,
    BaseFormComponent,
  ],
  templateUrl: './contract-detail.component.html',
  styleUrls: ['./contract-detail.component.scss'],
})
export class ContractDetailComponent implements OnInit, OnChanges {
  private dialogService = inject(DialogService);
  private notificationService = inject(NotificationService);

  @Input() contract: Contract | null = null;
  @Input() isOpen = false;
  @Input() mode: 'edit' | 'view' = 'edit';

  @Output() closeEvent = new EventEmitter<void>();
  @Output() contractUpdated = new EventEmitter<Contract>();

  // Loading state for form (using signal for reactive updates)
  loading = signal(false);

  // Form data
  formData: Record<string, unknown> = {};

  // Mock employee options (in real app, this would come from EmployeeService)
  employeeOptions: SelectOption[] = [
    { value: 1, label: 'John Doe (ID: 1)' },
    { value: 2, label: 'Jane Smith (ID: 2)' },
    { value: 3, label: 'Bob Johnson (ID: 3)' },
    { value: 4, label: 'Alice Williams (ID: 4)' },
    { value: 5, label: 'Charlie Brown (ID: 5)' },
  ];

  // Form configuration
  formConfig: FormConfig = {
    sections: [
      {
        title: 'Contract Information',
        description: 'Contract details',
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
    submitButtonText: 'Save Changes',
    cancelButtonText: 'Cancel',
    submitButtonVariant: 'primary',
    cancelButtonVariant: 'secondary',
  };

  ngOnInit(): void {
    this.updateFormConfigForMode();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['contract'] && this.contract) {
      this.initializeFormData();
    }
    if (changes['mode'] || (changes['contract'] && this.contract)) {
      setTimeout(() => {
        this.updateFormConfigForMode();
      }, 0);
    }
  }

  onClose(): void {
    this.closeEvent.emit();
  }

  onBackdropClick(): void {
    this.onClose();
  }

  private initializeFormData(): void {
    if (!this.contract) return;

    this.formData = {
      employeeId: this.contract.employeeId || null,
      contractType: this.contract.contractType || 'Indefinite',
      status: this.contract.status || 'Active',
      startDate: this.contract.startDate ? this.contract.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
      endDate: this.contract.endDate ? this.contract.endDate.split('T')[0] : null,
      salary: this.contract.salary || null,
      notes: this.contract.notes || '',
      renewalReminderDate: this.contract.renewalReminderDate ? this.contract.renewalReminderDate.split('T')[0] : null,
    };
  }

  private updateFormConfigForMode(): void {
    if (!this.formConfig.fields || this.formConfig.fields.length === 0) {
      return;
    }

    const isReadOnly = this.mode === 'view';

    const updatedFields = this.formConfig.fields.map(field => ({
      ...field,
      readonly: isReadOnly,
      disabled: isReadOnly,
    }));

    this.formConfig = {
      ...this.formConfig,
      fields: updatedFields,
      showButtons: isReadOnly ? false : true,
      buttons: isReadOnly ? [
        {
          label: 'Close',
          type: 'reset',
          variant: 'secondary',
          icon: 'close',
        },
      ] : undefined,
    };
  }

  onFormSubmit(data: Record<string, unknown>): void {
    if (!this.contract) return;

    const employeeName = this.employeeOptions.find(e => e.value === data['employeeId'])?.label?.split(' (')[0] || 'Unknown';

    const confirm$: Observable<boolean> = this.dialogService.confirm({
      title: 'Confirm Update',
      message: `Are you sure you want to update contract for ${employeeName}?`,
      confirmText: 'Update',
      cancelText: 'Cancel',
      confirmVariant: 'primary',
      icon: 'save',
    });

    confirm$.pipe(
      first(),
      filter((confirmed: boolean) => confirmed)
    ).subscribe(() => {
      if (!this.contract) return;

      this.loading.set(true);

      // Simulate API call with mock data
      const updatedContract: Contract = {
        id: this.contract.id,
        employeeId: data['employeeId'] as number,
        employeeName: employeeName,
        contractType: data['contractType'] as string,
        status: data['status'] as string,
        startDate: data['startDate'] as string,
        endDate: data['endDate'] as string | null || null,
        salary: data['salary'] as number | null || null,
        notes: data['notes'] as string || '',
        renewalReminderDate: data['renewalReminderDate'] as string | null || null,
        createdAt: this.contract.createdAt,
        updatedAt: new Date().toISOString(),
      };

      of(updatedContract).pipe(
        delay(1000), // Simulate network delay
        first()
      ).subscribe({
        next: (contract: Contract) => {
          this.loading.set(false);
          this.notificationService.success(
            'Contract Updated',
            `Contract for ${contract.employeeName} has been updated successfully`,
            { duration: 3000, autoClose: true }
          );
          this.contractUpdated.emit(contract);
          this.onClose();
        },
        error: (error) => {
          this.loading.set(false);
          this.notificationService.error(
            'Update Failed',
            error.message || 'Failed to update contract',
            { duration: 5000, persistent: false, autoClose: true }
          );
        }
      });
    });
  }

  onFormCancel(): void {
    this.onClose();
  }
}

