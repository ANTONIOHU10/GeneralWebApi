// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/permissions/permission-list/permission-list.component.ts
import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { first, catchError, takeUntil, distinctUntilChanged, filter } from 'rxjs/operators';
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
import { TranslationService } from '@core/services/translation.service';
import { TranslatePipe } from '@core/pipes/translate.pipe';
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
    TranslatePipe,
  ],
  templateUrl: './permission-list.component.html',
  styleUrls: ['./permission-list.component.scss'],
})
export class PermissionListComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);
  private permissionService = inject(PermissionService);
  private translationService = inject(TranslationService);
  private destroy$ = new Subject<void>();

  permissions = signal<Permission[]>([]);
  loading$ = new BehaviorSubject<boolean>(false);
  permissionsData$ = new BehaviorSubject<Permission[] | null>(null);
  searchTerm = signal<string>('');
  activeFilter = signal<string>('all');
  activeTab = signal<'list' | 'add'>('list');

  tabs: TabItem[] = [];

  // Computed statistics
  totalCount = computed(() => this.permissions().length);
  moduleCounts = computed(() => {
    const counts: Record<string, number> = {};
    PERMISSION_MODULES.forEach(module => {
      counts[module] = this.permissions().filter(p => p.module === module).length;
    });
    return counts;
  });

  tableColumns: TableColumn[] = [];
  tableActions: TableAction[] = [];

  /**
   * Initialize tabs and table config with translations
   */
  private initializeTableConfig(): void {
    this.tabs = [
      { id: 'list', label: this.translationService.translate('permissions.tabs.list'), icon: 'list' },
      { id: 'add', label: this.translationService.translate('permissions.tabs.add'), icon: 'add' },
    ];

    this.tableColumns = [
      { key: 'name', label: this.translationService.translate('permissions.columns.name'), sortable: true, width: '200px' },
      { key: 'description', label: this.translationService.translate('permissions.columns.description'), sortable: true, width: '200px' },
      { key: 'category', label: this.translationService.translate('permissions.columns.category'), sortable: true, width: '120px' },
      { key: 'module', label: this.translationService.translate('permissions.columns.module'), sortable: true, width: '120px' },
      { key: 'roleCount', label: this.translationService.translate('permissions.columns.roles'), sortable: true, type: 'number', width: '100px' },
      { key: 'isSystemPermission', label: this.translationService.translate('permissions.columns.type'), sortable: true, width: '100px' },
    ];

    this.tableActions = [
      { label: this.translationService.translate('common.view'), icon: 'visibility', variant: 'ghost', showLabel: false, onClick: (item) => this.onView(item as Permission) },
    ];
  }

  ngOnInit(): void {
    // Wait for translations to load before initializing table config
    this.translationService.getTranslationsLoaded$().pipe(
      distinctUntilChanged(),
      filter(loaded => loaded),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.initializeTableConfig();
      this.loadPermissions();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
        this.notificationService.error(
          this.translationService.translate('common.error'),
          err.message || this.translationService.translate('permissions.loadingFailed'),
          { duration: 5000 }
        );
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
    this.notificationService.info(
      this.translationService.translate('permissions.details.title'),
      `${permission.name}: ${permission.description}`,
      { duration: 3000 }
    );
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
