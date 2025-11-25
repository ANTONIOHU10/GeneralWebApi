// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/roles/add-role/add-role.component.ts
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
import { CreateRoleRequest } from '../../../roles/role.model';

@Component({
  selector: 'app-add-role',
  standalone: true,
  imports: [
    CommonModule,
    BaseFormComponent,
  ],
  templateUrl: './add-role.component.html',
  styleUrls: ['./add-role.component.scss'],
})
export class AddRoleComponent implements OnInit, OnDestroy {
  private dialogService = inject(DialogService);
  private notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();

  @Output() roleCreated = new EventEmitter<void>();

  loading = signal(false);

  formData: Record<string, unknown> = {
    name: '',
    description: '',
    permissions: [],
  };

  permissionOptions: SelectOption[] = [
    { value: 'Employees.View', label: 'Employees - View' },
    { value: 'Employees.Create', label: 'Employees - Create' },
    { value: 'Employees.Update', label: 'Employees - Update' },
    { value: 'Employees.Delete', label: 'Employees - Delete' },
    { value: 'Departments.View', label: 'Departments - View' },
    { value: 'Departments.Create', label: 'Departments - Create' },
    { value: 'Departments.Update', label: 'Departments - Update' },
    { value: 'Departments.Delete', label: 'Departments - Delete' },
    { value: 'Contracts.View', label: 'Contracts - View' },
    { value: 'Contracts.Create', label: 'Contracts - Create' },
    { value: 'Contracts.Update', label: 'Contracts - Update' },
    { value: 'Contracts.Delete', label: 'Contracts - Delete' },
    { value: 'Contracts.Approve', label: 'Contracts - Approve' },
    { value: 'Users.View', label: 'Users - View' },
    { value: 'Users.Create', label: 'Users - Create' },
    { value: 'Users.Update', label: 'Users - Update' },
    { value: 'Users.Delete', label: 'Users - Delete' },
    { value: 'Roles.View', label: 'Roles - View' },
    { value: 'Roles.Create', label: 'Roles - Create' },
    { value: 'Roles.Update', label: 'Roles - Update' },
    { value: 'Roles.Delete', label: 'Roles - Delete' },
  ];

  formConfig: FormConfig = {
    sections: [
      {
        title: 'Role Information',
        description: 'Enter role basic information',
        order: 0,
      },
      {
        title: 'Permissions',
        description: 'Select permissions for this role',
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
        key: 'name',
        type: 'input',
        label: 'Role Name',
        placeholder: 'Enter role name',
        required: true,
        section: 'Role Information',
        order: 0,
        colSpan: 2,
      },
      {
        key: 'description',
        type: 'textarea',
        label: 'Description',
        placeholder: 'Enter role description',
        required: false,
        section: 'Role Information',
        order: 1,
        colSpan: 2,
        rows: 3,
      },
      {
        key: 'permissions',
        type: 'select',
        label: 'Permissions',
        placeholder: 'Select permissions',
        required: false,
        section: 'Permissions',
        order: 0,
        colSpan: 2,
        multiple: true,
        searchable: true,
        options: this.permissionOptions,
      },
    ],
  };

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFormSubmit(data: Record<string, unknown>): void {
    const confirm$ = this.dialogService.confirm({
      title: 'Confirm Add Role',
      message: `Add role "${data['name']}"?`,
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
          this.notificationService.success('Role Added', `Role "${data['name']}" added successfully!`, { duration: 3000 });
          this.roleCreated.emit();
          this.onFormCancel();
        },
        error: (err) => {
          this.loading.set(false);
          this.notificationService.error('Add Role Failed', err.message || 'Failed to add role.', { duration: 5000 });
        }
      });
    });
  }

  onFormCancel(): void {
    this.formData = {
      name: '',
      description: '',
      permissions: [],
    };
  }
}

