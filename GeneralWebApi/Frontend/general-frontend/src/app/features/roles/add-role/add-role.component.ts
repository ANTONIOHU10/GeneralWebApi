// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/roles/add-role/add-role.component.ts
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
import { TranslationService } from '@core/services/translation.service';
import { CreateRoleRequest } from '../../../roles/role.model';
import { RoleService } from '../../../core/services/role.service';
import { PermissionService, PermissionList } from '../../../core/services/permission.service';

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
  private roleService = inject(RoleService);
  private permissionService = inject(PermissionService);
  private translationService = inject(TranslationService);
  private destroy$ = new Subject<void>();

  @Output() roleCreated = new EventEmitter<void>();

  loading = signal(false);
  permissionsLoading = signal(false);
  permissionsLoaded = false; // Track if permissions have been loaded
  fieldLoading: Record<string, boolean> = {}; // Track loading state for each field
  permissionMap: Map<string, number> = new Map(); // Map permission names to IDs

  formData: Record<string, unknown> = {
    name: '',
    description: '',
    permissions: [],
  };

  permissionOptions: SelectOption[] = []; // Will be loaded from backend

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
    const roleInfoSection = this.translationService.translate('roles.form.roleInformation');
    const permissionsSection = this.translationService.translate('roles.form.permissions');

    this.formConfig = {
      sections: [
        { title: roleInfoSection, description: this.translationService.translate('roles.form.roleInformationDescription'), order: 0 },
        { title: permissionsSection, description: this.translationService.translate('roles.form.permissionsDescription'), order: 1 },
      ],
      layout: { columns: 2, gap: '1.5rem', sectionGap: '2rem', labelPosition: 'top', showSectionDividers: true },
      fields: [
        { key: 'name', type: 'input', label: this.translationService.translate('roles.form.name'), placeholder: this.translationService.translate('roles.form.namePlaceholder'), required: true, section: roleInfoSection, order: 0, colSpan: 2 },
        { key: 'description', type: 'textarea', label: this.translationService.translate('roles.form.description'), placeholder: this.translationService.translate('roles.form.descriptionPlaceholder'), required: false, section: roleInfoSection, order: 1, colSpan: 2, rows: 3 },
        { key: 'permissions', type: 'select', label: this.translationService.translate('roles.form.permissions'), placeholder: this.translationService.translate('roles.form.permissionsPlaceholder'), required: false, section: permissionsSection, order: 0, colSpan: 2, multiple: true, searchable: true, options: this.permissionOptions },
      ],
      submitButtonText: this.translationService.translate('roles.form.submitButton'),
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

  onFieldDropdownOpen(event: { key: string }): void {
    // Load permissions when the permissions dropdown is opened for the first time
    if (event.key === 'permissions' && !this.permissionsLoaded) {
      this.loadPermissions();
    }
  }

  loadPermissions(): void {
    if (this.permissionsLoaded) return; // Don't reload if already loaded

    this.permissionsLoading.set(true);
    this.fieldLoading['permissions'] = true; // Set loading state for BaseFormComponent
    
    this.permissionService.getPermissions().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (permissions: PermissionList[]) => {
        // Build permission map (name -> id) for later conversion
        this.permissionMap.clear();
        permissions.forEach(permission => {
          this.permissionMap.set(permission.name, permission.id);
        });

        this.permissionOptions = permissions.map(permission => ({
          value: permission.name,
          label: permission.name
        }));
        // Update formConfig to reflect new options
        const permissionsField = this.formConfig.fields.find(f => f.key === 'permissions');
        if (permissionsField) {
          permissionsField.options = this.permissionOptions;
        }
        this.permissionsLoaded = true;
        this.permissionsLoading.set(false);
        this.fieldLoading['permissions'] = false;
      },
      error: (err) => {
        this.notificationService.error('Load Permissions Failed', err.message || 'Failed to load permissions', { duration: 5000 });
        this.permissionsLoading.set(false);
        this.fieldLoading['permissions'] = false;
        // Fallback to empty array if API fails
        this.permissionOptions = [];
        const permissionsField = this.formConfig.fields.find(f => f.key === 'permissions');
        if (permissionsField) {
          permissionsField.options = this.permissionOptions;
        }
      }
    });
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

      const permissionNames = data['permissions'] as string[] || [];
      // Convert permission names to IDs
      const permissionIds = permissionNames
        .map(name => this.permissionMap.get(name))
        .filter((id): id is number => id !== undefined);

      const createRoleData = {
        name: data['name'] as string,
        description: data['description'] as string || undefined,
        permissionIds: permissionIds,
      };

      this.roleService.createRole(createRoleData).pipe(
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
    // Reset permissions loaded state so they can be reloaded next time
    this.permissionsLoaded = false;
    this.permissionMap.clear();
    this.permissionOptions = [];
  }
}

