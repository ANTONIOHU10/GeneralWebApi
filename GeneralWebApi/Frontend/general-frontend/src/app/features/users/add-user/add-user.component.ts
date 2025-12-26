// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/users/add-user/add-user.component.ts
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
import { TranslatePipe } from '@core/pipes/translate.pipe';
import { CreateUserRequest } from '../../../users/user.model';
import { UserService } from '../../../core/services/user.service';
import { RoleService, RoleList } from '../../../core/services/role.service';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [
    CommonModule,
    BaseFormComponent,
    TranslatePipe,
  ],
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss'],
})
export class AddUserComponent implements OnInit, OnDestroy {
  private dialogService = inject(DialogService);
  private notificationService = inject(NotificationService);
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private translationService = inject(TranslationService);
  private destroy$ = new Subject<void>();

  @Output() userCreated = new EventEmitter<void>();

  loading = signal(false);
  rolesLoading = signal(false);
  fieldLoading: Record<string, boolean> = {}; // For BaseFormComponent fieldLoading input

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

  roleOptions: SelectOption[] = [];

  formConfig: FormConfig = {
    sections: [],
    layout: { columns: 2, gap: '1.5rem', sectionGap: '2rem', labelPosition: 'top', showSectionDividers: true },
    fields: [],
    submitButtonText: '',
    cancelButtonText: '',
    submitButtonVariant: 'primary',
    cancelButtonVariant: 'secondary',
  };

  rolesLoaded = false; // Track if roles have been loaded

  /**
   * Initialize form config with translations
   */
  private initializeFormConfig(): void {
    const userInfoSection = this.translationService.translate('users.add.sections.userInfo');
    const accountSettingsSection = this.translationService.translate('users.add.sections.accountSettings');

    this.formConfig = {
      sections: [
        { title: userInfoSection, description: this.translationService.translate('users.add.sections.userInfoDescription'), order: 0 },
        { title: accountSettingsSection, description: this.translationService.translate('users.add.sections.accountSettingsDescription'), order: 1 },
      ],
      layout: { columns: 2, gap: '1.5rem', sectionGap: '2rem', labelPosition: 'top', showSectionDividers: true },
      fields: [
        { key: 'userName', type: 'input', label: this.translationService.translate('users.add.fields.username'), placeholder: this.translationService.translate('users.add.fields.usernamePlaceholder'), required: true, section: userInfoSection, order: 0, colSpan: 1 },
        { key: 'email', type: 'input', label: this.translationService.translate('users.add.fields.email'), placeholder: this.translationService.translate('users.add.fields.emailPlaceholder'), required: true, section: userInfoSection, order: 1, colSpan: 1, inputType: 'email' },
        { key: 'firstName', type: 'input', label: this.translationService.translate('users.add.fields.firstName'), placeholder: this.translationService.translate('users.add.fields.firstNamePlaceholder'), required: true, section: userInfoSection, order: 2, colSpan: 1 },
        { key: 'lastName', type: 'input', label: this.translationService.translate('users.add.fields.lastName'), placeholder: this.translationService.translate('users.add.fields.lastNamePlaceholder'), required: true, section: userInfoSection, order: 3, colSpan: 1 },
        { key: 'phoneNumber', type: 'input', label: this.translationService.translate('users.add.fields.phone'), placeholder: this.translationService.translate('users.add.fields.phonePlaceholder'), required: false, section: userInfoSection, order: 4, colSpan: 1, inputType: 'tel' },
        { key: 'password', type: 'input', label: this.translationService.translate('users.add.fields.password'), placeholder: this.translationService.translate('users.add.fields.passwordPlaceholder'), required: true, section: accountSettingsSection, order: 0, colSpan: 1, inputType: 'password' },
        { key: 'confirmPassword', type: 'input', label: this.translationService.translate('users.add.fields.confirmPassword'), placeholder: this.translationService.translate('users.add.fields.confirmPasswordPlaceholder'), required: true, section: accountSettingsSection, order: 1, colSpan: 1, inputType: 'password' },
        { key: 'roles', type: 'select', label: this.translationService.translate('users.add.fields.roles'), placeholder: this.translationService.translate('users.add.fields.rolesPlaceholder'), required: false, section: accountSettingsSection, order: 2, colSpan: 2, multiple: true, options: this.roleOptions },
        { key: 'isActive', type: 'checkbox', label: this.translationService.translate('users.add.fields.isActive'), required: false, section: accountSettingsSection, order: 3, colSpan: 1 },
      ],
      submitButtonText: this.translationService.translate('users.add.submitButton'),
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

  onFieldDropdownOpen(event: { key: string }): void {
    // Load roles when the roles dropdown is opened for the first time
    if (event.key === 'roles' && !this.rolesLoaded) {
      this.loadRoles();
    }
  }

  loadRoles(): void {
    if (this.rolesLoaded) return; // Don't reload if already loaded

    this.rolesLoading.set(true);
    this.fieldLoading['roles'] = true; // Set loading state for BaseFormComponent
    
    this.roleService.getRoles().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (roles: RoleList[]) => {
        this.roleOptions = roles.map(role => ({
          value: role.name,
          label: role.name
        }));
        // Update formConfig to reflect new options
        const rolesField = this.formConfig.fields.find(f => f.key === 'roles');
        if (rolesField) {
          rolesField.options = this.roleOptions;
        }
        this.rolesLoaded = true;
        this.rolesLoading.set(false);
        this.fieldLoading['roles'] = false;
      },
      error: (err) => {
        this.notificationService.error('Load Roles Failed', err.message || 'Failed to load roles', { duration: 5000 });
        this.rolesLoading.set(false);
        this.fieldLoading['roles'] = false;
        // Fallback to default roles if API fails
        this.roleOptions = [
          { value: 'Admin', label: 'Admin' },
          { value: 'Manager', label: 'Manager' },
          { value: 'User', label: 'User' },
        ];
        const rolesField = this.formConfig.fields.find(f => f.key === 'roles');
        if (rolesField) {
          rolesField.options = this.roleOptions;
        }
        this.rolesLoaded = true;
      }
    });
  }

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

      // Prepare request data matching backend CreateUserRequest DTO
      const roles = data['roles'] as string[] || [];
      const role = roles.length > 0 ? roles[0] : 'User'; // Use first role or default to 'User'

      const createUserData = {
        username: data['userName'] as string,
        email: data['email'] as string,
        password: data['password'] as string,
        phoneNumber: data['phoneNumber'] as string || undefined,
        role: role,
        firstName: data['firstName'] as string || undefined,
        lastName: data['lastName'] as string || undefined,
        departmentId: undefined, // Can be added later if needed
        positionId: undefined, // Can be added later if needed
      };

      this.userService.createUser(createUserData).pipe(
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

