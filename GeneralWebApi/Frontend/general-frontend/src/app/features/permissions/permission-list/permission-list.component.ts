// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/permissions/permission-list/permission-list.component.ts
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
  TableColumn,
  TableAction,
  BadgeVariant,
} from '../../../Shared/components/base';
import { NotificationService } from '../../../Shared/services';
import { Permission, PERMISSION_MODULES } from '../../../permissions/permission.model';

@Component({
  selector: 'app-permission-list',
  standalone: true,
  imports: [
    CommonModule,
    BasePrivatePageContainerComponent,
    BaseAsyncStateComponent,
    BaseTableComponent,
    BaseCardComponent,
    BaseBadgeComponent,
    BaseSearchComponent,
  ],
  templateUrl: './permission-list.component.html',
  styleUrls: ['./permission-list.component.scss'],
})
export class PermissionListComponent implements OnInit {
  private notificationService = inject(NotificationService);

  permissions = signal<Permission[]>([]);
  loading$ = new BehaviorSubject<boolean>(false);
  permissionsData$ = new BehaviorSubject<Permission[] | null>(null);
  searchTerm = signal<string>('');
  activeFilter = signal<string>('all');

  // Computed statistics
  totalCount = computed(() => this.allPermissions.length);
  moduleCounts = computed(() => {
    const counts: Record<string, number> = {};
    PERMISSION_MODULES.forEach(module => {
      counts[module] = this.allPermissions.filter(p => p.module === module).length;
    });
    return counts;
  });

  private allPermissions: Permission[] = [
    { id: '1', name: 'Employees.View', normalizedName: 'EMPLOYEES.VIEW', description: 'View employees', category: 'View', module: 'Employees', isSystemPermission: true, roleCount: 15, createdAt: '2024-01-01T00:00:00Z', updatedAt: null },
    { id: '2', name: 'Employees.Create', normalizedName: 'EMPLOYEES.CREATE', description: 'Create employees', category: 'Create', module: 'Employees', isSystemPermission: true, roleCount: 8, createdAt: '2024-01-01T00:00:00Z', updatedAt: null },
    { id: '3', name: 'Employees.Update', normalizedName: 'EMPLOYEES.UPDATE', description: 'Update employees', category: 'Update', module: 'Employees', isSystemPermission: true, roleCount: 8, createdAt: '2024-01-01T00:00:00Z', updatedAt: null },
    { id: '4', name: 'Employees.Delete', normalizedName: 'EMPLOYEES.DELETE', description: 'Delete employees', category: 'Delete', module: 'Employees', isSystemPermission: true, roleCount: 3, createdAt: '2024-01-01T00:00:00Z', updatedAt: null },
    { id: '5', name: 'Departments.View', normalizedName: 'DEPARTMENTS.VIEW', description: 'View departments', category: 'View', module: 'Departments', isSystemPermission: true, roleCount: 12, createdAt: '2024-01-01T00:00:00Z', updatedAt: null },
    { id: '6', name: 'Departments.Create', normalizedName: 'DEPARTMENTS.CREATE', description: 'Create departments', category: 'Create', module: 'Departments', isSystemPermission: true, roleCount: 5, createdAt: '2024-01-01T00:00:00Z', updatedAt: null },
    { id: '7', name: 'Contracts.View', normalizedName: 'CONTRACTS.VIEW', description: 'View contracts', category: 'View', module: 'Contracts', isSystemPermission: true, roleCount: 10, createdAt: '2024-01-01T00:00:00Z', updatedAt: null },
    { id: '8', name: 'Contracts.Approve', normalizedName: 'CONTRACTS.APPROVE', description: 'Approve contracts', category: 'Approve', module: 'Contracts', isSystemPermission: true, roleCount: 4, createdAt: '2024-01-01T00:00:00Z', updatedAt: null },
    { id: '9', name: 'Users.View', normalizedName: 'USERS.VIEW', description: 'View users', category: 'View', module: 'Users', isSystemPermission: true, roleCount: 6, createdAt: '2024-01-01T00:00:00Z', updatedAt: null },
    { id: '10', name: 'Roles.Manage', normalizedName: 'ROLES.MANAGE', description: 'Manage roles', category: 'Manage', module: 'Roles', isSystemPermission: true, roleCount: 2, createdAt: '2024-01-01T00:00:00Z', updatedAt: null },
  ];

  tableColumns: TableColumn[] = [
    { key: 'name', label: 'Permission Name', sortable: true, width: '200px' },
    { key: 'description', label: 'Description', sortable: true, width: '200px' },
    { key: 'category', label: 'Category', sortable: true, width: '120px' },
    { key: 'module', label: 'Module', sortable: true, width: '120px' },
    { key: 'roleCount', label: 'Roles', sortable: true, type: 'number', width: '100px' },
    { key: 'isSystemPermission', label: 'Type', sortable: true, width: '100px' },
  ];

  tableActions: TableAction[] = [
    { label: 'View', icon: 'visibility', variant: 'ghost', showLabel: false, onClick: (item) => this.onView(item as Permission) },
  ];

  ngOnInit(): void {
    this.loadPermissions();
      }

  loadPermissions(): void {
    this.loading$.next(true);
    of(this.allPermissions).pipe(delay(500), first(), catchError(err => {
      this.loading$.next(false);
      this.notificationService.error('Load Failed', err.message || 'Failed to load permissions', { duration: 5000 });
      return of([]);
    })).subscribe(permissions => {
      let filtered = permissions;
      const search = this.searchTerm().toLowerCase();
      if (search) {
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(search) ||
          p.description?.toLowerCase().includes(search) ||
          p.module.toLowerCase().includes(search) ||
          p.category.toLowerCase().includes(search)
        );
      }
      const filter = this.activeFilter();
      if (filter !== 'all') {
        filtered = filtered.filter(p => p.module === filter);
      }
      this.permissions.set(filtered);
      this.permissionsData$.next(filtered);
      this.loading$.next(false);
    });
  }

  onSearchChange(searchTerm: string): void {
    this.searchTerm.set(searchTerm);
    this.loadPermissions();
  }

  onFilterChange(module: string): void {
    this.activeFilter.set(module);
    this.loadPermissions();
  }

  getTypeVariant(isSystemPermission: boolean): BadgeVariant {
    return isSystemPermission ? 'primary' : 'secondary';
  }

  getCategoryVariant(category: string): BadgeVariant {
    if (category === 'Delete') return 'danger';
    if (category === 'Create' || category === 'Approve') return 'success';
    if (category === 'Update') return 'warning';
    return 'info';
  }

  onView(permission: Permission): void {
    // Could open a detail modal if needed
    this.notificationService.info('Permission Details', `${permission.name}: ${permission.description}`, { duration: 3000 });
  }

  onRowClick = (item: unknown) => this.onView(item as Permission);
  onRetryLoad = () => this.loadPermissions();
}
