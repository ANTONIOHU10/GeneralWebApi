// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/contract-approvals/contract-approval-detail/contract-approval-detail.component.ts
import { 
  Component, Input, Output, EventEmitter, 
  AfterViewInit, OnChanges, 
  inject, signal, TemplateRef, ViewChild 
} from '@angular/core';
import type { SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { delay, of } from 'rxjs';
import { first, filter } from 'rxjs/operators';
import {
  BaseDetailComponent,
  BaseBadgeComponent,
  BaseButtonComponent,
  DetailSection,
  BadgeVariant,
} from '../../../Shared/components/base';
import { NotificationService, DialogService } from '../../../Shared/services';
import { ContractApproval } from 'app/contracts/contract-approvals/contract-approval.model';

@Component({
  selector: 'app-contract-approval-detail',
  standalone: true,
  imports: [
    CommonModule,
    BaseDetailComponent,
    BaseBadgeComponent,
    BaseButtonComponent,
  ],
  templateUrl: './contract-approval-detail.component.html',
  styleUrls: ['./contract-approval-detail.component.scss'],
})
export class ContractApprovalDetailComponent implements AfterViewInit, OnChanges {
  private notificationService = inject(NotificationService);
  private dialogService = inject(DialogService);

  @Input() approval: ContractApproval | null = null;
  @Input() isOpen = false;
  @Output() closeEvent = new EventEmitter<void>();
  @Output() approvalUpdated = new EventEmitter<void>();

  @ViewChild('stepsTemplate') stepsTemplate!: TemplateRef<any>;
  @ViewChild('actionsTemplate') actionsTemplate!: TemplateRef<any>;

  loading = signal(false);

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
          { label: 'Employee', value: this.approval.contractEmployeeName, type: 'text' },
          { label: 'Contract Type', value: this.approval.contractType, type: 'text' },
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

    this.dialogService.confirm({
      title: 'Approve Contract',
      message: `Approve contract for ${this.approval.contractEmployeeName}?`,
      confirmText: 'Approve',
      cancelText: 'Cancel',
      confirmVariant: 'primary',
      icon: 'check',
    }).pipe(first(), filter(c => c)).subscribe(() => {
      this.loading.set(true);
      of(true).pipe(delay(500), first()).subscribe(() => {
        this.loading.set(false);
        this.notificationService.success('Approved', `Contract for ${this.approval!.contractEmployeeName} has been approved`, { duration: 3000 });
        this.approvalUpdated.emit();
      });
    });
  }

  onReject(): void {
    if (!this.approval) return;

    this.dialogService.confirm({
      title: 'Reject Contract',
      message: `Reject contract for ${this.approval.contractEmployeeName}?`,
      confirmText: 'Reject',
      cancelText: 'Cancel',
      confirmVariant: 'danger',
      icon: 'close',
    }).pipe(first(), filter(c => c)).subscribe(() => {
      this.loading.set(true);
      of(true).pipe(delay(500), first()).subscribe(() => {
        this.loading.set(false);
        this.notificationService.warning('Rejected', `Contract for ${this.approval!.contractEmployeeName} has been rejected`, { duration: 3000 });
        this.approvalUpdated.emit();
      });
    });
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
