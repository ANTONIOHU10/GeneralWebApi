// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/contracts/add-contract/add-contract.component.ts
import { Component, inject, OnDestroy, OnInit, Output, EventEmitter, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, of } from 'rxjs';
import { takeUntil, catchError, filter, distinctUntilChanged } from 'rxjs/operators';
import {
  BaseFormComponent,
  FormConfig,
  SelectOption,
} from '../../../Shared/components/base';
import { DialogService, NotificationService } from '../../../Shared/services';
import { CONTRACT_TYPES, CONTRACT_STATUSES, CreateContractRequest, ApprovalStepDto } from 'app/contracts/contracts/contract.model';
import { ContractService } from '../../../core/services/contract.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { Employee } from 'app/contracts/employees/employee.model';
import { UserService, UserWithEmployee } from '../../../core/services/user.service';
import { TranslationService } from '@core/services/translation.service';

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
  private userService = inject(UserService);
  private translationService = inject(TranslationService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  @Output() contractCreated = new EventEmitter<void>();

  loading = signal(false);
  loadingEmployees = signal(false);
  loadingUsers = signal(false);

  formData: Record<string, unknown> = {
    employeeId: null,
    contractType: 'Indefinite',
    startDate: new Date().toISOString().split('T')[0],
    endDate: null,
    status: 'Active',
    salary: null,
    notes: '',
    renewalReminderDate: null,
    submitForApproval: false,
    approvalComments: '',
    approvers: [], // Array of user IDs selected as approvers
  };

  // Employee options loaded from backend
  employeeOptions: SelectOption[] = [];
  // User options for approver selection (with employee information)
  approverOptions: SelectOption[] = [];

  formConfig: FormConfig = {
    sections: [],
    layout: { columns: 2, gap: '1.5rem', sectionGap: '2rem', labelPosition: 'top', showSectionDividers: true },
    fields: [],
    submitButtonText: '',
    cancelButtonText: '',
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
    });

    // Load employees for contract employee selection
    this.loadEmployees();
    // Load users for approver selection
    this.loadUsers();
  }

  /**
   * Initialize form config with translations
   */
  private initializeFormConfig(): void {
    const contractInfoSection = this.translationService.translate('contracts.add.sections.contractInfo');
    const approvalSection = this.translationService.translate('contracts.add.sections.approvalSettings');

    this.formConfig = {
      sections: [
        { title: contractInfoSection, description: this.translationService.translate('contracts.add.sections.contractInfoDescription'), order: 0 },
        { title: approvalSection, description: this.translationService.translate('contracts.add.sections.approvalSettingsDescription'), order: 1 },
      ],
      layout: { columns: 2, gap: '1.5rem', sectionGap: '2rem', labelPosition: 'top', showSectionDividers: true },
      fields: [
        { key: 'employeeId', type: 'select', label: this.translationService.translate('contracts.add.fields.employee'), placeholder: this.translationService.translate('contracts.add.fields.employeePlaceholder'), required: true, section: contractInfoSection, order: 0, colSpan: 2, searchable: true, options: this.employeeOptions },
        { key: 'contractType', type: 'select', label: this.translationService.translate('contracts.add.fields.contractType'), placeholder: this.translationService.translate('contracts.add.fields.contractTypePlaceholder'), required: true, section: contractInfoSection, order: 1, colSpan: 1, options: CONTRACT_TYPES.map(type => ({ value: type.value, label: type.label })) as SelectOption[] },
        { key: 'status', type: 'select', label: this.translationService.translate('contracts.add.fields.status'), placeholder: this.translationService.translate('contracts.add.fields.statusPlaceholder'), required: true, section: contractInfoSection, order: 2, colSpan: 1, options: CONTRACT_STATUSES.map(status => ({ value: status.value, label: status.label })) as SelectOption[] },
        { key: 'startDate', type: 'datepicker', label: this.translationService.translate('contracts.add.fields.startDate'), placeholder: this.translationService.translate('contracts.add.fields.startDatePlaceholder'), required: true, section: contractInfoSection, order: 3, colSpan: 1 },
        { key: 'endDate', type: 'datepicker', label: this.translationService.translate('contracts.add.fields.endDate'), placeholder: this.translationService.translate('contracts.add.fields.endDatePlaceholder'), required: false, section: contractInfoSection, order: 4, colSpan: 1 },
        { key: 'salary', type: 'number', label: this.translationService.translate('contracts.add.fields.salary'), placeholder: this.translationService.translate('contracts.add.fields.salaryPlaceholder'), required: false, section: contractInfoSection, order: 5, colSpan: 1, min: 0 },
        { key: 'renewalReminderDate', type: 'datepicker', label: this.translationService.translate('contracts.add.fields.renewalReminder'), placeholder: this.translationService.translate('contracts.add.fields.renewalReminderPlaceholder'), required: false, section: contractInfoSection, order: 6, colSpan: 1 },
        { key: 'notes', type: 'textarea', label: this.translationService.translate('contracts.add.fields.notes'), placeholder: this.translationService.translate('contracts.add.fields.notesPlaceholder'), required: false, section: contractInfoSection, order: 7, colSpan: 2, rows: 4 },
        { key: 'submitForApproval', type: 'checkbox', label: this.translationService.translate('contracts.add.fields.submitForApproval'), placeholder: this.translationService.translate('contracts.add.fields.submitForApprovalPlaceholder'), required: false, section: approvalSection, order: 0, colSpan: 2 },
        { key: 'approvers', type: 'select', label: this.translationService.translate('contracts.add.fields.approvers'), placeholder: this.translationService.translate('contracts.add.fields.approversPlaceholder'), hint: this.translationService.translate('contracts.add.fields.approversHint'), required: false, section: approvalSection, order: 1, colSpan: 2, searchable: true, multiple: true, options: this.approverOptions },
        { key: 'approvalComments', type: 'textarea', label: this.translationService.translate('contracts.add.fields.approvalComments'), placeholder: this.translationService.translate('contracts.add.fields.approvalCommentsPlaceholder'), required: false, section: approvalSection, order: 2, colSpan: 2, rows: 3 },
      ],
      submitButtonText: this.translationService.translate('contracts.add.submitButton'),
      cancelButtonText: this.translationService.translate('common.clear'),
      submitButtonVariant: 'primary',
      cancelButtonVariant: 'secondary',
    };
    this.cdr.markForCheck();
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
          this.translationService.translate('contracts.add.errors.loadEmployeesFailed'),
          this.translationService.translate('contracts.add.errors.loadEmployeesFailedMessage'),
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
            // Update options directly - Angular will detect the change
            employeeField.options = [...this.employeeOptions];
            console.log('🔄 Updated employee options:', this.employeeOptions.length);
          }
          
          // Manually trigger change detection to update the form
          this.cdr.markForCheck();
          
          this.loadingEmployees.set(false);
          console.log('✅ Employees loaded:', this.employeeOptions.length);
        } else {
          this.loadingEmployees.set(false);
        }
      }
    });
  }

  /**
   * Load users from backend for approver selection
   */
  private loadUsers(): void {
    console.log('🔄 Starting to load users for approver selection...');
    this.loadingUsers.set(true);
    
    this.userService.getUsersWithEmployee().pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('❌ Error loading users:', error);
        this.loadingUsers.set(false);
        this.notificationService.error(
          this.translationService.translate('contracts.add.errors.loadUsersFailed'),
          this.translationService.translate('contracts.add.errors.loadUsersFailedMessage'),
          { duration: 5000, persistent: false, autoClose: true }
        );
        return of([]);
      })
    ).subscribe({
      next: (users: UserWithEmployee[]) => {
        console.log('📥 Received users from API:', users.length);
        
        if (users.length === 0) {
          console.warn('⚠️ No users found. Approver selection will be empty.');
          this.loadingUsers.set(false);
          return;
        }
        
        // Build approver options with user and employee information
        this.approverOptions = users.map((user: UserWithEmployee) => {
          // Display format: "Employee Name (Username)" or "Username" if no employee
          const displayName = user.employeeName 
            ? `${user.employeeName} (${user.username})`
            : user.username;
          
          return {
            value: user.userId,
            label: displayName,
          };
        });
        
        console.log('📋 Built approver options:', this.approverOptions.map(opt => opt.label));
        
        // Update form config with loaded user options
        const approverField = this.formConfig.fields.find(f => f.key === 'approvers');
        if (approverField) {
          // Update options directly - Angular will detect the change
          approverField.options = [...this.approverOptions];
          console.log('🔄 Updated approver field options in formConfig:', approverField.options.length, 'options');
        } else {
          console.error('❌ Approver field not found in formConfig!');
        }
        
        // Manually trigger change detection to update the form
        this.cdr.markForCheck();
        
        this.loadingUsers.set(false);
        console.log('✅ Users loaded for approver selection:', this.approverOptions.length, 'users');
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFormSubmit(data: Record<string, unknown>): void {
    this.loading.set(true);

    console.log('📤 Form submit data:', data);

    // Get employee name for notification
    const selectedEmployee = this.employeeOptions.find(
      e => e.value === data['employeeId']
    );
    const employeeName = selectedEmployee?.label?.split(' (')[0] || 'Unknown';

    // Prepare request data matching backend CreateContractDto
    const submitForApproval = data['submitForApproval'] as boolean || false;
    
    // Handle approvers - could be array or single value
    let approvers: number[] = [];
    const approversValue = data['approvers'];
    console.log('👥 Approvers value from form:', approversValue, 'Type:', typeof approversValue);
    
    if (approversValue) {
      if (Array.isArray(approversValue)) {
        approvers = approversValue.map(v => typeof v === 'number' ? v : parseInt(String(v), 10));
      } else if (typeof approversValue === 'number') {
        approvers = [approversValue];
      } else {
        // Try to parse as number
        const parsed = parseInt(String(approversValue), 10);
        if (!isNaN(parsed)) {
          approvers = [parsed];
        }
      }
    }
    
    console.log('✅ Processed approvers array:', approvers);
    console.log('✅ SubmitForApproval:', submitForApproval);
    console.log('✅ Available approver options:', this.approverOptions.length);
    
    // Build approval steps if approvers are selected
    // Note: approvers are User IDs, not Employee IDs
    let approvalSteps: ApprovalStepDto[] | null = null;
    if (submitForApproval && approvers.length > 0) {
      console.log('🔨 Building approval steps for', approvers.length, 'approvers');
      approvalSteps = approvers.map((userId, index) => {
        const approver = this.approverOptions.find(opt => opt.value === userId);
        console.log(`  Step ${index + 1}: UserId=${userId}, Approver=${approver?.label || 'Not found'}`);
        return {
          StepOrder: index + 1,
          StepName: approver ? `Approval by ${approver.label}` : `Approval Step ${index + 1}`,
          ApproverUserId: userId.toString(), // User ID (not Employee ID)
          ApproverUserName: approver?.label || null,
          ApproverRole: null,
        };
      });
      console.log('✅ Built approval steps:', approvalSteps);
    } else {
      console.warn('⚠️ No approval steps built. SubmitForApproval:', submitForApproval, 'Approvers count:', approvers.length);
    }

    const createRequest: CreateContractRequest = {
      EmployeeId: data['employeeId'] as number,
      ContractType: data['contractType'] as string,
      StartDate: data['startDate'] as string,
      EndDate: (data['endDate'] as string) || null,
      Status: (data['status'] as string) || 'Active',
      Salary: (data['salary'] as number) || null,
      Notes: (data['notes'] as string) || '',
      RenewalReminderDate: (data['renewalReminderDate'] as string) || null,
      SubmitForApproval: submitForApproval,
      ApprovalComments: (data['approvalComments'] as string) || null,
      ApprovalSteps: approvalSteps,
    };

    console.log('📤 Final create request:', JSON.stringify(createRequest, null, 2));

    this.contractService.createContract(createRequest).pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        this.loading.set(false);
        this.notificationService.error(
          this.translationService.translate('contracts.add.errors.createFailed'),
          error.message || this.translationService.translate('contracts.add.errors.createFailedMessage'),
          { duration: 5000, persistent: false, autoClose: true }
        );
        return of(null);
      })
    ).subscribe({
      next: (contract) => {
        if (contract) {
          this.loading.set(false);
          this.notificationService.success(
            this.translationService.translate('contracts.add.notifications.createSuccess'),
            this.translationService.translate('contracts.add.notifications.createSuccessMessage', { name: employeeName }),
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
      submitForApproval: false,
      approvalComments: '',
      approvers: [],
    };
  }
}

