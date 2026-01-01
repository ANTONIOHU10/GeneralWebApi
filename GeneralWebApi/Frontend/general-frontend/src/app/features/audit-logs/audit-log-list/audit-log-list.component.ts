// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/audit-logs/audit-log-list/audit-log-list.component.ts
import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { first, catchError, filter, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import {
  BasePrivatePageContainerComponent,
  BaseAsyncStateComponent,
  BaseTableComponent,
  BaseCardComponent,
  BaseBadgeComponent,
  BaseSearchComponent,
  TabItem,
  TableColumn,
  TableAction,
  BadgeVariant,
} from '../../../Shared/components/base';
import { TranslatePipe } from '@core/pipes/translate.pipe';
import { TranslationService } from '@core/services/translation.service';
import { NotificationService } from '../../../Shared/services';
import { AuditLog } from '../../../audit-logs/audit-log.model';
import { SearchAuditLogComponent } from '../search-audit-log/search-audit-log.component';
import { AuditLogDetailComponent } from '../audit-log-detail/audit-log-detail.component';
import { AuditLogService, BackendAuditLog } from '../../../core/services/audit-log.service';

@Component({
  selector: 'app-audit-log-list',
  standalone: true,
  imports: [
    CommonModule,
    BasePrivatePageContainerComponent,
    BaseAsyncStateComponent,
    BaseTableComponent,
    BaseCardComponent,
    BaseBadgeComponent,
    BaseSearchComponent,
    SearchAuditLogComponent,
    AuditLogDetailComponent,
    TranslatePipe,
  ],
  templateUrl: './audit-log-list.component.html',
  styleUrls: ['./audit-log-list.component.scss'],
})
export class AuditLogListComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);
  private auditLogService = inject(AuditLogService);
  private translationService = inject(TranslationService);
  private destroy$ = new Subject<void>();

  logs = signal<AuditLog[]>([]);
  loading$ = new BehaviorSubject<boolean>(false);
  logsData$ = new BehaviorSubject<AuditLog[] | null>(null);
  searchTerm = signal<string>('');
  activeTab = signal<'list' | 'search'>('list');

  selectedLog: AuditLog | null = null;
  isDetailModalOpen = false;

  tabs: TabItem[] = [];
  
  // Computed statistics
  totalCount = computed(() => this.allLogs.length);
  infoCount = computed(() => this.allLogs.filter(l => l.severity === 'Info').length);
  warningCount = computed(() => this.allLogs.filter(l => l.severity === 'Warning').length);
  errorCount = computed(() => this.allLogs.filter(l => l.severity === 'Error').length);
  criticalCount = computed(() => this.allLogs.filter(l => l.severity === 'Critical').length);

  private allLogs: AuditLog[] = [];

  tableColumns: TableColumn[] = [];
  tableActions: TableAction[] = [];

  ngOnInit(): void {
    // Wait for translations to load before initializing tabs and table
    this.translationService.getTranslationsLoaded$().pipe(
      distinctUntilChanged(),
      filter(loaded => loaded),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.initializeTabs();
      this.initializeTable();
    });

    this.loadLogs();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize tabs with translations
   */
  private initializeTabs(): void {
    this.tabs = [
      { id: 'list', label: this.translationService.translate('auditLogs.tabs.list'), icon: 'list' },
      { id: 'search', label: this.translationService.translate('auditLogs.tabs.search'), icon: 'search' },
    ];
  }

  /**
   * Initialize table columns and actions with translations
   */
  private initializeTable(): void {
    this.tableColumns = [
      { key: 'timestamp', label: this.translationService.translate('common.time'), sortable: true, type: 'date', width: '150px' },
      { key: 'module', label: 'Module', sortable: true, width: '120px' },
      { key: 'action', label: this.translationService.translate('common.actions'), sortable: true, width: '100px' },
      { key: 'entityType', label: 'Entity', sortable: true, width: '100px' },
      { key: 'userName', label: this.translationService.translate('auth.username'), sortable: true, width: '150px' },
      { key: 'description', label: this.translationService.translate('common.description'), sortable: true, width: '200px' },
      { key: 'severity', label: 'Severity', sortable: true, width: '100px' },
      { key: 'ipAddress', label: 'IP Address', sortable: true, width: '120px' },
    ];

    this.tableActions = [
      { label: this.translationService.translate('table.actions.view'), icon: 'visibility', variant: 'ghost', showLabel: false, onClick: (item) => this.onView(item as AuditLog) },
    ];
  }

  loadLogs(): void {
    this.loading$.next(true);

    this.auditLogService.getAuditLogs({ pageNumber: 1, pageSize: 100 }).pipe(
      first(),
      catchError(err => {
        this.loading$.next(false);
        this.notificationService.error('Load Failed', err.message || 'Failed to load audit logs', { duration: 5000 });
        return of({ items: [] as BackendAuditLog[], totalCount: 0, pageNumber: 1, pageSize: 100 });
      })
    ).subscribe(result => {
      const backendLogs = result.items || [];
      this.allLogs = backendLogs.map(log => this.mapBackendToUi(log));

      let filtered = this.allLogs;
      const search = this.searchTerm().toLowerCase();
      if (search) {
        filtered = filtered.filter(log =>
          log.userName.toLowerCase().includes(search) ||
          (log.description ?? '').toLowerCase().includes(search) ||
          log.module.toLowerCase().includes(search) ||
          log.action.toLowerCase().includes(search) ||
          log.entityType.toLowerCase().includes(search)
        );
      }

      this.logs.set(filtered);
      this.logsData$.next(filtered);
      this.loading$.next(false);
    });
  }

  onSearchChange(searchTerm: string): void {
    this.searchTerm.set(searchTerm);
    this.loadLogs();
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

  onTabChange(tabId: string): void {
    this.activeTab.set(tabId as 'list' | 'search');
  }

  onRowClick = (item: unknown) => this.onView(item as AuditLog);
  onRetryLoad = () => this.loadLogs();
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
    // Prefer details (which contains operation summary), fallback to errorMessage or entityName
    const description = log.details ?? log.errorMessage ?? log.entityName ?? null;

    // Changes field is no longer used - we only show Old Values and New Values separately
    // Set changes to null to avoid confusion
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
