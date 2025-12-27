// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/contract-approvals/contract-approval-detail/contract-approval-detail.component.ts
import { 
  Component, Input, Output, EventEmitter, 
  AfterViewInit, OnChanges, 
  inject, signal, TemplateRef, ViewChild 
} from '@angular/core';
import type { SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { first, filter, catchError, takeUntil, distinctUntilChanged } from 'rxjs/operators';
import { of, Subject } from 'rxjs';
import {
  BaseDetailComponent,
  BaseBadgeComponent,
  BaseButtonComponent,
  DetailSection,
  BadgeVariant,
} from '../../../Shared/components/base';
import { BasePromptDialogComponent, PromptDialogConfig } from '../../../Shared/components/base/base-prompt-dialog/base-prompt-dialog.component';
import { NotificationService } from '../../../Shared/services';
import { TranslationService } from '@core/services/translation.service';
import { TranslatePipe } from '@core/pipes/translate.pipe';
import { ContractApproval, ApprovalActionRequest, RejectionActionRequest } from 'app/contracts/contract-approvals/contract-approval.model';
import { ContractApprovalService } from '../../../core/services/contract-approval.service';

@Component({
  selector: 'app-contract-approval-detail',
  standalone: true,
  imports: [
    CommonModule,
    BaseDetailComponent,
    BaseBadgeComponent,
    BaseButtonComponent,
    BasePromptDialogComponent,
    TranslatePipe,
  ],
  templateUrl: './contract-approval-detail.component.html',
  styleUrls: ['./contract-approval-detail.component.scss'],
})
export class ContractApprovalDetailComponent implements AfterViewInit, OnChanges {
  private notificationService = inject(NotificationService);
  private contractApprovalService = inject(ContractApprovalService);
  private translationService = inject(TranslationService);
  private destroy$ = new Subject<void>();

  @Input() approval: ContractApproval | null = null;
  @Input() isOpen = false;
  @Output() closeEvent = new EventEmitter<void>();
  @Output() approvalUpdated = new EventEmitter<void>();

  @ViewChild('stepsTemplate') stepsTemplate!: TemplateRef<any>;
  @ViewChild('actionsTemplate') actionsTemplate!: TemplateRef<any>;

  loading = signal(false);
  showApproveDialog = signal(false);
  showRejectDialog = signal(false);

  sections = signal<DetailSection[]>([]);

  private updateSections(): void {
    if (!this.approval || !this.stepsTemplate) {
      this.sections.set([]);
      return;
    }
    const t = (key: string) => this.translationService.translate(key);
    this.sections.set([
      {
        title: t('contractApprovals.detail.sections.approvalInformation'),
        fields: [
          { label: t('contractApprovals.detail.fields.approvalId'), value: this.approval.id.toString(), type: 'text' },
          { label: t('contractApprovals.detail.fields.contractId'), value: this.approval.contractId.toString(), type: 'text' },
          { label: t('contractApprovals.detail.fields.employeeId'), value: this.approval.employeeId.toString(), type: 'text' },
          { label: t('contractApprovals.detail.fields.employeeName'), value: this.approval.contractEmployeeName || 'N/A', type: 'text' },
          { label: t('contractApprovals.detail.fields.contractType'), value: this.approval.contractType || 'N/A', type: 'text' },
          { label: t('contractApprovals.detail.fields.status'), value: this.approval.status, type: 'badge' as const, badgeVariant: this.getStatusVariant(this.approval.status) },
          { label: t('contractApprovals.detail.fields.progress'), value: `${this.approval.currentApprovalLevel}/${this.approval.maxApprovalLevel}`, type: 'text' },
          { label: t('contractApprovals.detail.fields.requestedBy'), value: this.approval.requestedBy, type: 'text' },
          { label: t('contractApprovals.detail.fields.requestedAt'), value: this.approval.requestedAt, type: 'date' },
          ...(this.approval.approvedBy ? [{ label: t('contractApprovals.detail.fields.approvedBy'), value: this.approval.approvedBy, type: 'text' as const }] : []),
          ...(this.approval.approvedAt ? [{ label: t('contractApprovals.detail.fields.approvedAt'), value: this.approval.approvedAt, type: 'date' as const }] : []),
          ...(this.approval.rejectedBy ? [{ label: t('contractApprovals.detail.fields.rejectedBy'), value: this.approval.rejectedBy, type: 'text' as const }] : []),
          ...(this.approval.rejectedAt ? [{ label: t('contractApprovals.detail.fields.rejectedAt'), value: this.approval.rejectedAt, type: 'date' as const }] : []),
          ...(this.approval.rejectionReason ? [{ label: t('contractApprovals.detail.fields.rejectionReason'), value: this.approval.rejectionReason, type: 'text' as const }] : []),
        ],
        showDivider: !!this.approval.comments,
      },
      {
        title: t('contractApprovals.detail.sections.approvalSteps'),
        fields: [
          { label: t('contractApprovals.detail.fields.steps'), value: null, type: 'custom' as const, customTemplate: this.stepsTemplate },
        ],
      },
    ]);
  }

  ngAfterViewInit(): void {
    // Wait for translations to load before updating sections
    this.translationService.getTranslationsLoaded$().pipe(
      distinctUntilChanged(),
      filter(loaded => loaded),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.updateSections();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['approval'] && this.stepsTemplate) {
      // Wait for translations to load before updating sections
      this.translationService.getTranslationsLoaded$().pipe(
        distinctUntilChanged(),
        filter(loaded => loaded),
        takeUntil(this.destroy$)
      ).subscribe(() => {
        this.updateSections();
      });
    }
  }

  /**
   * Get modal title
   */
  getModalTitle(): string {
    return this.translationService.translate('contractApprovals.detail.title');
  }

  /**
   * Get approve dialog config
   */
  getApproveDialogConfig(): PromptDialogConfig {
    const employeeName = this.approval?.contractEmployeeName || 'this contract';
    return {
      title: this.translationService.translate('contractApprovals.detail.approveDialog.title'),
      message: this.translationService.translate('contractApprovals.detail.approveDialog.message', { name: employeeName }),
      label: this.translationService.translate('contractApprovals.detail.approveDialog.label'),
      placeholder: this.translationService.translate('contractApprovals.detail.approveDialog.placeholder'),
      confirmText: this.translationService.translate('contractApprovals.detail.approveDialog.confirmText'),
      cancelText: this.translationService.translate('contractApprovals.detail.approveDialog.cancelText'),
      confirmVariant: 'primary',
      icon: 'check',
      required: false,
      maxLength: 500,
      rows: 4,
    };
  }

  /**
   * Get reject dialog config
   */
  getRejectDialogConfig(): PromptDialogConfig {
    const employeeName = this.approval?.contractEmployeeName || 'this contract';
    return {
      title: this.translationService.translate('contractApprovals.detail.rejectDialog.title'),
      message: this.translationService.translate('contractApprovals.detail.rejectDialog.message', { name: employeeName }),
      label: this.translationService.translate('contractApprovals.detail.rejectDialog.label'),
      placeholder: this.translationService.translate('contractApprovals.detail.rejectDialog.placeholder'),
      confirmText: this.translationService.translate('contractApprovals.detail.rejectDialog.confirmText'),
      cancelText: this.translationService.translate('contractApprovals.detail.rejectDialog.cancelText'),
      confirmVariant: 'danger',
      icon: 'close',
      required: true,
      maxLength: 500,
      rows: 4,
    };
  }

  getStatusVariant(status: string): BadgeVariant {
    return status === 'Pending' ? 'warning' : status === 'Approved' ? 'success' : status === 'Rejected' ? 'danger' : 'secondary';
  }

  getStepStatusVariant(status: string): BadgeVariant {
    return status === 'Pending' ? 'warning' : status === 'Approved' ? 'success' : 'danger';
  }

  onClose(): void {
    this.closeEvent.emit();
  }

  onApprove(): void {
    if (!this.approval) return;
    this.showApproveDialog.set(true);
  }

  onReject(): void {
    if (!this.approval) return;
    this.showRejectDialog.set(true);
  }

  onApproveConfirm(comments: string): void {
    if (!this.approval) return;

    this.loading.set(true);
    this.showApproveDialog.set(false);

    const request: ApprovalActionRequest = {
      comments: comments || undefined,
    };

    this.contractApprovalService.approve(this.approval.id, request).pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        this.loading.set(false);
        this.notificationService.error(
          this.translationService.translate('contractApprovals.detail.notifications.approveFailed'),
          error.message || this.translationService.translate('contractApprovals.detail.notifications.approveFailedMessage'),
          { duration: 5000, persistent: false, autoClose: true }
        );
        return of(false);
      })
    ).subscribe({
      next: (success) => {
        this.loading.set(false);
        if (success) {
          this.notificationService.success(
            this.translationService.translate('contractApprovals.detail.notifications.approveSuccess'),
            this.translationService.translate('contractApprovals.detail.notifications.approveSuccessMessage', { 
              name: this.approval!.contractEmployeeName || 'this contract' 
            }),
            { duration: 3000, autoClose: true }
          );
          this.approvalUpdated.emit();
        }
      }
    });
  }

  onRejectConfirm(reason: string): void {
    if (!this.approval) return;

    if (!reason || !reason.trim()) {
      this.notificationService.error(
        this.translationService.translate('contractApprovals.detail.notifications.rejectionReasonRequired'),
        this.translationService.translate('contractApprovals.detail.notifications.rejectionReasonRequiredMessage'),
        { duration: 3000, autoClose: true }
      );
      return;
    }

    this.loading.set(true);
    this.showRejectDialog.set(false);

    const request: RejectionActionRequest = {
      reason: reason.trim(),
    };

    this.contractApprovalService.reject(this.approval.id, request).pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        this.loading.set(false);
        this.notificationService.error(
          this.translationService.translate('contractApprovals.detail.notifications.rejectFailed'),
          error.message || this.translationService.translate('contractApprovals.detail.notifications.rejectFailedMessage'),
          { duration: 5000, persistent: false, autoClose: true }
        );
        return of(false);
      })
    ).subscribe({
      next: (success) => {
        this.loading.set(false);
        if (success) {
          this.notificationService.warning(
            this.translationService.translate('contractApprovals.detail.notifications.rejectSuccess'),
            this.translationService.translate('contractApprovals.detail.notifications.rejectSuccessMessage', { 
              name: this.approval!.contractEmployeeName || 'this contract' 
            }),
            { duration: 3000, autoClose: true }
          );
          this.approvalUpdated.emit();
        }
      }
    });
  }

  onApproveDialogClose(): void {
    this.showApproveDialog.set(false);
  }

  onRejectDialogClose(): void {
    this.showRejectDialog.set(false);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
