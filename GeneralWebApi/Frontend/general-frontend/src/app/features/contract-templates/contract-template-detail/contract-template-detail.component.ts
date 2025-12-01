// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/contract-templates/contract-template-detail/contract-template-detail.component.ts
import { 
  Component, Input, Output, EventEmitter, 
  OnInit, OnChanges, AfterViewInit, 
  inject, signal, TemplateRef, ViewChild 
} from '@angular/core';
import type { SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { delay, of } from 'rxjs';
import { filter, first } from 'rxjs/operators';
import { ContractTemplate, CONTRACT_TEMPLATE_CATEGORIES } from 'app/contracts/contract-templates/contract-template.model';
import { CONTRACT_TYPES as CONTRACT_TYPE_OPTIONS } from 'app/contracts/contracts/contract.model';
import {
  BaseDetailComponent,
  BaseFormComponent,
  DetailSection,
  FormConfig,
  SelectOption,
  BadgeVariant,
} from '../../../Shared/components/base';
import { DialogService, NotificationService } from '../../../Shared/services';

@Component({
  selector: 'app-contract-template-detail',
  standalone: true,
  imports: [
    CommonModule,
    BaseDetailComponent,
    BaseFormComponent,
  ],
  templateUrl: './contract-template-detail.component.html',
  styleUrls: ['./contract-template-detail.component.scss'],
})
export class ContractTemplateDetailComponent implements OnInit, OnChanges, AfterViewInit {
  private dialogService = inject(DialogService);
  private notificationService = inject(NotificationService);

  @Input() template: ContractTemplate | null = null;
  @Input() isOpen = false;
  @Input() mode: 'edit' | 'view' = 'view';

  @Output() closeEvent = new EventEmitter<void>();
  @Output() templateUpdated = new EventEmitter<void>();

  @ViewChild('editFormTemplate') editFormTemplate!: TemplateRef<any>;
  @ViewChild('contentTemplate') contentTemplate!: TemplateRef<any>;
  @ViewChild('variablesTemplate') variablesTemplate!: TemplateRef<any>;
  @ViewChild('legalTemplate') legalTemplate!: TemplateRef<any>;

  loading = signal(false);
  formData: Record<string, unknown> = {};

  formConfig: FormConfig = {
    sections: [
      {
        title: 'Template Information',
        description: 'Template basic information',
        order: 0,
      },
      {
        title: 'Template Content',
        description: 'Template content and variables',
        order: 1,
      },
      {
        title: 'Settings',
        description: 'Template settings',
        order: 2,
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
        label: 'Template Name',
        placeholder: 'Enter template name',
        required: true,
        section: 'Template Information',
        order: 0,
        colSpan: 2,
      },
      {
        key: 'description',
        type: 'textarea',
        label: 'Description',
        placeholder: 'Enter template description',
        required: false,
        section: 'Template Information',
        order: 1,
        colSpan: 2,
        rows: 3,
      },
      {
        key: 'contractType',
        type: 'select',
        label: 'Contract Type',
        placeholder: 'Select contract type',
        required: true,
        section: 'Template Information',
        order: 2,
        colSpan: 1,
        options: CONTRACT_TYPE_OPTIONS.map(type => ({
          value: type.value,
          label: type.label,
        })) as SelectOption[],
      },
      {
        key: 'category',
        type: 'select',
        label: 'Category',
        placeholder: 'Select category',
        required: false,
        section: 'Template Information',
        order: 3,
        colSpan: 1,
        options: CONTRACT_TEMPLATE_CATEGORIES.map(cat => ({
          value: cat,
          label: cat,
        })) as SelectOption[],
      },
      {
        key: 'templateContent',
        type: 'textarea',
        label: 'Template Content',
        placeholder: 'Enter template content',
        required: true,
        section: 'Template Content',
        order: 0,
        colSpan: 2,
        rows: 10,
      },
      {
        key: 'variables',
        type: 'textarea',
        label: 'Variables (JSON)',
        placeholder: '{"employeeName":"string"}',
        required: false,
        section: 'Template Content',
        order: 1,
        colSpan: 2,
        rows: 4,
      },
      {
        key: 'legalRequirements',
        type: 'textarea',
        label: 'Legal Requirements',
        placeholder: 'Enter legal requirements',
        required: false,
        section: 'Template Content',
        order: 2,
        colSpan: 2,
        rows: 3,
      },
      {
        key: 'tags',
        type: 'input',
        label: 'Tags (JSON array)',
        placeholder: '["tag1","tag2"]',
        required: false,
        section: 'Settings',
        order: 0,
        colSpan: 1,
      },
      {
        key: 'isActive',
        type: 'checkbox',
        label: 'Active',
        required: false,
        section: 'Settings',
        order: 1,
        colSpan: 1,
      },
      {
        key: 'isDefault',
        type: 'checkbox',
        label: 'Set as Default',
        required: false,
        section: 'Settings',
        order: 2,
        colSpan: 1,
      },
    ],
  };

  sections = signal<DetailSection[]>([]);

  private updateSections(): void {
    if (!this.template || !this.contentTemplate || !this.variablesTemplate) {
      this.sections.set([]);
      return;
    }
    this.sections.set([
      {
        title: 'Template Information',
        fields: [
          { label: 'Name', value: this.template.name, type: 'text' },
          { label: 'Contract Type', value: this.template.contractType, type: 'text' },
          { label: 'Category', value: this.template.category || 'N/A', type: 'text' },
          { label: 'Status', value: this.template.isActive ? 'Active' : 'Inactive', type: 'badge', badgeVariant: this.getStatusVariant(this.template.isActive) },
          { label: 'Default', value: this.template.isDefault ? 'Default' : '-', type: 'badge', badgeVariant: this.getDefaultVariant(this.template.isDefault) },
          { label: 'Usage Count', value: this.template.usageCount, type: 'text' },
          { label: 'Version', value: this.template.version, type: 'text' },
          { label: 'Created At', value: this.template.createdAt, type: 'date' },
          ...(this.template.updatedAt ? [{ label: 'Updated At', value: this.template.updatedAt, type: 'date' as const }] : []),
        ],
        showDivider: !!this.template.description,
      },
      ...(this.contentTemplate ? [{
        title: 'Template Content',
        fields: [
          { label: 'Content', value: null, type: 'custom' as const, customTemplate: this.contentTemplate },
        ],
      }] : []),
      ...(this.variablesTemplate ? [{
        title: 'Variables',
        fields: [
          { label: 'Variables', value: null, type: 'custom' as const, customTemplate: this.variablesTemplate },
        ],
      }] : []),
      ...(this.template.legalRequirements && this.legalTemplate ? [{
        title: 'Legal Requirements',
        fields: [
          { label: 'Legal Requirements', value: null, type: 'custom' as const, customTemplate: this.legalTemplate },
        ],
      }] : []),
    ]);
  }

  ngOnInit(): void {
    this.updateFormData();
  }

  ngAfterViewInit(): void {
    this.updateSections();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['template'] || changes['mode']) {
      this.updateFormData();
    }
    // Only check if template data changed - updateSections() will handle template availability
    // The contentTemplate is always needed, but variablesTemplate may not be if there's no variables data
    if (changes['template'] && this.template) {
      // Use setTimeout to ensure ViewChild templates are available after change detection
      setTimeout(() => {
        this.updateSections();
      }, 0);
    }
  }

  updateFormData(): void {
    if (this.template) {
      this.formData = {
        name: this.template.name,
        description: this.template.description,
        contractType: this.template.contractType,
        templateContent: this.template.templateContent,
        variables: this.template.variables,
        category: this.template.category || '',
        isActive: this.template.isActive,
        isDefault: this.template.isDefault,
        tags: this.template.tags || '[]',
        legalRequirements: this.template.legalRequirements || '',
        approvalWorkflow: this.template.approvalWorkflow || null,
      };
    }
  }

  getStatusVariant(isActive: boolean): BadgeVariant {
    return isActive ? 'success' : 'secondary';
  }

  getDefaultVariant(isDefault: boolean): BadgeVariant {
    return isDefault ? 'primary' : 'secondary';
  }

  onFormSubmit(data: Record<string, unknown>): void {
    if (!this.template) return;

    const confirm$ = this.dialogService.confirm({
      title: 'Confirm Update',
      message: `Update template "${data['name']}"?`,
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
          this.notificationService.success(
            'Template Updated',
            `Template "${data['name']}" updated successfully!`,
            { duration: 3000, autoClose: true }
          );
          this.templateUpdated.emit();
          this.onClose();
        },
        error: (err) => {
          this.loading.set(false);
          this.notificationService.error(
            'Update Template Failed',
            err.message || 'Failed to update template.',
            { duration: 5000, persistent: false, autoClose: true }
          );
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
