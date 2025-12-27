// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/users/user-detail/user-detail.component.ts
import { 
  Component, Input, Output, EventEmitter, 
  OnInit, OnChanges, AfterViewInit, OnDestroy,
  inject, signal, TemplateRef, ViewChild, ChangeDetectorRef
} from '@angular/core';
import type { SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { of, Subject } from 'rxjs';
import { filter, first, catchError, distinctUntilChanged, takeUntil } from 'rxjs/operators';
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
import { TranslationService } from '@core/services/translation.service';
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
export class UserDetailComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  private dialogService = inject(DialogService);
  private notificationService = inject(NotificationService);
  private userService = inject(UserService);
  private translationService = inject(TranslationService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

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

  // Form configuration - will be initialized with translations
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

  /**
   * Initialize form config with translations
   */
  private initializeFormConfig(): void {
    const t = (key: string) => this.translationService.translate(key);
    
    // Get section titles
    const userInfoSection = t('users.detail.sections.userInformation');
    const accountSettingsSection = t('users.detail.sections.accountSettings');

    // Get role options with translations
    const roleOptions: SelectOption[] = [
      { value: 'Admin', label: t('employees.detail.options.role.admin') },
      { value: 'Manager', label: t('employees.detail.options.role.manager') },
      { value: 'User', label: t('employees.detail.options.role.user') },
    ];

    this.formConfig = {
      sections: [
        {
          title: userInfoSection,
          description: t('users.add.sections.userInfoDescription'),
          order: 0,
        },
        {
          title: accountSettingsSection,
          description: t('users.add.sections.accountSettingsDescription'),
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
          label: t('users.detail.fields.username'),
          placeholder: t('users.detail.fields.usernamePlaceholder'),
          required: true,
          section: userInfoSection,
          order: 0,
          colSpan: 1,
        },
        {
          key: 'email',
          type: 'input',
          label: t('users.detail.fields.email'),
          placeholder: t('users.detail.fields.emailPlaceholder'),
          required: true,
          section: userInfoSection,
          order: 1,
          colSpan: 1,
          inputType: 'email',
        },
        {
          key: 'firstName',
          type: 'input',
          label: t('users.detail.fields.firstName'),
          placeholder: t('users.detail.fields.firstNamePlaceholder'),
          required: true,
          section: userInfoSection,
          order: 2,
          colSpan: 1,
        },
        {
          key: 'lastName',
          type: 'input',
          label: t('users.detail.fields.lastName'),
          placeholder: t('users.detail.fields.lastNamePlaceholder'),
          required: true,
          section: userInfoSection,
          order: 3,
          colSpan: 1,
        },
        {
          key: 'phoneNumber',
          type: 'input',
          label: t('users.detail.fields.phoneNumber'),
          placeholder: t('users.detail.fields.phoneNumberPlaceholder'),
          required: false,
          section: userInfoSection,
          order: 4,
          colSpan: 1,
          inputType: 'tel',
        },
        {
          key: 'roles',
          type: 'select',
          label: t('users.detail.fields.roles'),
          placeholder: t('users.detail.fields.rolesPlaceholder'),
          required: false,
          section: accountSettingsSection,
          order: 0,
          colSpan: 2,
          multiple: true,
          options: roleOptions,
        },
        {
          key: 'isActive',
          type: 'checkbox',
          label: t('users.detail.fields.active'),
          required: false,
          section: accountSettingsSection,
          order: 1,
          colSpan: 1,
        },
      ],
      submitButtonText: t('users.detail.buttons.updateUser'),
      cancelButtonText: t('users.detail.buttons.cancel'),
    };
    this.cdr.markForCheck();
  }

  /**
   * Get modal title based on mode
   */
  getModalTitle(): string {
    if (this.mode === 'edit') {
      return this.translationService.translate('users.detail.title.edit');
    }
    return this.translationService.translate('users.detail.title.view');
  }

  private updateSections(): void {
    if (!this.user || !this.rolesTemplate) {
      this.sections.set([]);
      return;
    }
    const t = (key: string) => this.translationService.translate(key);
    
    this.sections.set([
      {
        title: t('users.detail.sections.userInformation'),
        fields: [
          { label: t('users.detail.viewFields.username'), value: this.user.userName, type: 'text' },
          { label: t('users.detail.viewFields.email'), value: this.user.email, type: 'text' },
          { label: t('users.detail.viewFields.firstName'), value: this.user.firstName, type: 'text' },
          { label: t('users.detail.viewFields.lastName'), value: this.user.lastName, type: 'text' },
          { label: t('users.detail.viewFields.phoneNumber'), value: this.user.phoneNumber || 'N/A', type: 'text' },
          { label: t('users.detail.viewFields.status'), value: this.user.isActive ? t('users.detail.options.active') : t('users.detail.options.inactive'), type: 'badge', badgeVariant: this.getStatusVariant(this.user.isActive) },
          { label: t('users.detail.viewFields.emailConfirmed'), value: this.user.emailConfirmed ? t('users.detail.options.yes') : t('users.detail.options.no'), type: 'badge', badgeVariant: this.user.emailConfirmed ? 'success' : 'secondary' },
          { label: t('users.detail.viewFields.roles'), value: null, type: 'custom' as const, customTemplate: this.rolesTemplate },
          { label: t('users.detail.viewFields.createdAt'), value: this.user.createdAt, type: 'date' },
          ...(this.user.updatedAt ? [{ label: t('users.detail.viewFields.updatedAt'), value: this.user.updatedAt, type: 'date' as const }] : []),
          ...(this.user.lastLoginAt ? [{ label: t('users.detail.viewFields.lastLogin'), value: this.user.lastLoginAt, type: 'date' as const }] : []),
          ...(this.user.lockoutEnd ? [{ label: t('users.detail.viewFields.lockoutEnd'), value: this.user.lockoutEnd, type: 'date' as const }] : []),
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
    if (changes['user'] || changes['mode']) {
      this.updateFormData();
    }
    if (changes['user'] && this.rolesTemplate) {
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

    const userName = (data['userName'] as string) || 'Unknown';
    const confirm$ = this.dialogService.confirm({
      title: this.translationService.translate('users.detail.confirm.title'),
      message: this.translationService.translate('users.detail.confirm.message', { name: userName }),
      confirmText: this.translationService.translate('users.detail.confirm.confirmText'),
      cancelText: this.translationService.translate('users.detail.confirm.cancelText'),
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
          this.notificationService.error(
            this.translationService.translate('users.detail.notifications.updateFailed'),
            err.message || this.translationService.translate('users.detail.notifications.updateFailedMessage'),
            { duration: 5000 }
          );
          return of(null);
        })
      ).subscribe(updatedUser => {
        if (updatedUser) {
          this.loading.set(false);
          const userName = (data['userName'] as string) || 'Unknown';
          this.notificationService.success(
            this.translationService.translate('users.detail.notifications.updateSuccess'),
            this.translationService.translate('users.detail.notifications.updateSuccessMessage', { name: userName }),
            { duration: 3000 }
          );
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
