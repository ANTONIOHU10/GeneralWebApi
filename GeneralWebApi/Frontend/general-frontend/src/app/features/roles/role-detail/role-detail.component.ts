// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/roles/role-detail/role-detail.component.ts
import { 
  Component, Input, Output, EventEmitter, 
  OnInit, OnChanges, AfterViewInit, 
  inject, signal, TemplateRef, ViewChild 
} from '@angular/core';
import type { SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { delay, of } from 'rxjs';
import { filter, first } from 'rxjs/operators';
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
import { DialogService, NotificationService } from '../../../Shared/services';

@Component({
  selector: 'app-role-detail',
  standalone: true,
  imports: [
    CommonModule,
    BaseDetailComponent,
    BaseFormComponent,
    BaseBadgeComponent,
  ],
  templateUrl: './role-detail.component.html',
  styleUrls: ['./role-detail.component.scss'],
})
export class RoleDetailComponent implements OnInit, OnChanges, AfterViewInit {
  private dialogService = inject(DialogService);
  private notificationService = inject(NotificationService);

  @Input() role: Role | null = null;
  @Input() isOpen = false;
  @Input() mode: 'edit' | 'view' = 'view';

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

  private updateSections(): void {
    if (!this.role || !this.permissionsTemplate) {
      this.sections.set([]);
      return;
    }
    this.sections.set([
      {
        title: 'Role Information',
        fields: [
          { label: 'Role Name', value: this.role.name, type: 'text' },
          { label: 'Type', value: this.role.isSystemRole ? 'System' : 'Custom', type: 'badge', badgeVariant: this.getTypeVariant(this.role.isSystemRole) },
          { label: 'Users', value: this.role.userCount, type: 'text' },
          { label: 'Created At', value: this.role.createdAt, type: 'date' },
          ...(this.role.updatedAt ? [{ label: 'Updated At', value: this.role.updatedAt, type: 'date' as const }] : []),
        ],
        customContent: this.role.description ? this.descriptionContent : undefined,
      },
      {
        title: 'Permissions',
        fields: [
          { label: 'Permissions', value: null, type: 'custom' as const, customTemplate: this.permissionsTemplate },
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
    if (changes['role'] || changes['mode']) {
      this.updateFormData();
    }
    if (changes['role'] && this.permissionsTemplate) {
      this.updateSections();
    }
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

    const confirm$ = this.dialogService.confirm({
      title: 'Confirm Update',
      message: `Update role "${data['name']}"?`,
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

      of(true).pipe(
        delay(1000),
        first()
      ).subscribe({
        next: () => {
          this.loading.set(false);
          this.notificationService.success('Role Updated', `Role "${data['name']}" updated successfully!`, { duration: 3000 });
          this.roleUpdated.emit();
          this.onClose();
        },
        error: (err) => {
          this.loading.set(false);
          this.notificationService.error('Update Role Failed', err.message || 'Failed to update role.', { duration: 5000 });
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
