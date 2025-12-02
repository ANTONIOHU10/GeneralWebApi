// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/users/user-list/user-list.component.ts
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, of } from 'rxjs';
import { first, catchError, filter, map } from 'rxjs/operators';
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
import { UserService, UserWithEmployee } from '../../../core/services/user.service';

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
  private userService = inject(UserService);

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
  activeCount = computed(() => this.users().filter(u => u.isActive).length);
  inactiveCount = computed(() => this.users().filter(u => !u.isActive).length);
  lockedCount = computed(() => this.users().filter(u => u.lockoutEnd && new Date(u.lockoutEnd) > new Date()).length);

  private allUsers: User[] = [];

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
    this.userService.getUsersWithEmployee().pipe(
      map((userWithEmployees: UserWithEmployee[]) => {
        // Transform UserWithEmployee to User format
        return userWithEmployees.map(ue => this.transformToUser(ue));
      }),
      first(),
      catchError(err => {
        this.loading$.next(false);
        this.notificationService.error('Load Failed', err.message || 'Failed to load users', { duration: 5000 });
        return of([]);
      })
    ).subscribe(users => {
      this.allUsers = users;
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

  /**
   * Transform UserWithEmployee to User format
   * Maps backend UserWithEmployeeDto to frontend User interface
   */
  private transformToUser(userWithEmployee: UserWithEmployee): User {
    // Split employee name into firstName and lastName if available
    let firstName = '';
    let lastName = '';
    if (userWithEmployee.employeeName) {
      const nameParts = userWithEmployee.employeeName.trim().split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }

    // Convert role string to roles array
    const roles = userWithEmployee.role ? [userWithEmployee.role] : [];

    return {
      id: userWithEmployee.userId.toString(),
      userName: userWithEmployee.username,
      email: userWithEmployee.email,
      firstName: firstName,
      lastName: lastName,
      phoneNumber: userWithEmployee.phoneNumber || null,
      isActive: true, // Default to true as backend doesn't provide this field
      emailConfirmed: true, // Default to true as backend doesn't provide this field
      lockoutEnabled: false, // Default to false as backend doesn't provide this field
      lockoutEnd: null, // Backend doesn't provide this field
      roles: roles,
      createdAt: userWithEmployee.createdAt,
      updatedAt: null, // Backend doesn't provide this field
      lastLoginAt: null, // Backend doesn't provide this field
    };
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
      const userId = parseInt(user.id, 10);
      this.userService.deleteUser(userId).pipe(
        first(),
        catchError(err => {
          this.notificationService.error('Delete Failed', err.message || 'Failed to delete user', { duration: 5000 });
          return of(false);
        })
      ).subscribe(success => {
        if (success) {
          const updated = this.users().filter(u => u.id !== user.id);
          this.users.set(updated);
          this.usersData$.next(updated);
          this.notificationService.success('Deleted', `User "${user.userName}" has been deleted`, { duration: 3000 });
        }
      });
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
