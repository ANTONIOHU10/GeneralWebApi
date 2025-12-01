// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/contract-approvals/contract-approval-detail/contract-approval-detail.component.ts
import { 
  Component, Input, Output, EventEmitter, 
  AfterViewInit, OnChanges, 
  inject, signal, TemplateRef, ViewChild 
} from '@angular/core';
import type { SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { first, filter, catchError, takeUntil } from 'rxjs/operators';
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
  ],
  templateUrl: './contract-approval-detail.component.html',
  styleUrls: ['./contract-approval-detail.component.scss'],
})
export class ContractApprovalDetailComponent implements AfterViewInit, OnChanges {
  private notificationService = inject(NotificationService);
  private contractApprovalService = inject(ContractApprovalService);
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
    this.sections.set([
      {
        title: 'Approval Information',
        fields: [
          { label: 'Approval ID', value: this.approval.id.toString(), type: 'text' },
          { label: 'Contract ID', value: this.approval.contractId.toString(), type: 'text' },
          { label: 'Employee ID', value: this.approval.employeeId.toString(), type: 'text' },
          { label: 'Employee Name', value: this.approval.contractEmployeeName || 'N/A', type: 'text' },
          { label: 'Contract Type', value: this.approval.contractType || 'N/A', type: 'text' },
          { label: 'Status', value: this.approval.status, type: 'badge', badgeVariant: this.getStatusVariant(this.approval.status) },
          { label: 'Progress', value: `${this.approval.currentApprovalLevel}/${this.approval.maxApprovalLevel}`, type: 'text' },
          { label: 'Requested By', value: this.approval.requestedBy, type: 'text' },
          { label: 'Requested At', value: this.approval.requestedAt, type: 'date' },
          ...(this.approval.approvedBy ? [{ label: 'Approved By', value: this.approval.approvedBy, type: 'text' as const }] : []),
          ...(this.approval.approvedAt ? [{ label: 'Approved At', value: this.approval.approvedAt, type: 'date' as const }] : []),
          ...(this.approval.rejectedBy ? [{ label: 'Rejected By', value: this.approval.rejectedBy, type: 'text' as const }] : []),
          ...(this.approval.rejectedAt ? [{ label: 'Rejected At', value: this.approval.rejectedAt, type: 'date' as const }] : []),
          ...(this.approval.rejectionReason ? [{ label: 'Rejection Reason', value: this.approval.rejectionReason, type: 'text' as const }] : []),
        ],
        showDivider: !!this.approval.comments,
      },
      {
        title: 'Approval Steps',
        fields: [
          { label: 'Steps', value: null, type: 'custom' as const, customTemplate: this.stepsTemplate },
        ],
      },
    ]);
  }

  ngAfterViewInit(): void {
    this.updateSections();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['approval'] && this.stepsTemplate) {
      this.updateSections();
    }
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
          'Approve Failed',
          error.message || 'Failed to approve contract',
          { duration: 5000, persistent: false, autoClose: true }
        );
        return of(false);
      })
    ).subscribe({
      next: (success) => {
        this.loading.set(false);
        if (success) {
          this.notificationService.success(
            'Approved',
            `Contract for ${this.approval!.contractEmployeeName || 'this contract'} has been approved`,
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
        'Rejection Reason Required',
        'Please provide a reason for rejection',
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
          'Reject Failed',
          error.message || 'Failed to reject contract',
          { duration: 5000, persistent: false, autoClose: true }
        );
        return of(false);
      })
    ).subscribe({
      next: (success) => {
        this.loading.set(false);
        if (success) {
          this.notificationService.warning(
            'Rejected',
            `Contract for ${this.approval!.contractEmployeeName || 'this contract'} has been rejected`,
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
