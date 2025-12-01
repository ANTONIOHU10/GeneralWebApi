// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/contracts/add-contract/add-contract.component.ts
import { Component, inject, OnDestroy, OnInit, Output, EventEmitter, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, of } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
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
    sections: [
      {
        title: 'Contract Information',
        description: 'Enter contract details',
        order: 0,
      },
      {
        title: 'Approval Settings',
        description: 'Configure contract approval workflow (optional)',
        order: 1,
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
      {
        key: 'submitForApproval',
        type: 'checkbox',
        label: 'Submit for Approval',
        placeholder: 'Automatically submit contract for approval after creation',
        required: false,
        section: 'Approval Settings',
        order: 0,
        colSpan: 2,
      },
      {
        key: 'approvers',
        type: 'select',
        label: 'Approvers',
        placeholder: 'Select specific users as approvers (leave empty to use default role-based workflow)',
        hint: 'Select specific users who will approve this contract. If no users are selected, the system will use the default role-based approval workflow.',
        required: false,
        section: 'Approval Settings',
        order: 1,
        colSpan: 2,
        searchable: true,
        multiple: true,
        options: this.approverOptions,
      },
      {
        key: 'approvalComments',
        type: 'textarea',
        label: 'Approval Comments',
        placeholder: 'Enter comments for approval request (optional)',
        required: false,
        section: 'Approval Settings',
        order: 2,
        colSpan: 2,
        rows: 3,
      },
    ],
    submitButtonText: 'Create Contract',
    cancelButtonText: 'Clear',
    submitButtonVariant: 'primary',
    cancelButtonVariant: 'secondary',
  };

  ngOnInit(): void {
    // Load employees for contract employee selection
    this.loadEmployees();
    // Load users for approver selection
    this.loadUsers();
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
          'Load Failed',
          'Failed to load users. Please try again.',
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
      submitForApproval: false,
      approvalComments: '',
      approvers: [],
    };
  }
}

