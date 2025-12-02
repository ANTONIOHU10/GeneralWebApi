// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/users/user-detail/user-detail.component.ts
import { 
  Component, Input, Output, EventEmitter, 
  OnInit, OnChanges, AfterViewInit, 
  inject, signal, TemplateRef, ViewChild 
} from '@angular/core';
import type { SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';
import { filter, first, catchError } from 'rxjs/operators';
import { User } from '../../../users/user.model';
import {
  BaseDetailComponent,
  BaseFormComponent,
  BaseBadgeComponent,
  DetailSection,
  FormConfig,
  SelectOption,
  BadgeVariant,
} from '../../../Shared/components/base';
import { DialogService, NotificationService } from '../../../Shared/services';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    BaseDetailComponent,
    BaseFormComponent,
    BaseBadgeComponent,
  ],
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss'],
})
export class UserDetailComponent implements OnInit, OnChanges, AfterViewInit {
  private dialogService = inject(DialogService);
  private notificationService = inject(NotificationService);
  private userService = inject(UserService);

  @Input() user: User | null = null;
  @Input() isOpen = false;
  @Input() mode: 'edit' | 'view' = 'view';

  @Output() closeEvent = new EventEmitter<void>();
  @Output() userUpdated = new EventEmitter<void>();

  @ViewChild('editFormTemplate') editFormTemplate!: TemplateRef<any>;
  @ViewChild('rolesTemplate') rolesTemplate!: TemplateRef<any>;

  loading = signal(false);
  formData: Record<string, unknown> = {};

  roleOptions: SelectOption[] = [
    { value: 'Admin', label: 'Admin' },
    { value: 'Manager', label: 'Manager' },
    { value: 'User', label: 'User' },
  ];

  formConfig: FormConfig = {
    sections: [
      {
        title: 'User Information',
        description: 'User basic information',
        order: 0,
      },
      {
        title: 'Account Settings',
        description: 'Account settings',
        order: 1,
      },
    ],
    layout: {
      columns: 2,
      gap: '1.5rem',
      sectionGap: '2rem',
      labelPosition: 'top',
      showSectionDividers: true,
    },
    fields: [
      {
        key: 'userName',
        type: 'input',
        label: 'Username',
        placeholder: 'Enter username',
        required: true,
        section: 'User Information',
        order: 0,
        colSpan: 1,
      },
      {
        key: 'email',
        type: 'input',
        label: 'Email',
        placeholder: 'Enter email',
        required: true,
        section: 'User Information',
        order: 1,
        colSpan: 1,
        inputType: 'email',
      },
      {
        key: 'firstName',
        type: 'input',
        label: 'First Name',
        placeholder: 'Enter first name',
        required: true,
        section: 'User Information',
        order: 2,
        colSpan: 1,
      },
      {
        key: 'lastName',
        type: 'input',
        label: 'Last Name',
        placeholder: 'Enter last name',
        required: true,
        section: 'User Information',
        order: 3,
        colSpan: 1,
      },
      {
        key: 'phoneNumber',
        type: 'input',
        label: 'Phone Number',
        placeholder: 'Enter phone number',
        required: false,
        section: 'User Information',
        order: 4,
        colSpan: 1,
        inputType: 'tel',
      },
      {
        key: 'roles',
        type: 'select',
        label: 'Roles',
        placeholder: 'Select roles',
        required: false,
        section: 'Account Settings',
        order: 0,
        colSpan: 2,
        multiple: true,
        options: this.roleOptions,
      },
      {
        key: 'isActive',
        type: 'checkbox',
        label: 'Active',
        required: false,
        section: 'Account Settings',
        order: 1,
        colSpan: 1,
      },
    ],
  };

  sections = signal<DetailSection[]>([]);

  private updateSections(): void {
    if (!this.user || !this.rolesTemplate) {
      this.sections.set([]);
      return;
    }
    this.sections.set([
      {
        title: 'User Information',
        fields: [
          { label: 'Username', value: this.user.userName, type: 'text' },
          { label: 'Email', value: this.user.email, type: 'text' },
          { label: 'First Name', value: this.user.firstName, type: 'text' },
          { label: 'Last Name', value: this.user.lastName, type: 'text' },
          { label: 'Phone Number', value: this.user.phoneNumber || 'N/A', type: 'text' },
          { label: 'Status', value: this.user.isActive ? 'Active' : 'Inactive', type: 'badge', badgeVariant: this.getStatusVariant(this.user.isActive) },
          { label: 'Email Confirmed', value: this.user.emailConfirmed ? 'Yes' : 'No', type: 'badge', badgeVariant: this.user.emailConfirmed ? 'success' : 'secondary' },
          { label: 'Roles', value: null, type: 'custom' as const, customTemplate: this.rolesTemplate },
          { label: 'Created At', value: this.user.createdAt, type: 'date' },
          ...(this.user.updatedAt ? [{ label: 'Updated At', value: this.user.updatedAt, type: 'date' as const }] : []),
          ...(this.user.lastLoginAt ? [{ label: 'Last Login', value: this.user.lastLoginAt, type: 'date' as const }] : []),
          ...(this.user.lockoutEnd ? [{ label: 'Lockout End', value: this.user.lockoutEnd, type: 'date' as const }] : []),
        ],
      },
    ]);
  }

  ngOnInit(): void {
    this.updateFormData();
  }

  ngAfterViewInit(): void {
    this.updateSections();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] || changes['mode']) {
      this.updateFormData();
    }
    if (changes['user'] && this.rolesTemplate) {
      this.updateSections();
    }
  }

  updateFormData(): void {
    if (this.user) {
      this.formData = {
        userName: this.user.userName,
        email: this.user.email,
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        phoneNumber: this.user.phoneNumber || '',
        roles: this.user.roles,
        isActive: this.user.isActive,
      };
    }
  }

  getStatusVariant(isActive: boolean): BadgeVariant {
    return isActive ? 'success' : 'secondary';
  }

  onFormSubmit(data: Record<string, unknown>): void {
    if (!this.user) return;

    const confirm$ = this.dialogService.confirm({
      title: 'Confirm Update',
      message: `Update user "${data['userName']}"?`,
      confirmText: 'Update',
      cancelText: 'Cancel',
      confirmVariant: 'primary',
      icon: 'save',
    });

    confirm$.pipe(
      first(),
      filter((confirmed: boolean) => confirmed)
    ).subscribe(() => {
      this.loading.set(true);

      const userId = parseInt(this.user!.id, 10);
      const roles = data['roles'] as string[] || [];
      const role = roles.length > 0 ? roles[0] : this.user!.roles?.[0] || 'User';

      const updateUserData = {
        username: data['userName'] as string || undefined,
        email: data['email'] as string || undefined,
        phoneNumber: data['phoneNumber'] as string || undefined,
        role: role,
        firstName: data['firstName'] as string || undefined,
        lastName: data['lastName'] as string || undefined,
        departmentId: undefined, // Can be added later if needed
        positionId: undefined, // Can be added later if needed
      };

      this.userService.updateUser(userId, updateUserData).pipe(
        first(),
        catchError(err => {
          this.loading.set(false);
          this.notificationService.error('Update User Failed', err.message || 'Failed to update user.', { duration: 5000 });
          return of(null);
        })
      ).subscribe(updatedUser => {
        if (updatedUser) {
          this.loading.set(false);
          this.notificationService.success('User Updated', `User "${data['userName']}" updated successfully!`, { duration: 3000 });
          this.userUpdated.emit();
          this.onClose();
        }
      });
    });
  }

  onClose(): void {
    this.closeEvent.emit();
  }

  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
