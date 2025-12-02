// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/roles/role-list/role-list.component.ts
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { first, catchError, filter, take } from 'rxjs/operators';
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
import { NotificationService, DialogService } from '../../../Shared/services';
import { Role } from '../../../roles/role.model';
import { RoleDetailComponent } from '../role-detail/role-detail.component';
import { AddRoleComponent } from '../add-role/add-role.component';
import { RoleService, RoleList as BackendRoleList } from '../../../core/services/role.service';
import { of } from 'rxjs';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [
    CommonModule,
    BasePrivatePageContainerComponent,
    BaseAsyncStateComponent,
    BaseTableComponent,
    BaseCardComponent,
    BaseBadgeComponent,
    BaseSearchComponent,
    RoleDetailComponent,
    AddRoleComponent,
  ],
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.scss'],
})
export class RoleListComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private dialogService = inject(DialogService);
  private roleService = inject(RoleService);

  roles = signal<Role[]>([]);
  loading$ = new BehaviorSubject<boolean>(false);
  rolesData$ = new BehaviorSubject<Role[] | null>(null);
  searchTerm = signal<string>('');
  activeTab = signal<'list' | 'add'>('list');

  selectedRole: Role | null = null;
  isDetailModalOpen = false;
  detailMode: 'edit' | 'view' = 'view';

  tabs: TabItem[] = [
    { id: 'list', label: 'Role List', icon: 'list' },
    { id: 'add', label: 'Add Role', icon: 'add' },
  ];

  // Computed statistics
  totalCount = computed(() => this.roles().length);
  systemRoleCount = computed(() => this.roles().filter(r => r.isSystemRole).length);
  customRoleCount = computed(() => this.roles().filter(r => !r.isSystemRole).length);

  tableColumns: TableColumn[] = [
    { key: 'name', label: 'Role Name', sortable: true, width: '150px' },
    { key: 'description', label: 'Description', sortable: true, width: '200px' },
    { key: 'permissions', label: 'Permissions', sortable: false, width: '200px' },
    { key: 'userCount', label: 'Users', sortable: true, type: 'number', width: '100px' },
    { key: 'isSystemRole', label: 'Type', sortable: true, width: '100px' },
    { key: 'createdAt', label: 'Created At', sortable: true, type: 'date', width: '150px' },
  ];

  tableActions: TableAction[] = [
    { label: 'View', icon: 'visibility', variant: 'ghost', showLabel: false, onClick: (item) => this.onView(item as Role) },
    { label: 'Edit', icon: 'edit', variant: 'ghost', showLabel: false, onClick: (item) => this.onEdit(item as Role), visible: (item) => !(item as Role).isSystemRole },
    { label: 'Delete', icon: 'delete', variant: 'danger', showLabel: false, onClick: (item) => this.onDelete(item as Role), visible: (item) => !(item as Role).isSystemRole },
  ];

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading$.next(true);
    const search = this.searchTerm();
    const searchParams = search ? { name: search } : undefined;

    this.roleService.getRoles(searchParams).pipe(
      first(),
      catchError(err => {
      this.loading$.next(false);
      this.notificationService.error('Load Failed', err.message || 'Failed to load roles', { duration: 5000 });
      return of([]);
      })
    ).subscribe((backendRoles: BackendRoleList[]) => {
      // Transform backend roles to frontend Role format
      const transformedRoles: Role[] = backendRoles.map(role => ({
        id: role.id.toString(),
        name: role.name,
        normalizedName: role.name.toUpperCase(),
        description: role.description || null,
        permissions: [], // Will be loaded separately if needed
        userCount: role.employeeCount,
        isSystemRole: false, // Backend doesn't have this field, default to false
        createdAt: role.createdAt,
        updatedAt: null,
      }));

      this.roles.set(transformedRoles);
      this.rolesData$.next(transformedRoles);
      this.loading$.next(false);
    });
  }

  onSearchChange(searchTerm: string): void {
    this.searchTerm.set(searchTerm);
    this.loadRoles();
      }

  getTypeVariant(isSystemRole: boolean): BadgeVariant {
    return isSystemRole ? 'primary' : 'secondary';
  }

  onView(role: Role): void {
    this.selectedRole = role;
    this.detailMode = 'view';
    this.isDetailModalOpen = true;
  }

  onEdit(role: Role): void {
    this.selectedRole = role;
    this.detailMode = 'edit';
    this.isDetailModalOpen = true;
  }

  onDelete(role: Role): void {
    this.dialogService.confirm({
      title: 'Delete Role',
      message: `Delete role "${role.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmVariant: 'danger',
      icon: 'warning',
    }).pipe(first(), filter(c => c)).subscribe(() => {
      const roleId = parseInt(role.id, 10);
      this.roleService.deleteRole(roleId).pipe(
        first(),
        catchError(err => {
          this.notificationService.error('Delete Failed', err.message || 'Failed to delete role', { duration: 5000 });
          return of(false);
        })
      ).subscribe(success => {
        if (success) {
      const updated = this.roles().filter(r => r.id !== role.id);
      this.roles.set(updated);
      this.rolesData$.next(updated);
      this.notificationService.success('Deleted', `Role "${role.name}" has been deleted`, { duration: 3000 });
        }
      });
    });
  }

  onTabChange(tabId: string): void {
    this.activeTab.set(tabId as 'list' | 'add');
  }

  onRoleCreated(): void {
    this.loadRoles();
    this.activeTab.set('list');
  }

  onRoleUpdated(): void {
    this.loadRoles();
    this.isDetailModalOpen = false;
    this.selectedRole = null;
  }

  onRowClick = (item: unknown) => this.onView(item as Role);
  onRetryLoad = () => this.loadRoles();
  onCloseDetailModal = () => { this.isDetailModalOpen = false; this.selectedRole = null; };
}
