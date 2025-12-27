// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/contract-approvals/contract-approval-detail/contract-approval-detail.component.ts
import { 
  Component, Input, Output, EventEmitter, 
  AfterViewInit, OnChanges, OnInit, OnDestroy,
  inject, signal, TemplateRef, ViewChild 
} from '@angular/core';
import type { SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { first, filter, catchError, takeUntil, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of, Subject, EMPTY } from 'rxjs';
import {
  BaseDetailComponent,
  BaseBadgeComponent,
  BaseButtonComponent,
  BasePrivatePageContainerComponent,
  BaseCardComponent,
  BaseLoadingComponent,
  BaseErrorComponent,
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
    BasePrivatePageContainerComponent,
    BaseCardComponent,
    BaseLoadingComponent,
    BaseErrorComponent,
    BasePromptDialogComponent,
    TranslatePipe,
  ],
  templateUrl: './contract-approval-detail.component.html',
  styleUrls: ['./contract-approval-detail.component.scss'],
})
export class ContractApprovalDetailComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
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

  // Route mode: approval loaded from route
  approvalFromRoute = signal<ContractApproval | null>(null);
  loadingFromRoute = signal<boolean>(false);
  errorFromRoute = signal<string | null>(null);

  // Modal mode: action loading
  loading = signal(false);
  showApproveDialog = signal(false);
  showRejectDialog = signal(false);

  sections = signal<DetailSection[]>([]);

  // Check if component is in route mode
  get isRouteMode(): boolean {
    return this.approval === null && this.route.snapshot.params['id'] !== undefined;
  }

  // Get current approval (from route or input)
  get currentApproval(): ContractApproval | null {
    return this.isRouteMode ? this.approvalFromRoute() : this.approval;
  }

  ngOnInit(): void {
    // If in route mode, load approval from route
    if (this.isRouteMode) {
      this.route.params.pipe(
        switchMap(params => {
          const id = params['id'];
          if (!id) {
            this.errorFromRoute.set('Approval ID is required');
            this.loadingFromRoute.set(false);
            return EMPTY;
          }
          const approvalId = parseInt(id, 10);
          if (isNaN(approvalId)) {
            this.errorFromRoute.set('Invalid approval ID');
            this.loadingFromRoute.set(false);
            return EMPTY;
          }
          this.loadingFromRoute.set(true);
          this.errorFromRoute.set(null);
          return this.contractApprovalService.getApprovalById(approvalId).pipe(
            catchError((error) => {
              this.errorFromRoute.set(error.message || 'Failed to load approval');
              this.loadingFromRoute.set(false);
              return EMPTY;
            })
          );
        }),
        takeUntil(this.destroy$)
      ).subscribe({
        next: (contractApproval) => {
          this.approvalFromRoute.set(contractApproval);
          this.loadingFromRoute.set(false);
          // Update sections after approval is loaded
          if (this.stepsTemplate) {
            this.updateSections();
          }
        }
      });
    }
  }

  private updateSections(): void {
    const approval = this.currentApproval;
    if (!approval || !this.stepsTemplate) {
      this.sections.set([]);
      return;
    }
    const t = (key: string) => this.translationService.translate(key);
    this.sections.set([
      {
        title: t('contractApprovals.detail.sections.approvalInformation'),
        fields: [
          { label: t('contractApprovals.detail.fields.approvalId'), value: approval.id.toString(), type: 'text' },
          { label: t('contractApprovals.detail.fields.contractId'), value: approval.contractId.toString(), type: 'text' },
          { label: t('contractApprovals.detail.fields.employeeId'), value: approval.employeeId.toString(), type: 'text' },
          { label: t('contractApprovals.detail.fields.employeeName'), value: approval.contractEmployeeName || 'N/A', type: 'text' },
          { label: t('contractApprovals.detail.fields.contractType'), value: approval.contractType || 'N/A', type: 'text' },
          { label: t('contractApprovals.detail.fields.status'), value: approval.status, type: 'badge' as const, badgeVariant: this.getStatusVariant(approval.status) },
          { label: t('contractApprovals.detail.fields.progress'), value: `${approval.currentApprovalLevel}/${approval.maxApprovalLevel}`, type: 'text' },
          { label: t('contractApprovals.detail.fields.requestedBy'), value: approval.requestedBy, type: 'text' },
          { label: t('contractApprovals.detail.fields.requestedAt'), value: approval.requestedAt, type: 'date' },
          ...(approval.approvedBy ? [{ label: t('contractApprovals.detail.fields.approvedBy'), value: approval.approvedBy, type: 'text' as const }] : []),
          ...(approval.approvedAt ? [{ label: t('contractApprovals.detail.fields.approvedAt'), value: approval.approvedAt, type: 'date' as const }] : []),
          ...(approval.rejectedBy ? [{ label: t('contractApprovals.detail.fields.rejectedBy'), value: approval.rejectedBy, type: 'text' as const }] : []),
          ...(approval.rejectedAt ? [{ label: t('contractApprovals.detail.fields.rejectedAt'), value: approval.rejectedAt, type: 'date' as const }] : []),
          ...(approval.rejectionReason ? [{ label: t('contractApprovals.detail.fields.rejectionReason'), value: approval.rejectionReason, type: 'text' as const }] : []),
        ],
        showDivider: !!approval.comments,
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
      if (this.currentApproval && this.stepsTemplate) {
        this.updateSections();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['approval'] && this.stepsTemplate && !this.isRouteMode) {
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
    if (this.isRouteMode) {
      const approval = this.approvalFromRoute();
      const approvalId = approval?.id;
      const detailLabel = this.translationService.translate('breadcrumb.approvalDetail') || 'Approval Details';
      return approvalId ? `${detailLabel} #${approvalId}` : detailLabel;
    }
    return this.translationService.translate('contractApprovals.detail.title');
  }

  /**
   * Go back to approvals list (route mode only)
   */
  goBack(): void {
    this.router.navigate(['/private/approvals']);
  }

  /**
   * Retry loading (route mode only)
   */
  onRetryLoad(): void {
    if (this.isRouteMode) {
      this.ngOnInit(); // Reload data
    }
  }

  /**
   * Get approve dialog config
   */
  getApproveDialogConfig(): PromptDialogConfig {
    const approval = this.currentApproval;
    const employeeName = approval?.contractEmployeeName || 'this contract';
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
    const approval = this.currentApproval;
    const employeeName = approval?.contractEmployeeName || 'this contract';
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
    if (this.isRouteMode) {
      this.goBack();
    } else {
      this.closeEvent.emit();
    }
  }

  onApprove(): void {
    if (!this.currentApproval) return;
    this.showApproveDialog.set(true);
  }

  onReject(): void {
    if (!this.currentApproval) return;
    this.showRejectDialog.set(true);
  }

  onApproveConfirm(comments: string): void {
    const approval = this.currentApproval;
    if (!approval) return;

    this.loading.set(true);
    this.showApproveDialog.set(false);

    const request: ApprovalActionRequest = {
      comments: comments || undefined,
    };

    this.contractApprovalService.approve(approval.id, request).pipe(
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
              name: approval.contractEmployeeName || 'this contract' 
            }),
            { duration: 3000, autoClose: true }
          );
          this.approvalUpdated.emit();
          // Reload data if in route mode
          if (this.isRouteMode) {
            this.ngOnInit();
          }
        }
      }
    });
  }

  onRejectConfirm(reason: string): void {
    const approval = this.currentApproval;
    if (!approval) return;

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

    this.contractApprovalService.reject(approval.id, request).pipe(
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
              name: approval.contractEmployeeName || 'this contract' 
            }),
            { duration: 3000, autoClose: true }
          );
          this.approvalUpdated.emit();
          // Reload data if in route mode
          if (this.isRouteMode) {
            this.ngOnInit();
          }
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

  formatDate(dateString: string | number | null | undefined): string {
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
