// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/users/user-list/user-list.component.ts
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
import { User } from '../../../users/user.model';
import { UserDetailComponent } from '../user-detail/user-detail.component';
import { AddUserComponent } from '../add-user/add-user.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    BasePrivatePageContainerComponent,
    BaseAsyncStateComponent,
    BaseTableComponent,
    BaseCardComponent,
    BaseBadgeComponent,
    BaseSearchComponent,
    UserDetailComponent,
    AddUserComponent,
  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private dialogService = inject(DialogService);

  users = signal<User[]>([]);
  loading$ = new BehaviorSubject<boolean>(false);
  usersData$ = new BehaviorSubject<User[] | null>(null);
  searchTerm = signal<string>('');
  activeTab = signal<'list' | 'add'>('list');

  selectedUser: User | null = null;
  isDetailModalOpen = false;
  detailMode: 'edit' | 'view' = 'view';

  tabs: TabItem[] = [
    { id: 'list', label: 'User List', icon: 'list' },
    { id: 'add', label: 'Add User', icon: 'add' },
  ];

  // Computed statistics
  activeCount = computed(() => this.allUsers.filter(u => u.isActive).length);
  inactiveCount = computed(() => this.allUsers.filter(u => !u.isActive).length);
  lockedCount = computed(() => this.allUsers.filter(u => u.lockoutEnd && new Date(u.lockoutEnd) > new Date()).length);

  private allUsers: User[] = [
    {
      id: '1',
      userName: 'admin',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      phoneNumber: '+1234567890',
      isActive: true,
      emailConfirmed: true,
      lockoutEnabled: true,
      lockoutEnd: null,
      roles: ['Admin', 'Manager'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: null,
      lastLoginAt: '2024-12-17T08:00:00Z',
    },
    {
      id: '2',
      userName: 'jmanager',
      email: 'jmanager@example.com',
      firstName: 'Jane',
      lastName: 'Manager',
      phoneNumber: '+1234567891',
      isActive: true,
      emailConfirmed: true,
      lockoutEnabled: true,
      lockoutEnd: null,
      roles: ['Manager'],
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: null,
      lastLoginAt: '2024-12-17T09:00:00Z',
    },
    {
      id: '3',
      userName: 'buser',
      email: 'buser@example.com',
      firstName: 'Bob',
      lastName: 'User',
      phoneNumber: '+1234567892',
      isActive: true,
      emailConfirmed: true,
      lockoutEnabled: true,
      lockoutEnd: null,
      roles: ['User'],
      createdAt: '2024-03-01T00:00:00Z',
      updatedAt: null,
      lastLoginAt: '2024-12-16T14:00:00Z',
    },
    {
      id: '4',
      userName: 'inactive',
      email: 'inactive@example.com',
      firstName: 'Inactive',
      lastName: 'User',
      phoneNumber: null,
      isActive: false,
      emailConfirmed: false,
      lockoutEnabled: true,
      lockoutEnd: null,
      roles: ['User'],
      createdAt: '2024-04-01T00:00:00Z',
      updatedAt: '2024-12-01T00:00:00Z',
      lastLoginAt: null,
    },
    {
      id: '5',
      userName: 'locked',
      email: 'locked@example.com',
      firstName: 'Locked',
      lastName: 'User',
      phoneNumber: '+1234567893',
      isActive: true,
      emailConfirmed: true,
      lockoutEnabled: true,
      lockoutEnd: '2024-12-20T00:00:00Z',
      roles: ['User'],
      createdAt: '2024-05-01T00:00:00Z',
      updatedAt: null,
      lastLoginAt: '2024-12-15T10:00:00Z',
    },
  ];

  tableColumns: TableColumn[] = [
    { key: 'userName', label: 'Username', sortable: true, width: '150px' },
    { key: 'email', label: 'Email', sortable: true, width: '200px' },
    { key: 'firstName', label: 'First Name', sortable: true, width: '120px' },
    { key: 'lastName', label: 'Last Name', sortable: true, width: '120px' },
    { key: 'roles', label: 'Roles', sortable: false, width: '150px' },
    { key: 'isActive', label: 'Status', sortable: true, width: '100px' },
    { key: 'lastLoginAt', label: 'Last Login', sortable: true, type: 'date', width: '150px' },
  ];

  tableActions: TableAction[] = [
    { label: 'View', icon: 'visibility', variant: 'ghost', showLabel: false, onClick: (item) => this.onView(item as User) },
    { label: 'Edit', icon: 'edit', variant: 'ghost', showLabel: false, onClick: (item) => this.onEdit(item as User) },
    { label: 'Delete', icon: 'delete', variant: 'danger', showLabel: false, onClick: (item) => this.onDelete(item as User) },
  ];

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading$.next(true);
    of(this.allUsers).pipe(delay(500), first(), catchError(err => {
      this.loading$.next(false);
      this.notificationService.error('Load Failed', err.message || 'Failed to load users', { duration: 5000 });
      return of([]);
    })).subscribe(users => {
      let filtered = users;
      const search = this.searchTerm().toLowerCase();
      if (search) {
        filtered = filtered.filter(u =>
          u.userName.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search) ||
          u.firstName.toLowerCase().includes(search) ||
          u.lastName.toLowerCase().includes(search)
        );
      }
      this.users.set(filtered);
      this.usersData$.next(filtered);
      this.loading$.next(false);
    });
  }

  onSearchChange(searchTerm: string): void {
    this.searchTerm.set(searchTerm);
    this.loadUsers();
  }

  getStatusVariant(isActive: boolean): BadgeVariant {
    return isActive ? 'success' : 'secondary';
  }

  onView(user: User): void {
    this.selectedUser = user;
    this.detailMode = 'view';
    this.isDetailModalOpen = true;
  }

  onEdit(user: User): void {
    this.selectedUser = user;
    this.detailMode = 'edit';
    this.isDetailModalOpen = true;
  }

  onDelete(user: User): void {
    this.dialogService.confirm({
      title: 'Delete User',
      message: `Delete user "${user.userName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmVariant: 'danger',
      icon: 'warning',
    }).pipe(first(), filter(c => c)).subscribe(() => {
      const updated = this.users().filter(u => u.id !== user.id);
      this.users.set(updated);
      this.usersData$.next(updated);
      this.notificationService.success('Deleted', `User "${user.userName}" has been deleted`, { duration: 3000 });
    });
  }

  onTabChange(tabId: string): void {
    this.activeTab.set(tabId as 'list' | 'add');
  }

  onUserCreated(): void {
    this.loadUsers();
    this.activeTab.set('list');
  }

  onUserUpdated(): void {
    this.loadUsers();
    this.isDetailModalOpen = false;
    this.selectedUser = null;
  }

  onRowClick = (item: unknown) => this.onView(item as User);
  onRetryLoad = () => this.loadUsers();
  onCloseDetailModal = () => { this.isDetailModalOpen = false; this.selectedUser = null; };
}
