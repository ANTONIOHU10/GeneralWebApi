// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/permissions/add-permission/add-permission.component.ts
import { Component, inject, OnDestroy, OnInit, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil, filter, take } from 'rxjs/operators';
import {
  BaseFormComponent,
  FormConfig,
  SelectOption,
} from '../../../Shared/components/base';
import { DialogService, NotificationService } from '../../../Shared/services';
import { PermissionService } from '../../../core/services/permission.service';

@Component({
  selector: 'app-add-permission',
  standalone: true,
  imports: [
    CommonModule,
    BaseFormComponent,
  ],
  templateUrl: './add-permission.component.html',
  styleUrls: ['./add-permission.component.scss'],
})
export class AddPermissionComponent implements OnInit, OnDestroy {
  private dialogService = inject(DialogService);
  private notificationService = inject(NotificationService);
  private permissionService = inject(PermissionService);
  private destroy$ = new Subject<void>();

  @Output() permissionCreated = new EventEmitter<void>();

  loading = signal(false);

  formData: Record<string, unknown> = {
    name: '',
    description: '',
    resource: '',
    action: '',
    category: '',
  };

  resourceOptions: SelectOption[] = [
    { value: 'Employees', label: 'Employees' },
    { value: 'Departments', label: 'Departments' },
    { value: 'Positions', label: 'Positions' },
    { value: 'Contracts', label: 'Contracts' },
    { value: 'Approvals', label: 'Approvals' },
    { value: 'Users', label: 'Users' },
    { value: 'Roles', label: 'Roles' },
    { value: 'Permissions', label: 'Permissions' },
    { value: 'System', label: 'System' },
  ];

  actionOptions: SelectOption[] = [
    { value: 'Create', label: 'Create' },
    { value: 'Read', label: 'Read' },
    { value: 'Update', label: 'Update' },
    { value: 'Delete', label: 'Delete' },
    { value: 'Assign', label: 'Assign' },
    { value: 'Approve', label: 'Approve' },
    { value: 'Export', label: 'Export' },
    { value: 'Admin', label: 'Admin' },
    { value: 'Config', label: 'Config' },
    { value: 'Audit', label: 'Audit' },
    { value: 'Manage', label: 'Manage' },
  ];

  categoryOptions: SelectOption[] = [
    { value: 'EmployeeManagement', label: 'Employee Management' },
    { value: 'RoleManagement', label: 'Role Management' },
    { value: 'PermissionManagement', label: 'Permission Management' },
    { value: 'DepartmentManagement', label: 'Department Management' },
    { value: 'PositionManagement', label: 'Position Management' },
    { value: 'ContractManagement', label: 'Contract Management' },
    { value: 'SystemAdministration', label: 'System Administration' },
    { value: 'UserManagement', label: 'User Management' },
  ];

  formConfig: FormConfig = {
    sections: [
      {
        title: 'Permission Information',
        description: 'Enter permission basic information',
        order: 0,
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
        label: 'Permission Name',
        placeholder: 'Auto-generated from Resource and Action',
        required: false, // Not required in form validation since it's auto-generated
        section: 'Permission Information',
        order: 0,
        colSpan: 2,
        hint: 'Auto-generated as Resource.Action (e.g., Employees.View)',
        readonly: true,
      },
      {
        key: 'description',
        type: 'textarea',
        label: 'Description',
        placeholder: 'Enter permission description',
        required: false,
        section: 'Permission Information',
        order: 1,
        colSpan: 2,
        rows: 3,
      },
      {
        key: 'resource',
        type: 'select',
        label: 'Resource',
        placeholder: 'Select resource',
        required: true,
        section: 'Permission Information',
        order: 2,
        colSpan: 1,
        options: this.resourceOptions,
      },
      {
        key: 'action',
        type: 'select',
        label: 'Action',
        placeholder: 'Select action',
        required: true,
        section: 'Permission Information',
        order: 3,
        colSpan: 1,
        options: this.actionOptions,
      },
      {
        key: 'category',
        type: 'select',
        label: 'Category',
        placeholder: 'Select category',
        required: true,
        section: 'Permission Information',
        order: 4,
        colSpan: 1,
        options: this.categoryOptions,
      },
    ],
  };

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFormSubmit(data: Record<string, unknown>): void {
    // Auto-generate name if not provided
    const resource = data['resource'] as string || '';
    const action = data['action'] as string || '';
    const name = (data['name'] as string) || (resource && action ? `${resource}.${action}` : '');

    if (!name) {
      this.notificationService.error('Validation Error', 'Please select Resource and Action to generate permission name', { duration: 5000 });
      return;
    }

    const confirm$ = this.dialogService.confirm({
      title: 'Confirm Add Permission',
      message: `Add permission "${name}"?`,
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

      const createPermissionData = {
        name: name,
        description: data['description'] as string || undefined,
        resource: resource,
        action: action,
        category: data['category'] as string,
      };

      this.permissionService.createPermission(createPermissionData).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.loading.set(false);
          this.notificationService.success('Permission Added', `Permission "${name}" added successfully!`, { duration: 3000 });
          this.permissionCreated.emit();
          this.onFormCancel();
        },
        error: (err) => {
          this.loading.set(false);
          this.notificationService.error('Add Permission Failed', err.message || 'Failed to add permission.', { duration: 5000 });
        }
      });
    });
  }

  onFormCancel(): void {
    this.formData = {
      name: '',
      description: '',
      resource: '',
      action: '',
      category: '',
    };
  }
}

