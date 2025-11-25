// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/roles/role-list/role-list.component.ts
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, delay, of } from 'rxjs';
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
  totalCount = computed(() => this.allRoles.length);
  systemRoleCount = computed(() => this.allRoles.filter(r => r.isSystemRole).length);
  customRoleCount = computed(() => this.allRoles.filter(r => !r.isSystemRole).length);

  private allRoles: Role[] = [
    {
      id: '1',
      name: 'Admin',
      normalizedName: 'ADMIN',
      description: 'Full system access',
      permissions: ['All'],
      userCount: 2,
      isSystemRole: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: null,
    },
    {
      id: '2',
      name: 'Manager',
      normalizedName: 'MANAGER',
      description: 'Department and team management',
      permissions: ['Employees.View', 'Employees.Create', 'Employees.Update', 'Departments.View', 'Contracts.View', 'Contracts.Approve'],
      userCount: 5,
      isSystemRole: false,
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: null,
    },
    {
      id: '3',
      name: 'User',
      normalizedName: 'USER',
      description: 'Basic user access',
      permissions: ['Employees.View', 'Contracts.View'],
      userCount: 20,
      isSystemRole: false,
      createdAt: '2024-01-20T00:00:00Z',
      updatedAt: null,
    },
    {
      id: '4',
      name: 'HR',
      normalizedName: 'HR',
      description: 'Human resources management',
      permissions: ['Employees.View', 'Employees.Create', 'Employees.Update', 'Contracts.View', 'Contracts.Create', 'Contracts.Update'],
      userCount: 3,
      isSystemRole: false,
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: null,
    },
  ];

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
    of(this.allRoles).pipe(delay(500), first(), catchError(err => {
      this.loading$.next(false);
      this.notificationService.error('Load Failed', err.message || 'Failed to load roles', { duration: 5000 });
      return of([]);
    })).subscribe(roles => {
      let filtered = roles;
      const search = this.searchTerm().toLowerCase();
      if (search) {
        filtered = filtered.filter(r =>
          r.name.toLowerCase().includes(search) ||
          r.description?.toLowerCase().includes(search) ||
          r.normalizedName.toLowerCase().includes(search)
        );
      }
      this.roles.set(filtered);
      this.rolesData$.next(filtered);
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
      const updated = this.roles().filter(r => r.id !== role.id);
      this.roles.set(updated);
      this.rolesData$.next(updated);
      this.notificationService.success('Deleted', `Role "${role.name}" has been deleted`, { duration: 3000 });
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
