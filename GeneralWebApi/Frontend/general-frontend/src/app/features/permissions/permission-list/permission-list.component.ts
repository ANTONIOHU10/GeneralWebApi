// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/permissions/permission-list/permission-list.component.ts
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, of } from 'rxjs';
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
  TabItem,
} from '../../../Shared/components/base';
import { NotificationService } from '../../../Shared/services';
import { Permission, PERMISSION_MODULES } from '../../../permissions/permission.model';
import { PermissionService, PermissionList as BackendPermissionList } from '../../../core/services/permission.service';
import { AddPermissionComponent } from '../add-permission/add-permission.component';

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
    AddPermissionComponent,
  ],
  templateUrl: './permission-list.component.html',
  styleUrls: ['./permission-list.component.scss'],
})
export class PermissionListComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private permissionService = inject(PermissionService);

  permissions = signal<Permission[]>([]);
  loading$ = new BehaviorSubject<boolean>(false);
  permissionsData$ = new BehaviorSubject<Permission[] | null>(null);
  searchTerm = signal<string>('');
  activeFilter = signal<string>('all');
  activeTab = signal<'list' | 'add'>('list');

  tabs: TabItem[] = [
    { id: 'list', label: 'Permission List', icon: 'list' },
    { id: 'add', label: 'Add Permission', icon: 'add' },
  ];

  // Computed statistics
  totalCount = computed(() => this.permissions().length);
  moduleCounts = computed(() => {
    const counts: Record<string, number> = {};
    PERMISSION_MODULES.forEach(module => {
      counts[module] = this.permissions().filter(p => p.module === module).length;
    });
    return counts;
  });

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
    const search = this.searchTerm();
    const filter = this.activeFilter();
    
    // Build search params
    const searchParams: any = {};
    if (search) {
      searchParams.name = search;
    }
    if (filter !== 'all') {
      searchParams.resource = filter;
    }

    this.permissionService.getPermissions(searchParams).pipe(
      first(),
      catchError(err => {
        this.loading$.next(false);
        this.notificationService.error('Load Failed', err.message || 'Failed to load permissions', { duration: 5000 });
        return of([]);
      })
    ).subscribe((backendPermissions: BackendPermissionList[]) => {
      // Transform backend permissions to frontend Permission format
      const transformedPermissions: Permission[] = backendPermissions.map(perm => {
        // Extract module from resource (e.g., "Employees" from "Employees.View")
        const module = perm.resource || perm.name.split('.')[0] || 'System';
        // Build normalized name from name
        const normalizedName = perm.name.toUpperCase().replace(/\./g, '_');
        
        return {
          id: perm.id.toString(),
          name: perm.name,
          normalizedName: normalizedName,
          description: perm.description || null,
          category: perm.category,
          module: module,
          isSystemPermission: true, // Backend doesn't have this field, default to true
          roleCount: perm.roleCount || 0,
          createdAt: perm.createdAt,
          updatedAt: null,
        };
      });

      // Apply client-side filtering for search (if needed)
      let filtered = transformedPermissions;
      if (search) {
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description?.toLowerCase().includes(search.toLowerCase()) ||
          p.module.toLowerCase().includes(search.toLowerCase()) ||
          p.category.toLowerCase().includes(search.toLowerCase())
        );
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

  onTabChange(tabId: string): void {
    this.activeTab.set(tabId as 'list' | 'add');
  }

  onPermissionCreated(): void {
    this.loadPermissions();
    this.activeTab.set('list');
  }
}
