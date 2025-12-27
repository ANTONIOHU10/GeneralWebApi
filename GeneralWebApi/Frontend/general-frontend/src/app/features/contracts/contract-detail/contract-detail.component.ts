// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/contracts/contract-detail/contract-detail.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, OnDestroy, SimpleChanges, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, delay, of, Subject } from 'rxjs';
import { filter, first, takeUntil, catchError, distinctUntilChanged } from 'rxjs/operators';
import { Contract, CONTRACT_TYPES, CONTRACT_STATUSES } from 'app/contracts/contracts/contract.model';
import {
  BaseModalComponent,
  BaseFormComponent,
  BaseBadgeComponent,
  FormConfig,
  SelectOption,
} from '../../../Shared/components/base';
import { TranslatePipe } from '@core/pipes/translate.pipe';
import { TranslationService } from '@core/services/translation.service';
import { DialogService, NotificationService } from '../../../Shared/services';
import { ContractApprovalService } from '../../../core/services/contract-approval.service';
import { ContractApprovalStep } from 'app/contracts/contract-approvals/contract-approval.model';

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
    BaseBadgeComponent,
    TranslatePipe,
  ],
  templateUrl: './contract-detail.component.html',
  styleUrls: ['./contract-detail.component.scss'],
})
export class ContractDetailComponent implements OnInit, OnChanges, OnDestroy {
  private dialogService = inject(DialogService);
  private notificationService = inject(NotificationService);
  private contractApprovalService = inject(ContractApprovalService);
  private translationService = inject(TranslationService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  @Input() contract: Contract | null = null;
  @Input() isOpen = false;
  @Input() mode: 'edit' | 'view' = 'edit';

  @Output() closeEvent = new EventEmitter<void>();
  @Output() contractUpdated = new EventEmitter<Contract>();

  // Loading state for form (using signal for reactive updates)
  loading = signal(false);
  
  // Approval information
  approvalSteps = signal<ContractApprovalStep[]>([]);
  loadingApproval = signal(false);

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

  // Form configuration - will be initialized with translations
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
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['contract'] && this.contract) {
      this.initializeFormData();
      // Load approval information when contract changes
      this.loadApprovalHistory();
    }
    if (changes['mode'] || (changes['contract'] && this.contract)) {
      setTimeout(() => {
        this.updateFormConfigForMode();
      }, 0);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onClose(): void {
    this.closeEvent.emit();
  }

  onBackdropClick(): void {
    this.onClose();
  }

  /**
   * Get modal title based on mode
   */
  getModalTitle(): string {
    if (this.mode === 'edit') {
      return this.translationService.translate('contracts.detail.title.edit');
    }
    return this.translationService.translate('contracts.detail.title.view');
  }

  /**
   * Initialize form config with translations
   */
  private initializeFormConfig(): void {
    const t = (key: string) => this.translationService.translate(key);
    
    // Get section title
    const contractInfoSection = t('contracts.detail.sections.contractInformation');

    this.formConfig = {
      sections: [
        {
          title: contractInfoSection,
          description: t('contracts.detail.sections.contractInformationDescription'),
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
          label: t('contracts.detail.fields.employee'),
          placeholder: t('contracts.detail.fields.employeePlaceholder'),
          required: true,
          section: contractInfoSection,
          order: 0,
          colSpan: 2,
          searchable: true,
          options: this.employeeOptions,
        },
        {
          key: 'contractType',
          type: 'select',
          label: t('contracts.detail.fields.contractType'),
          placeholder: t('contracts.detail.fields.contractTypePlaceholder'),
          required: true,
          section: contractInfoSection,
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
          label: t('contracts.detail.fields.status'),
          placeholder: t('contracts.detail.fields.statusPlaceholder'),
          required: true,
          section: contractInfoSection,
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
          label: t('contracts.detail.fields.startDate'),
          placeholder: t('contracts.detail.fields.startDatePlaceholder'),
          required: true,
          section: contractInfoSection,
          order: 3,
          colSpan: 1,
        },
        {
          key: 'endDate',
          type: 'datepicker',
          label: t('contracts.detail.fields.endDate'),
          placeholder: t('contracts.detail.fields.endDatePlaceholder'),
          required: false,
          section: contractInfoSection,
          order: 4,
          colSpan: 1,
        },
        {
          key: 'salary',
          type: 'number',
          label: t('contracts.detail.fields.salary'),
          placeholder: t('contracts.detail.fields.salaryPlaceholder'),
          required: false,
          section: contractInfoSection,
          order: 5,
          colSpan: 1,
          min: 0,
        },
        {
          key: 'renewalReminderDate',
          type: 'datepicker',
          label: t('contracts.detail.fields.renewalReminderDate'),
          placeholder: t('contracts.detail.fields.renewalReminderDatePlaceholder'),
          required: false,
          section: contractInfoSection,
          order: 6,
          colSpan: 1,
        },
        {
          key: 'notes',
          type: 'textarea',
          label: t('contracts.detail.fields.notes'),
          placeholder: t('contracts.detail.fields.notesPlaceholder'),
          required: false,
          section: contractInfoSection,
          order: 7,
          colSpan: 2,
          rows: 4,
        },
      ],
      submitButtonText: t('contracts.detail.buttons.saveChanges'),
      cancelButtonText: t('contracts.detail.buttons.cancel'),
      submitButtonVariant: 'primary',
      cancelButtonVariant: 'secondary',
    };
    this.cdr.markForCheck();
  }

  private initializeFormData(): void {
    if (!this.contract) return;

    // In view mode, show employee name instead of ID
    const employeeDisplayValue = this.mode === 'view' && this.contract.employeeName
      ? this.contract.employeeName
      : this.contract.employeeId || null;

    this.formData = {
      employeeId: employeeDisplayValue,
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

    const updatedFields = this.formConfig.fields.map(field => {
      // In view mode, change employeeId field from select to text to display employee name
      if (field.key === 'employeeId' && isReadOnly) {
        return {
          ...field,
          type: 'input' as const,
          readonly: true,
          disabled: true,
          placeholder: this.translationService.translate('contracts.detail.fields.employeeName'),
        };
      }

      return {
        ...field,
        readonly: isReadOnly,
        disabled: isReadOnly,
      };
    });

    this.formConfig = {
      ...this.formConfig,
      fields: updatedFields,
      showButtons: isReadOnly ? false : true,
      buttons: isReadOnly ? [
        {
          label: this.translationService.translate('contracts.detail.buttons.close'),
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
      title: this.translationService.translate('contracts.detail.confirm.title'),
      message: this.translationService.translate('contracts.detail.confirm.message', { name: employeeName }),
      confirmText: this.translationService.translate('contracts.detail.confirm.confirmText'),
      cancelText: this.translationService.translate('contracts.detail.confirm.cancelText'),
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
          const employeeName = contract.employeeName || 'Unknown';
          this.notificationService.success(
            this.translationService.translate('contracts.detail.notifications.updateSuccess'),
            this.translationService.translate('contracts.detail.notifications.updateSuccessMessage', { name: employeeName }),
            { duration: 3000, autoClose: true }
          );
          this.contractUpdated.emit(contract);
          this.onClose();
        },
        error: (error) => {
          this.loading.set(false);
          this.notificationService.error(
            this.translationService.translate('contracts.detail.notifications.updateFailed'),
            error.message || this.translationService.translate('contracts.detail.notifications.updateFailedMessage'),
            { duration: 5000, persistent: false, autoClose: true }
          );
        }
      });
    });
  }

  onFormCancel(): void {
    this.onClose();
  }

  /**
   * Load approval history for the current contract
   */
  private loadApprovalHistory(): void {
    if (!this.contract || !this.contract.id) {
      this.approvalSteps.set([]);
      return;
    }

    this.loadingApproval.set(true);
    const contractId = parseInt(this.contract.id, 10);

    this.contractApprovalService.getApprovalHistory(contractId).pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('❌ Error loading approval history:', error);
        this.loadingApproval.set(false);
        // Don't show error notification for missing approval (contract might not have approval yet)
        if (error.message && !error.message.includes('not found')) {
          this.notificationService.error(
            this.translationService.translate('contracts.detail.notifications.loadFailed'),
            this.translationService.translate('contracts.detail.notifications.loadFailedMessage'),
            { duration: 3000, persistent: false, autoClose: true }
          );
        }
        return of([]);
      })
    ).subscribe({
      next: (steps: ContractApprovalStep[]) => {
        this.approvalSteps.set(steps);
        this.loadingApproval.set(false);
        console.log('✅ Approval history loaded:', steps.length, 'steps');
      }
    });
  }

  /**
   * Get status badge variant for approval step
   */
  getApprovalStatusVariant(status: string): 'success' | 'warning' | 'danger' | 'secondary' {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  /**
   * Format date for display
   */
  formatDate(date: string | null | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  }
}

