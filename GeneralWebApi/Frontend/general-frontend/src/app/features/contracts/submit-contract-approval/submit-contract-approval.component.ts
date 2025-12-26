// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/contracts/submit-contract-approval/submit-contract-approval.component.ts
import { Component, OnInit, OnDestroy, Output, EventEmitter, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, of } from 'rxjs';
import { takeUntil, catchError, filter, distinctUntilChanged } from 'rxjs/operators';
import { BaseFormComponent, FormConfig } from '../../../Shared/components/base/base-form/base-form.component';
import { NotificationService } from '../../../Shared/services';
import { ContractService } from '../../../core/services/contract.service';
import { ContractApprovalService } from '../../../core/services/contract-approval.service';
import { UserService, UserWithEmployee } from '../../../core/services/user.service';
import { TranslationService } from '@core/services/translation.service';
import { Contract } from 'app/contracts/contracts/contract.model';
import { SubmitApprovalRequest, ApprovalStepRequest } from 'app/contracts/contract-approvals/contract-approval.model';
import type { SelectOption } from '../../../Shared/components/base/base-select/base-select.component';

@Component({
  selector: 'app-submit-contract-approval',
  standalone: true,
  imports: [
    CommonModule,
    BaseFormComponent,
  ],
  templateUrl: './submit-contract-approval.component.html',
  styleUrls: ['./submit-contract-approval.component.scss'],
})
export class SubmitContractApprovalComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);
  private contractService = inject(ContractService);
  private contractApprovalService = inject(ContractApprovalService);
  private userService = inject(UserService);
  private translationService = inject(TranslationService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  @Output() approvalSubmitted = new EventEmitter<void>();

  loading = signal(false);
  loadingContracts = signal(false);
  loadingUsers = signal(false);

  contractOptions: SelectOption[] = [];
  approverOptions: SelectOption[] = [];

  formConfig: FormConfig = {
    fields: [],
    submitButtonText: '',
    cancelButtonText: '',
    submitButtonVariant: 'primary',
    cancelButtonVariant: 'secondary',
  };

  formData: Record<string, unknown> = {};

  ngOnInit(): void {
    // Wait for translations to load before initializing form config
    this.translationService.getTranslationsLoaded$().pipe(
      distinctUntilChanged(),
      filter(loaded => loaded),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.initializeFormConfig();
    });

    this.loadContracts();
    this.loadUsers();
  }

  /**
   * Initialize form config with translations
   */
  private initializeFormConfig(): void {
    const contractSection = this.translationService.translate('contracts.submitApproval.sections.contractSelection');
    const approvalSection = this.translationService.translate('contracts.submitApproval.sections.approvalSettings');

    this.formConfig = {
      fields: [
        { key: 'contractId', type: 'select', label: this.translationService.translate('contracts.submitApproval.fields.contract'), placeholder: this.translationService.translate('contracts.submitApproval.fields.contractPlaceholder'), required: true, section: contractSection, order: 1, colSpan: 2, options: this.contractOptions, searchable: true },
        { key: 'approvers', type: 'select', label: this.translationService.translate('contracts.submitApproval.fields.approvers'), placeholder: this.translationService.translate('contracts.submitApproval.fields.approversPlaceholder'), required: true, section: approvalSection, order: 1, colSpan: 2, options: this.approverOptions, multiple: true, searchable: true },
        { key: 'comments', type: 'textarea', label: this.translationService.translate('contracts.submitApproval.fields.comments'), placeholder: this.translationService.translate('contracts.submitApproval.fields.commentsPlaceholder'), required: false, section: approvalSection, order: 2, colSpan: 2, rows: 4 },
      ],
      submitButtonText: this.translationService.translate('contracts.submitApproval.submitButton'),
      cancelButtonText: this.translationService.translate('common.clear'),
      submitButtonVariant: 'primary',
      cancelButtonVariant: 'secondary',
    };
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load contracts from backend for dropdown selection
   */
  private loadContracts(): void {
    this.loadingContracts.set(true);

    this.contractService.getContracts({
      pageNumber: 1,
      pageSize: 100, // Load first 100 contracts
    }).pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('❌ Error loading contracts:', error);
        this.loadingContracts.set(false);
        this.notificationService.error(
          'Load Failed',
          'Failed to load contracts. Please try again.',
          { duration: 5000, persistent: false, autoClose: true }
        );
        return of(null);
      })
    ).subscribe({
      next: (response) => {
        if (response?.data) {
          this.contractOptions = response.data.map((contract: Contract) => ({
            value: contract.id,
            label: `${contract.employeeName || 'Unknown'} - ${contract.contractType} (ID: ${contract.id})`,
          }));

          // Update form config with loaded contract options
          const contractField = this.formConfig.fields.find(f => f.key === 'contractId');
          if (contractField) {
            contractField.options = [...this.contractOptions];
            this.cdr.markForCheck();
          }

          this.loadingContracts.set(false);
          console.log('✅ Contracts loaded:', this.contractOptions.length);
        } else {
          this.loadingContracts.set(false);
        }
      }
    });
  }

  /**
   * Load users from backend for approver selection
   */
  private loadUsers(): void {
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
        if (users.length > 0) {
          this.approverOptions = users.map((user: UserWithEmployee) => ({
            value: user.userId.toString(),
            label: `${user.username}${user.employeeName ? ` (${user.employeeName})` : ''}${user.role ? ` - ${user.role}` : ''}`,
          }));

          // Update form config with loaded user options
          const approverField = this.formConfig.fields.find(f => f.key === 'approvers');
          if (approverField) {
            approverField.options = [...this.approverOptions];
            this.cdr.markForCheck();
          }

          console.log('✅ Users loaded:', this.approverOptions.length);
        }
        this.loadingUsers.set(false);
      }
    });
  }

  onFormSubmit(data: Record<string, unknown>): void {
    this.loading.set(true);

    const contractId = data['contractId'] as number;
    const approvers = (data['approvers'] as string[]) || [];
    const comments = (data['comments'] as string) || null;

    if (!contractId) {
      this.notificationService.error(
        'Validation Error',
        'Please select a contract',
        { duration: 3000, autoClose: true }
      );
      this.loading.set(false);
      return;
    }

    if (!approvers || approvers.length === 0) {
      this.notificationService.error(
        'Validation Error',
        'Please select at least one approver',
        { duration: 3000, autoClose: true }
      );
      this.loading.set(false);
      return;
    }

    // Build approval steps
    const approvalSteps: ApprovalStepRequest[] = approvers.map((userId, index) => {
      const approver = this.approverOptions.find(opt => opt.value === userId);
      return {
        StepOrder: index + 1,
        StepName: approver ? `Approval by ${approver.label}` : `Approval Step ${index + 1}`,
        ApproverUserId: userId,
        ApproverUserName: approver?.label || null,
        ApproverRole: null,
      };
    });

    const request: SubmitApprovalRequest = {
      comments: comments || undefined,
      ApprovalSteps: approvalSteps,
    };

    console.log('📤 Submitting approval for contract:', contractId, request);

    this.contractApprovalService.submitForApproval(contractId, request).pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        this.loading.set(false);
        this.notificationService.error(
          'Submit Failed',
          error.message || 'Failed to submit contract for approval',
          { duration: 5000, persistent: false, autoClose: true }
        );
        return of(null);
      })
    ).subscribe({
      next: (approval) => {
        this.loading.set(false);
        if (approval) {
          this.notificationService.success(
            'Submitted',
            'Contract has been submitted for approval successfully',
            { duration: 3000, autoClose: true }
          );
          // Clear form
          this.formData = {};
          // Emit event to parent
          this.approvalSubmitted.emit();
        }
      }
    });
  }

  onFormCancel(): void {
    this.formData = {};
  }
}














