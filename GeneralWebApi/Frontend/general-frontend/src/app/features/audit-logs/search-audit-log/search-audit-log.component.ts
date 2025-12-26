// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/audit-logs/search-audit-log/search-audit-log.component.ts
import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { first, catchError, takeUntil, filter, distinctUntilChanged } from 'rxjs/operators';
import {
  BaseCardComponent,
  BaseAsyncStateComponent,
  BaseFormComponent,
  BaseTableComponent,
  BaseBadgeComponent,
  SelectOption,
  FormConfig,
  TableColumn,
  TableAction,
  BadgeVariant,
} from '../../../Shared/components/base';
import { NotificationService } from '../../../Shared/services';
import { TranslationService } from '@core/services/translation.service';
import { TranslatePipe } from '@core/pipes/translate.pipe';
import { AuditLog, AUDIT_LOG_ACTIONS, AUDIT_LOG_SEVERITIES, AUDIT_LOG_MODULES, AUDIT_LOG_ENTITY_TYPES } from '../../../audit-logs/audit-log.model';
import { AuditLogDetailComponent } from '../audit-log-detail/audit-log-detail.component';
import { AuditLogService, BackendAuditLog, AuditLogSearch } from '../../../core/services/audit-log.service';

@Component({
  selector: 'app-search-audit-log',
  standalone: true,
  imports: [
    CommonModule,
    AuditLogDetailComponent,
    BaseCardComponent,
    BaseAsyncStateComponent,
    BaseFormComponent,
    BaseTableComponent,
    BaseBadgeComponent,
    TranslatePipe,
  ],
  templateUrl: './search-audit-log.component.html',
  styleUrls: ['./search-audit-log.component.scss'],
})
export class SearchAuditLogComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);
  private auditLogService = inject(AuditLogService);
  private translationService = inject(TranslationService);
  private destroy$ = new Subject<void>();

  allLogs = signal<AuditLog[]>([]);
  loading$ = new BehaviorSubject<boolean>(false);
  logsData$ = new BehaviorSubject<AuditLog[] | null>(null);

  selectedLog: AuditLog | null = null;
  isDetailModalOpen = false;

  searchFilters = signal<Record<string, unknown>>({
    entityType: null,
    action: null,
    module: null,
    severity: null,
    userId: '',
    startDate: null,
    endDate: null,
  });

  searchFormConfig: FormConfig = {
    sections: [
      {
        title: 'Search Filters',
        description: 'Filter audit logs by various criteria',
        order: 0,
      },
    ],
    layout: {
      columns: 3,
      gap: '1rem',
      sectionGap: '1.5rem',
      labelPosition: 'top',
      showSectionDividers: false,
    },
    fields: [
      {
        key: 'entityType',
        type: 'select',
        label: 'Entity Type',
        placeholder: 'All Types',
        required: false,
        section: 'Search Filters',
        order: 0,
        colSpan: 1,
        options: [{ value: null, label: 'All Types' }, ...AUDIT_LOG_ENTITY_TYPES.map(t => ({ value: t, label: t }))] as SelectOption[],
      },
      {
        key: 'action',
        type: 'select',
        label: 'Action',
        placeholder: 'All Actions',
        required: false,
        section: 'Search Filters',
        order: 1,
        colSpan: 1,
        options: [{ value: null, label: 'All Actions' }, ...AUDIT_LOG_ACTIONS.map(a => ({ value: a, label: a }))] as SelectOption[],
      },
      {
        key: 'module',
        type: 'select',
        label: 'Module',
        placeholder: 'All Modules',
        required: false,
        section: 'Search Filters',
        order: 2,
        colSpan: 1,
        options: [{ value: null, label: 'All Modules' }, ...AUDIT_LOG_MODULES.map(m => ({ value: m, label: m }))] as SelectOption[],
      },
      {
        key: 'severity',
        type: 'select',
        label: 'Severity',
        placeholder: 'All Severities',
        required: false,
        section: 'Search Filters',
        order: 3,
        colSpan: 1,
        options: [{ value: null, label: 'All Severities' }, ...AUDIT_LOG_SEVERITIES.map(s => ({ value: s, label: s }))] as SelectOption[],
      },
      {
        key: 'userId',
        type: 'input',
        label: 'User ID',
        placeholder: 'Enter user ID',
        required: false,
        section: 'Search Filters',
        order: 4,
        colSpan: 1,
        inputType: 'text',
      },
      {
        key: 'startDate',
        type: 'datepicker',
        label: 'Start Date',
        placeholder: 'Select start date',
        required: false,
        section: 'Search Filters',
        order: 5,
        colSpan: 1,
      },
      {
        key: 'endDate',
        type: 'datepicker',
        label: 'End Date',
        placeholder: 'Select end date',
        required: false,
        section: 'Search Filters',
        order: 6,
        colSpan: 1,
      },
    ],
    submitButtonText: 'Search',
    cancelButtonText: 'Reset',
    submitButtonVariant: 'primary',
    cancelButtonVariant: 'secondary',
  };

  tableColumns: TableColumn[] = [
    { key: 'timestamp', label: 'Time', sortable: true, type: 'date', width: '150px' },
    { key: 'module', label: 'Module', sortable: true, width: '120px' },
    { key: 'action', label: 'Action', sortable: true, width: '100px' },
    { key: 'entityType', label: 'Entity', sortable: true, width: '100px' },
    { key: 'userName', label: 'User', sortable: true, width: '150px' },
    { key: 'description', label: 'Description', sortable: true, width: '200px' },
    { key: 'severity', label: 'Severity', sortable: true, width: '100px' },
  ];

  tableActions: TableAction[] = [
    { label: 'View', icon: 'visibility', variant: 'ghost', showLabel: false, onClick: (item) => this.onView(item as AuditLog) },
  ];

  ngOnInit(): void {
    // Wait for translations to load before initializing form config
    this.translationService.getTranslationsLoaded$().pipe(
      distinctUntilChanged(),
      filter(loaded => loaded),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.initializeFormConfig();
    });

    this.searchLogs();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize form config with translations
   */
  private initializeFormConfig(): void {
    const sectionTitle = this.translationService.translate('auditLogs.search.filtersSection');
    this.searchFormConfig.sections = [
      { title: sectionTitle || 'Search Filters', description: this.translationService.translate('auditLogs.search.filtersDescription') || 'Filter audit logs by various criteria', order: 0 }
    ];
    this.searchFormConfig.submitButtonText = this.translationService.translate('common.search');
    this.searchFormConfig.cancelButtonText = this.translationService.translate('common.reset');
    
    // Update field sections
    this.searchFormConfig.fields.forEach(field => {
      field.section = sectionTitle || 'Search Filters';
    });
  }

  searchLogs(): void {
    this.loading$.next(true);

    const filters = this.searchFilters();
    const search: AuditLogSearch = {
      entityType: (filters['entityType'] as string) || undefined,
      action: (filters['action'] as string) || undefined,
      category: (filters['module'] as string) || undefined,
      severity: (filters['severity'] as string) || undefined,
      userId: (filters['userId'] as string)?.trim() || undefined,
      startDate: filters['startDate']
        ? new Date(filters['startDate'] as string).toISOString()
        : undefined,
      endDate: filters['endDate']
        ? new Date(filters['endDate'] as string).toISOString()
        : undefined,
      pageNumber: 1,
      pageSize: 100,
    };

    this.auditLogService.getAuditLogs(search).pipe(
      first(),
      catchError(err => {
        const errorMessage = err.message || 'Failed to search audit logs';
        this.loading$.next(false);
        this.allLogs.set([]);
        this.logsData$.next([]);
        this.notificationService.error('Search Failed', errorMessage, { duration: 5000 });
        return of({ items: [] as BackendAuditLog[], totalCount: 0, pageNumber: 1, pageSize: 100 });
      })
    ).subscribe(result => {
      const backendLogs = result.items || [];
      const mappedLogs = backendLogs.map(log => this.mapBackendToUi(log));

      this.allLogs.set(mappedLogs);
      this.logsData$.next(mappedLogs);
      this.loading$.next(false);

      if (mappedLogs.length > 0) {
        this.notificationService.info('Search Completed', `Found ${mappedLogs.length} audit log(s)`, { duration: 3000 });
      }
    });
  }

  onFormSubmit(data: Record<string, unknown>): void {
    this.searchFilters.set(data);
    this.searchLogs();
  }

  onFormReset(): void {
    this.searchFilters.set({
      entityType: null,
      action: null,
      module: null,
      severity: null,
      userId: '',
      startDate: null,
      endDate: null,
    });
    this.searchLogs();
  }

  getSeverityVariant(severity: string): BadgeVariant {
    return severity === 'Critical' ? 'danger' : severity === 'Error' ? 'danger' : severity === 'Warning' ? 'warning' : 'info';
  }

  getActionVariant(action: string): BadgeVariant {
    if (action === 'Delete' || action === 'Reject') return 'danger';
    if (action === 'Create' || action === 'Approve') return 'success';
    if (action === 'Update') return 'warning';
    return 'secondary';
  }

  onView(log: AuditLog): void {
    this.selectedLog = log;
    this.isDetailModalOpen = true;
  }

  onRowClick = (item: unknown) => this.onView(item as AuditLog);
  onRetryLoad = () => this.searchLogs();
  onCloseDetailModal = () => { this.isDetailModalOpen = false; this.selectedLog = null; };

  /**
   * Map backend AuditLogDto to UI AuditLog model
   */
  private mapBackendToUi(log: BackendAuditLog): AuditLog {
    // Handle entityId: if it's "N/A" or not a valid number, use 0
    let entityId = 0;
    if (log.entityId && log.entityId !== 'N/A') {
      const parsed = Number(log.entityId);
      entityId = isNaN(parsed) ? 0 : parsed;
    }

    // Description: Human-readable description of the operation
    let description = log.details ?? log.errorMessage ?? log.entityName ?? null;

    // Changes field is no longer used - we only show Old Values and New Values separately
    return {
      id: log.id,
      entityType: log.entityType,
      entityId: entityId,
      action: log.action as AuditLog['action'],
      userId: log.userId,
      userName: log.userName,
      timestamp: log.createdAt,
      ipAddress: log.ipAddress || null,
      userAgent: log.userAgent || null,
      changes: null, // No longer used - Old Values and New Values are shown separately
      oldValues: log.oldValues ?? null,
      newValues: log.newValues ?? null,
      description: description,
      severity: (log.severity || 'Info') as AuditLog['severity'],
      module: log.category || 'System',
    };
  }
}

