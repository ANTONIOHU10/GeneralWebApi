// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/audit-logs/search-audit-log/search-audit-log.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, of, delay } from 'rxjs';
import { first, catchError } from 'rxjs/operators';
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
import { AuditLog, AUDIT_LOG_ACTIONS, AUDIT_LOG_SEVERITIES, AUDIT_LOG_MODULES, AUDIT_LOG_ENTITY_TYPES } from '../../../audit-logs/audit-log.model';
import { AuditLogDetailComponent } from '../audit-log-detail/audit-log-detail.component';

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
  ],
  templateUrl: './search-audit-log.component.html',
  styleUrls: ['./search-audit-log.component.scss'],
})
export class SearchAuditLogComponent implements OnInit {
  private notificationService = inject(NotificationService);

  allLogs = signal<AuditLog[]>([]);
  loading = signal(false);
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

  private mockLogs: AuditLog[] = [
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
  ];

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
    this.searchLogs();
  }

  searchLogs(): void {
    this.loading.set(true);
    this.loading$.next(true);

    of(this.mockLogs).pipe(
      delay(500),
      first(),
      catchError(err => {
        const errorMessage = err.message || 'Failed to search audit logs';
        this.loading.set(false);
        this.loading$.next(false);
        this.allLogs.set([]);
        this.logsData$.next([]);
        this.notificationService.error('Search Failed', errorMessage, { duration: 5000 });
        return of([]);
      })
    ).subscribe({
      next: (logs: AuditLog[]) => {
        let filtered = logs;
        const filters = this.searchFilters();

        if (filters['entityType']) {
          filtered = filtered.filter(l => l.entityType === filters['entityType']);
        }
        if (filters['action']) {
          filtered = filtered.filter(l => l.action === filters['action']);
        }
        if (filters['module']) {
          filtered = filtered.filter(l => l.module === filters['module']);
        }
        if (filters['severity']) {
          filtered = filtered.filter(l => l.severity === filters['severity']);
        }
        if (filters['userId']) {
          filtered = filtered.filter(l => l.userId.toLowerCase().includes((filters['userId'] as string).toLowerCase()));
        }
        if (filters['startDate']) {
          filtered = filtered.filter(l => new Date(l.timestamp) >= new Date(filters['startDate'] as string));
        }
        if (filters['endDate']) {
          filtered = filtered.filter(l => new Date(l.timestamp) <= new Date(filters['endDate'] as string));
        }

        this.allLogs.set(filtered);
        this.logsData$.next(filtered);
        this.loading.set(false);
        this.loading$.next(false);

        if (filtered.length > 0) {
          this.notificationService.info('Search Completed', `Found ${filtered.length} audit log(s)`, { duration: 3000 });
        }
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
}

