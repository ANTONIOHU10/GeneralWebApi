// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/roles/role-detail/role-detail.component.ts
import { 
  Component, Input, Output, EventEmitter, 
  OnInit, OnChanges, AfterViewInit, OnDestroy,
  inject, signal, TemplateRef, ViewChild, ChangeDetectorRef
} from '@angular/core';
import type { SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { of, Subject } from 'rxjs';
import { filter, first, catchError, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Role } from '../../../roles/role.model';
import {
  BaseDetailComponent,
  BaseFormComponent,
  BaseBadgeComponent,
  DetailSection,
  FormConfig,
  SelectOption,
  BadgeVariant,
} from '../../../Shared/components/base';
import { TranslatePipe } from '@core/pipes/translate.pipe';
import { TranslationService } from '@core/services/translation.service';
import { DialogService, NotificationService } from '../../../Shared/services';
import { RoleService, Role as BackendRole } from '../../../core/services/role.service';

@Component({
  selector: 'app-role-detail',
  standalone: true,
  imports: [
    CommonModule,
    BaseDetailComponent,
    BaseFormComponent,
    BaseBadgeComponent,
    TranslatePipe,
  ],
  templateUrl: './role-detail.component.html',
  styleUrls: ['./role-detail.component.scss'],
})
export class RoleDetailComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  private dialogService = inject(DialogService);
  private notificationService = inject(NotificationService);
  private roleService = inject(RoleService);
  private translationService = inject(TranslationService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  @Input() role: Role | null = null;
  @Input() isOpen = false;
  @Input() mode: 'edit' | 'view' = 'view';
  
  fullRoleDetails = signal<BackendRole | null>(null);

  @Output() closeEvent = new EventEmitter<void>();
  @Output() roleUpdated = new EventEmitter<void>();

  @ViewChild('editFormTemplate') editFormTemplate!: TemplateRef<any>;
  @ViewChild('permissionsTemplate') permissionsTemplate!: TemplateRef<any>;
  @ViewChild('descriptionContent') descriptionContent!: TemplateRef<any>;

  loading = signal(false);
  formData: Record<string, unknown> = {};

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

  // Form configuration - will be initialized with translations
  formConfig: FormConfig = {
    sections: [
      {
        title: 'Role Information',
        description: 'Role basic information',
        order: 0,
      },
      {
        title: 'Permissions',
        description: 'Role permissions',
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

  sections = signal<DetailSection[]>([]);

  /**
   * Initialize form config with translations
   */
  private initializeFormConfig(): void {
    const t = (key: string) => this.translationService.translate(key);
    
    // Get section titles
    const roleInfoSection = t('roles.detail.sections.roleInformation');
    const permissionsSection = t('roles.detail.sections.permissions');

    this.formConfig = {
      sections: [
        {
          title: roleInfoSection,
          description: t('roles.form.roleInformationDescription'),
          order: 0,
        },
        {
          title: permissionsSection,
          description: t('roles.form.permissionsDescription'),
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
          label: t('roles.detail.fields.name'),
          placeholder: t('roles.detail.fields.namePlaceholder'),
          required: true,
          section: roleInfoSection,
          order: 0,
          colSpan: 2,
        },
        {
          key: 'description',
          type: 'textarea',
          label: t('roles.detail.fields.description'),
          placeholder: t('roles.detail.fields.descriptionPlaceholder'),
          required: false,
          section: roleInfoSection,
          order: 1,
          colSpan: 2,
          rows: 3,
        },
        {
          key: 'permissions',
          type: 'select',
          label: t('roles.detail.fields.permissions'),
          placeholder: t('roles.detail.fields.permissionsPlaceholder'),
          required: false,
          section: permissionsSection,
          order: 0,
          colSpan: 2,
          multiple: true,
          searchable: true,
          options: this.permissionOptions,
        },
      ],
      submitButtonText: t('roles.detail.buttons.updateRole'),
      cancelButtonText: t('roles.detail.buttons.cancel'),
    };
    this.cdr.markForCheck();
  }

  /**
   * Get modal title based on mode
   */
  getModalTitle(): string {
    if (this.mode === 'edit') {
      return this.translationService.translate('roles.detail.title.edit');
    }
    return this.translationService.translate('roles.detail.title.view');
  }

  private updateSections(): void {
    if (!this.role || !this.permissionsTemplate) {
      this.sections.set([]);
      return;
    }
    const t = (key: string) => this.translationService.translate(key);
    
    this.sections.set([
      {
        title: t('roles.detail.sections.roleInformation'),
        fields: [
          { label: t('roles.detail.viewFields.roleName'), value: this.role.name, type: 'text' },
          { label: t('roles.detail.viewFields.type'), value: this.role.isSystemRole ? t('roles.type.system') : t('roles.type.custom'), type: 'badge', badgeVariant: this.getTypeVariant(this.role.isSystemRole) },
          { label: t('roles.detail.viewFields.users'), value: this.role.userCount, type: 'text' },
          { label: t('roles.detail.viewFields.createdAt'), value: this.role.createdAt, type: 'date' },
          ...(this.role.updatedAt ? [{ label: t('roles.detail.viewFields.updatedAt'), value: this.role.updatedAt, type: 'date' as const }] : []),
        ],
        customContent: this.role.description ? this.descriptionContent : undefined,
      },
      {
        title: t('roles.detail.sections.permissions'),
        fields: [
          { label: t('roles.detail.viewFields.permissions'), value: null, type: 'custom' as const, customTemplate: this.permissionsTemplate },
        ],
      },
    ]);
  }

  ngOnInit(): void {
    // Wait for translations to load before initializing form config
    this.translationService.getTranslationsLoaded$().pipe(
      distinctUntilChanged(),
      filter(loaded => loaded),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.initializeFormConfig();
      this.updateFormData();
    });
  }

  ngAfterViewInit(): void {
    // Wait for translations to load before updating sections
    this.translationService.getTranslationsLoaded$().pipe(
      distinctUntilChanged(),
      filter(loaded => loaded),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.updateSections();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['role'] || changes['mode']) {
      this.updateFormData();
      // Load full role details when viewing/editing
      if (this.role && this.isOpen) {
        this.loadFullRoleDetails();
      }
    }
    if (changes['role'] && this.permissionsTemplate) {
      // Wait for translations to load before updating sections
      this.translationService.getTranslationsLoaded$().pipe(
        distinctUntilChanged(),
        filter(loaded => loaded),
        takeUntil(this.destroy$)
      ).subscribe(() => {
        this.updateSections();
      });
    }
  }

  loadFullRoleDetails(): void {
    if (!this.role) return;
    const roleId = parseInt(this.role.id, 10);
    this.roleService.getRole(roleId).pipe(
      first(),
      catchError(err => {
        this.notificationService.error(
          this.translationService.translate('roles.detail.notifications.loadFailed'),
          err.message || this.translationService.translate('roles.detail.notifications.loadFailedMessage'),
          { duration: 5000 }
        );
        return of(null);
      })
    ).subscribe(backendRole => {
      if (backendRole) {
        this.fullRoleDetails.set(backendRole);
        // Update the role with full details including permissions
        if (this.role) {
          this.role.permissions = backendRole.permissions.map(p => p.name);
        }
        this.updateSections();
      }
    });
  }

  updateFormData(): void {
    if (this.role) {
      this.formData = {
        name: this.role.name,
        description: this.role.description || '',
        permissions: this.role.permissions,
      };
    }
  }

  getTypeVariant(isSystemRole: boolean): BadgeVariant {
    return isSystemRole ? 'primary' : 'secondary';
  }

  onFormSubmit(data: Record<string, unknown>): void {
    if (!this.role) return;

    const roleName = (data['name'] as string) || 'Unknown';
    const confirm$ = this.dialogService.confirm({
      title: this.translationService.translate('roles.detail.confirm.title'),
      message: this.translationService.translate('roles.detail.confirm.message', { name: roleName }),
      confirmText: this.translationService.translate('roles.detail.confirm.confirmText'),
      cancelText: this.translationService.translate('roles.detail.confirm.cancelText'),
      confirmVariant: 'primary',
      icon: 'save',
    });

    confirm$.pipe(
      first(),
      filter((confirmed: boolean) => confirmed)
    ).subscribe(() => {
      this.loading.set(true);

      const roleId = parseInt(this.role!.id, 10);
      const permissions = data['permissions'] as string[] || [];
      const updateRoleData = {
        name: data['name'] as string,
        description: data['description'] as string || undefined,
        permissionIds: [] as number[], // Will need to map permission names to IDs if needed
      };

      this.roleService.updateRole(roleId, updateRoleData).pipe(
        first(),
      catchError(err => {
        this.loading.set(false);
        this.notificationService.error(
          this.translationService.translate('roles.detail.notifications.updateFailed'),
          err.message || this.translationService.translate('roles.detail.notifications.updateFailedMessage'),
          { duration: 5000 }
        );
        return of(null);
      })
    ).subscribe(updatedRole => {
      if (updatedRole) {
        this.loading.set(false);
        const roleName = (data['name'] as string) || 'Unknown';
        this.notificationService.success(
          this.translationService.translate('roles.detail.notifications.updateSuccess'),
          this.translationService.translate('roles.detail.notifications.updateSuccessMessage', { name: roleName }),
          { duration: 3000 }
        );
        this.roleUpdated.emit();
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
