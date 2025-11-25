// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/users/add-user/add-user.component.ts
import { Component, inject, OnDestroy, OnInit, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, delay, of } from 'rxjs';
import { takeUntil, filter, take } from 'rxjs/operators';
import {
  BaseFormComponent,
  FormConfig,
  SelectOption,
} from '../../../Shared/components/base';
import { DialogService, NotificationService } from '../../../Shared/services';
import { CreateUserRequest } from '../../../users/user.model';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [
    CommonModule,
    BaseFormComponent,
  ],
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss'],
})
export class AddUserComponent implements OnInit, OnDestroy {
  private dialogService = inject(DialogService);
  private notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();

  @Output() userCreated = new EventEmitter<void>();

  loading = signal(false);

  formData: Record<string, unknown> = {
    userName: '',
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    roles: [],
    isActive: true,
  };

  roleOptions: SelectOption[] = [
    { value: 'Admin', label: 'Admin' },
    { value: 'Manager', label: 'Manager' },
    { value: 'User', label: 'User' },
  ];

  formConfig: FormConfig = {
    sections: [
      {
        title: 'User Information',
        description: 'Enter user basic information',
        order: 0,
      },
      {
        title: 'Account Settings',
        description: 'Configure account settings',
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
        key: 'password',
        type: 'input',
        label: 'Password',
        placeholder: 'Enter password',
        required: true,
        section: 'Account Settings',
        order: 0,
        colSpan: 1,
        inputType: 'password',
      },
      {
        key: 'confirmPassword',
        type: 'input',
        label: 'Confirm Password',
        placeholder: 'Confirm password',
        required: true,
        section: 'Account Settings',
        order: 1,
        colSpan: 1,
        inputType: 'password',
      },
      {
        key: 'roles',
        type: 'select',
        label: 'Roles',
        placeholder: 'Select roles',
        required: false,
        section: 'Account Settings',
        order: 2,
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
        order: 3,
        colSpan: 1,
      },
    ],
  };

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFormSubmit(data: Record<string, unknown>): void {
    if (data['password'] !== data['confirmPassword']) {
      this.notificationService.error('Validation Error', 'Passwords do not match', { duration: 5000 });
      return;
    }

    const confirm$ = this.dialogService.confirm({
      title: 'Confirm Add User',
      message: `Add user "${data['userName']}"?`,
      confirmText: 'Add',
      cancelText: 'Cancel',
      confirmVariant: 'primary',
      icon: 'add',
    });

    confirm$.pipe(
      take(1),
      filter((confirmed: boolean) => confirmed),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.loading.set(true);

      of(true).pipe(
        delay(1000),
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.loading.set(false);
          this.notificationService.success('User Added', `User "${data['userName']}" added successfully!`, { duration: 3000 });
          this.userCreated.emit();
          this.onFormCancel();
        },
        error: (err) => {
          this.loading.set(false);
          this.notificationService.error('Add User Failed', err.message || 'Failed to add user.', { duration: 5000 });
        }
      });
    });
  }

  onFormCancel(): void {
    this.formData = {
      userName: '',
      email: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      roles: [],
      isActive: true,
    };
  }
}

