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
import { TranslationService } from '@core/services/translation.service';
import { TranslatePipe } from '@core/pipes/translate.pipe';

@Component({
  selector: 'app-contract-template-detail',
  standalone: true,
  imports: [
    CommonModule,
    BaseDetailComponent,
    BaseFormComponent,
    TranslatePipe,
  ],
  templateUrl: './contract-template-detail.component.html',
  styleUrls: ['./contract-template-detail.component.scss'],
})
export class ContractTemplateDetailComponent implements OnInit, OnChanges, AfterViewInit {
  private dialogService = inject(DialogService);
  private notificationService = inject(NotificationService);
  private translationService = inject(TranslationService);

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

  get formConfig(): FormConfig {
    const t = (key: string) => this.translationService.translate(key);
    const templateInfoSection = t('contractTemplates.detail.sections.templateInformation');
    const templateContentSection = t('contractTemplates.detail.sections.templateContent');
    const settingsSection = t('contractTemplates.detail.sections.settings');
    
    return {
      sections: [
        {
          title: templateInfoSection,
          description: t('contractTemplates.detail.sections.templateInformationDescription'),
          order: 0,
        },
        {
          title: templateContentSection,
          description: t('contractTemplates.detail.sections.templateContentDescription'),
          order: 1,
        },
        {
          title: settingsSection,
          description: t('contractTemplates.detail.sections.settingsDescription'),
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
          label: t('contractTemplates.detail.fields.name'),
          placeholder: t('contractTemplates.detail.fields.namePlaceholder'),
          required: true,
          section: templateInfoSection,
          order: 0,
          colSpan: 2,
        },
        {
          key: 'description',
          type: 'textarea',
          label: t('contractTemplates.detail.fields.description'),
          placeholder: t('contractTemplates.detail.fields.descriptionPlaceholder'),
          required: false,
          section: templateInfoSection,
          order: 1,
          colSpan: 2,
          rows: 3,
        },
        {
          key: 'contractType',
          type: 'select',
          label: t('contractTemplates.detail.fields.contractType'),
          placeholder: t('contractTemplates.detail.fields.contractTypePlaceholder'),
          required: true,
          section: templateInfoSection,
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
          label: t('contractTemplates.detail.fields.category'),
          placeholder: t('contractTemplates.detail.fields.categoryPlaceholder'),
          required: false,
          section: templateInfoSection,
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
          label: t('contractTemplates.detail.fields.templateContent'),
          placeholder: t('contractTemplates.detail.fields.templateContentPlaceholder'),
          required: true,
          section: templateContentSection,
          order: 0,
          colSpan: 2,
          rows: 10,
        },
        {
          key: 'variables',
          type: 'textarea',
          label: t('contractTemplates.detail.fields.variables'),
          placeholder: '{"employeeName":"string"}',
          required: false,
          section: templateContentSection,
          order: 1,
          colSpan: 2,
          rows: 4,
        },
        {
          key: 'legalRequirements',
          type: 'textarea',
          label: t('contractTemplates.detail.fields.legalRequirements'),
          placeholder: t('contractTemplates.detail.fields.legalRequirementsPlaceholder'),
          required: false,
          section: templateContentSection,
          order: 2,
          colSpan: 2,
          rows: 3,
        },
        {
          key: 'tags',
          type: 'input',
          label: t('contractTemplates.detail.fields.tags'),
          placeholder: '["tag1","tag2"]',
          required: false,
          section: settingsSection,
          order: 0,
          colSpan: 1,
        },
        {
          key: 'isActive',
          type: 'checkbox',
          label: t('contractTemplates.detail.fields.isActive'),
          required: false,
          section: settingsSection,
          order: 1,
          colSpan: 1,
        },
        {
          key: 'isDefault',
          type: 'checkbox',
          label: t('contractTemplates.detail.fields.isDefault'),
          required: false,
          section: settingsSection,
          order: 2,
          colSpan: 1,
        },
      ],
      submitButtonText: t('contractTemplates.detail.buttons.updateTemplate'),
      cancelButtonText: t('contractTemplates.detail.buttons.cancel'),
    };
  }

  sections = signal<DetailSection[]>([]);

  private updateSections(): void {
    if (!this.template || !this.contentTemplate || !this.variablesTemplate) {
      this.sections.set([]);
      return;
    }
    const t = (key: string) => this.translationService.translate(key);
    this.sections.set([
      {
        title: t('contractTemplates.detail.sections.templateInformation'),
        fields: [
          { label: t('contractTemplates.detail.fields.name'), value: this.template.name, type: 'text' },
          { label: t('contractTemplates.detail.fields.contractType'), value: this.template.contractType, type: 'text' },
          { label: t('contractTemplates.detail.fields.category'), value: this.template.category || t('common.notAvailable'), type: 'text' },
          { label: t('common.status'), value: this.template.isActive ? t('contractTemplates.status.active') : t('contractTemplates.status.inactive'), type: 'badge', badgeVariant: this.getStatusVariant(this.template.isActive) },
          { label: t('contractTemplates.columns.default'), value: this.template.isDefault ? t('contractTemplates.status.default') : '-', type: 'badge', badgeVariant: this.getDefaultVariant(this.template.isDefault) },
          { label: t('contractTemplates.columns.usageCount'), value: this.template.usageCount, type: 'text' },
          { label: t('contractTemplates.columns.version'), value: this.template.version, type: 'text' },
          { label: t('common.createdAt'), value: this.template.createdAt, type: 'date' },
          ...(this.template.updatedAt ? [{ label: t('common.updatedAt'), value: this.template.updatedAt, type: 'date' as const }] : []),
        ],
        showDivider: !!this.template.description,
      },
      ...(this.contentTemplate ? [{
        title: t('contractTemplates.detail.sections.templateContent'),
        fields: [
          { label: t('contractTemplates.detail.fields.templateContent'), value: null, type: 'custom' as const, customTemplate: this.contentTemplate },
        ],
      }] : []),
      ...(this.variablesTemplate ? [{
        title: t('contractTemplates.detail.fields.variables'),
        fields: [
          { label: t('contractTemplates.detail.fields.variables'), value: null, type: 'custom' as const, customTemplate: this.variablesTemplate },
        ],
      }] : []),
      ...(this.template.legalRequirements && this.legalTemplate ? [{
        title: t('contractTemplates.detail.fields.legalRequirements'),
        fields: [
          { label: t('contractTemplates.detail.fields.legalRequirements'), value: null, type: 'custom' as const, customTemplate: this.legalTemplate },
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
