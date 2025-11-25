// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/audit-logs/audit-log-list/audit-log-list.component.ts
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, delay, of } from 'rxjs';
import { first, catchError } from 'rxjs/operators';
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
import { NotificationService } from '../../../Shared/services';
import { AuditLog, AUDIT_LOG_ACTIONS, AUDIT_LOG_SEVERITIES, AUDIT_LOG_MODULES, AUDIT_LOG_ENTITY_TYPES } from '../../../audit-logs/audit-log.model';
import { SearchAuditLogComponent } from '../search-audit-log/search-audit-log.component';
import { AuditLogDetailComponent } from '../audit-log-detail/audit-log-detail.component';

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
  ],
  templateUrl: './audit-log-list.component.html',
  styleUrls: ['./audit-log-list.component.scss'],
})
export class AuditLogListComponent implements OnInit {
  private notificationService = inject(NotificationService);

  logs = signal<AuditLog[]>([]);
  loading$ = new BehaviorSubject<boolean>(false);
  logsData$ = new BehaviorSubject<AuditLog[] | null>(null);
  searchTerm = signal<string>('');
  activeTab = signal<'list' | 'search'>('list');

  selectedLog: AuditLog | null = null;
  isDetailModalOpen = false;

  tabs: TabItem[] = [
    { id: 'list', label: 'Audit Logs', icon: 'list' },
    { id: 'search', label: 'Search Logs', icon: 'search' },
  ];

  // Computed statistics
  totalCount = computed(() => this.allLogs.length);
  infoCount = computed(() => this.allLogs.filter(l => l.severity === 'Info').length);
  warningCount = computed(() => this.allLogs.filter(l => l.severity === 'Warning').length);
  errorCount = computed(() => this.allLogs.filter(l => l.severity === 'Error').length);
  criticalCount = computed(() => this.allLogs.filter(l => l.severity === 'Critical').length);

  private allLogs: AuditLog[] = [
    {
      id: 1,
      entityType: 'Employee',
      entityId: 1,
      action: 'Create',
      userId: 'user1',
      userName: 'John Admin',
      timestamp: '2024-12-17T10:30:00Z',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0',
      changes: '{"name":"John Doe","email":"john@example.com"}',
      oldValues: null,
      newValues: '{"name":"John Doe","email":"john@example.com"}',
      description: 'New employee created',
      severity: 'Info',
      module: 'Employees',
    },
    {
      id: 2,
      entityType: 'Contract',
      entityId: 2,
      action: 'Approve',
      userId: 'user2',
      userName: 'Jane Manager',
      timestamp: '2024-12-17T09:15:00Z',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0',
      changes: '{"status":"Approved"}',
      oldValues: '{"status":"Pending"}',
      newValues: '{"status":"Approved"}',
      description: 'Contract approved',
      severity: 'Info',
      module: 'Approvals',
    },
    {
      id: 3,
      entityType: 'Department',
      entityId: 3,
      action: 'Delete',
      userId: 'user1',
      userName: 'John Admin',
      timestamp: '2024-12-16T14:20:00Z',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0',
      changes: null,
      oldValues: '{"name":"Old Department","code":"OLD"}',
      newValues: null,
      description: 'Department deleted',
      severity: 'Warning',
      module: 'Departments',
    },
    {
      id: 4,
      entityType: 'User',
      entityId: 5,
      action: 'Login',
      userId: 'user3',
      userName: 'Bob User',
      timestamp: '2024-12-17T08:00:00Z',
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0',
      changes: null,
      oldValues: null,
      newValues: null,
      description: 'User logged in',
      severity: 'Info',
      module: 'Authentication',
    },
    {
      id: 5,
      entityType: 'Contract',
      entityId: 4,
      action: 'Reject',
      userId: 'user2',
      userName: 'Jane Manager',
      timestamp: '2024-12-15T16:45:00Z',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0',
      changes: '{"status":"Rejected","rejectionReason":"Budget constraints"}',
      oldValues: '{"status":"Pending"}',
      newValues: '{"status":"Rejected","rejectionReason":"Budget constraints"}',
      description: 'Contract rejected',
      severity: 'Warning',
      module: 'Approvals',
    },
    {
      id: 6,
      entityType: 'System',
      entityId: 0,
      action: 'Update',
      userId: 'system',
      userName: 'System',
      timestamp: '2024-12-14T12:00:00Z',
      ipAddress: null,
      userAgent: null,
      changes: '{"config":"updated"}',
      oldValues: null,
      newValues: '{"config":"updated"}',
      description: 'System configuration updated',
      severity: 'Error',
      module: 'System',
    },
  ];

  tableColumns: TableColumn[] = [
    { key: 'timestamp', label: 'Time', sortable: true, type: 'date', width: '150px' },
    { key: 'module', label: 'Module', sortable: true, width: '120px' },
    { key: 'action', label: 'Action', sortable: true, width: '100px' },
    { key: 'entityType', label: 'Entity', sortable: true, width: '100px' },
    { key: 'userName', label: 'User', sortable: true, width: '150px' },
    { key: 'description', label: 'Description', sortable: true, width: '200px' },
    { key: 'severity', label: 'Severity', sortable: true, width: '100px' },
    { key: 'ipAddress', label: 'IP Address', sortable: true, width: '120px' },
  ];

  tableActions: TableAction[] = [
    { label: 'View', icon: 'visibility', variant: 'ghost', showLabel: false, onClick: (item) => this.onView(item as AuditLog) },
  ];

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.loading$.next(true);
    of(this.allLogs).pipe(delay(500), first(), catchError(err => {
      this.loading$.next(false);
      this.notificationService.error('Load Failed', err.message || 'Failed to load audit logs', { duration: 5000 });
      return of([]);
    })).subscribe(logs => {
      let filtered = logs;
      const search = this.searchTerm().toLowerCase();
      if (search) {
        filtered = filtered.filter(log =>
          log.userName.toLowerCase().includes(search) ||
          log.description?.toLowerCase().includes(search) ||
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
}
