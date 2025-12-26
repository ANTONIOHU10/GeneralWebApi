// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/permissions/add-permission/add-permission.component.ts
import { Component, inject, OnDestroy, OnInit, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil, filter, take, distinctUntilChanged } from 'rxjs/operators';
import {
  BaseFormComponent,
  FormConfig,
  SelectOption,
} from '../../../Shared/components/base';
import { DialogService, NotificationService } from '../../../Shared/services';
import { PermissionService } from '../../../core/services/permission.service';
import { TranslationService } from '@core/services/translation.service';
import { TranslatePipe } from '@core/pipes/translate.pipe';

@Component({
  selector: 'app-add-permission',
  standalone: true,
  imports: [
    CommonModule,
    BaseFormComponent,
    TranslatePipe,
  ],
  templateUrl: './add-permission.component.html',
  styleUrls: ['./add-permission.component.scss'],
})
export class AddPermissionComponent implements OnInit, OnDestroy {
  private dialogService = inject(DialogService);
  private notificationService = inject(NotificationService);
  private permissionService = inject(PermissionService);
  private translationService = inject(TranslationService);
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
    sections: [],
    layout: { columns: 2, gap: '1.5rem', sectionGap: '2rem', labelPosition: 'top', showSectionDividers: true },
    fields: [],
    submitButtonText: '',
    cancelButtonText: '',
    submitButtonVariant: 'primary',
    cancelButtonVariant: 'secondary',
  };

  /**
   * Initialize form config with translations
   */
  private initializeFormConfig(): void {
    const sectionTitle = this.translationService.translate('permissions.add.sections.permissionInfo');

    this.formConfig = {
      sections: [{ title: sectionTitle, description: this.translationService.translate('permissions.add.sections.permissionInfoDescription'), order: 0 }],
      layout: { columns: 2, gap: '1.5rem', sectionGap: '2rem', labelPosition: 'top', showSectionDividers: true },
      fields: [
        { key: 'name', type: 'input', label: this.translationService.translate('permissions.add.fields.name'), placeholder: this.translationService.translate('permissions.add.fields.namePlaceholder'), required: false, section: sectionTitle, order: 0, colSpan: 2, hint: this.translationService.translate('permissions.add.fields.nameHint'), readonly: true },
        { key: 'description', type: 'textarea', label: this.translationService.translate('permissions.add.fields.description'), placeholder: this.translationService.translate('permissions.add.fields.descriptionPlaceholder'), required: false, section: sectionTitle, order: 1, colSpan: 2, rows: 3 },
        { key: 'resource', type: 'select', label: this.translationService.translate('permissions.add.fields.resource'), placeholder: this.translationService.translate('permissions.add.fields.resourcePlaceholder'), required: true, section: sectionTitle, order: 2, colSpan: 1, options: this.resourceOptions },
        { key: 'action', type: 'select', label: this.translationService.translate('permissions.add.fields.action'), placeholder: this.translationService.translate('permissions.add.fields.actionPlaceholder'), required: true, section: sectionTitle, order: 3, colSpan: 1, options: this.actionOptions },
        { key: 'category', type: 'select', label: this.translationService.translate('permissions.add.fields.category'), placeholder: this.translationService.translate('permissions.add.fields.categoryPlaceholder'), required: true, section: sectionTitle, order: 4, colSpan: 1, options: this.categoryOptions },
      ],
      submitButtonText: this.translationService.translate('common.add'),
      cancelButtonText: this.translationService.translate('common.cancel'),
      submitButtonVariant: 'primary',
      cancelButtonVariant: 'secondary',
    };
  }

  ngOnInit(): void {
    // Wait for translations to load before initializing form config
    this.translationService.getTranslationsLoaded$().pipe(
      distinctUntilChanged(),
      filter(loaded => loaded),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.initializeFormConfig();
    });
  }

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
      this.notificationService.error(
        this.translationService.translate('common.validationError'),
        this.translationService.translate('permissions.add.messages.selectResourceAction'),
        { duration: 5000 }
      );
      return;
    }

    const confirm$ = this.dialogService.confirm({
      title: this.translationService.translate('permissions.add.confirmTitle'),
      message: this.translationService.translate('permissions.add.confirmMessage', { name }),
      confirmText: this.translationService.translate('common.add'),
      cancelText: this.translationService.translate('common.cancel'),
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

