// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/contract-templates/add-contract-template/add-contract-template.component.ts
import { Component, inject, OnDestroy, OnInit, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, delay, of } from 'rxjs';
import { takeUntil, filter, take, distinctUntilChanged } from 'rxjs/operators';
import {
  BaseFormComponent,
  FormConfig,
  SelectOption,
} from '../../../Shared/components/base';
import { DialogService, NotificationService } from '../../../Shared/services';
import { CONTRACT_TEMPLATE_CATEGORIES } from 'app/contracts/contract-templates/contract-template.model';
import { CONTRACT_TYPES as CONTRACT_TYPE_OPTIONS } from 'app/contracts/contracts/contract.model';
import { TranslationService } from '@core/services/translation.service';
import { TranslatePipe } from '@core/pipes/translate.pipe';

@Component({
  selector: 'app-add-contract-template',
  standalone: true,
  imports: [
    CommonModule,
    BaseFormComponent,
    TranslatePipe,
  ],
  templateUrl: './add-contract-template.component.html',
  styleUrls: ['./add-contract-template.component.scss'],
})
export class AddContractTemplateComponent implements OnInit, OnDestroy {
  private dialogService = inject(DialogService);
  private notificationService = inject(NotificationService);
  private translationService = inject(TranslationService);
  private destroy$ = new Subject<void>();

  @Output() templateCreated = new EventEmitter<void>();

  loading = signal(false);

  formData: Record<string, unknown> = {
    name: '',
    description: '',
    contractType: 'Indefinite',
    templateContent: '',
    variables: '{}',
    category: 'Employment',
    isActive: true,
    isDefault: false,
    tags: '[]',
    legalRequirements: '',
    approvalWorkflow: null,
  };

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
    const sectionInfo = this.translationService.translate('contractTemplates.add.sections.templateInfo');
    const sectionContent = this.translationService.translate('contractTemplates.add.sections.templateContent');
    const sectionSettings = this.translationService.translate('contractTemplates.add.sections.settings');

    this.formConfig = {
      sections: [
        { title: sectionInfo, description: this.translationService.translate('contractTemplates.add.sections.templateInfoDescription'), order: 0 },
        { title: sectionContent, description: this.translationService.translate('contractTemplates.add.sections.templateContentDescription'), order: 1 },
        { title: sectionSettings, description: this.translationService.translate('contractTemplates.add.sections.settingsDescription'), order: 2 },
      ],
      layout: { columns: 2, gap: '1.5rem', sectionGap: '2rem', labelPosition: 'top', showSectionDividers: true },
      fields: [
        { key: 'name', type: 'input', label: this.translationService.translate('contractTemplates.add.fields.name'), placeholder: this.translationService.translate('contractTemplates.add.fields.namePlaceholder'), required: true, section: sectionInfo, order: 0, colSpan: 2 },
        { key: 'description', type: 'textarea', label: this.translationService.translate('contractTemplates.add.fields.description'), placeholder: this.translationService.translate('contractTemplates.add.fields.descriptionPlaceholder'), required: false, section: sectionInfo, order: 1, colSpan: 2, rows: 3 },
        { key: 'contractType', type: 'select', label: this.translationService.translate('contractTemplates.add.fields.contractType'), placeholder: this.translationService.translate('contractTemplates.add.fields.contractTypePlaceholder'), required: true, section: sectionInfo, order: 2, colSpan: 1, options: CONTRACT_TYPE_OPTIONS.map(type => ({ value: type.value, label: type.label })) as SelectOption[] },
        { key: 'category', type: 'select', label: this.translationService.translate('contractTemplates.add.fields.category'), placeholder: this.translationService.translate('contractTemplates.add.fields.categoryPlaceholder'), required: false, section: sectionInfo, order: 3, colSpan: 1, options: CONTRACT_TEMPLATE_CATEGORIES.map(cat => ({ value: cat, label: cat })) as SelectOption[] },
        { key: 'templateContent', type: 'textarea', label: this.translationService.translate('contractTemplates.add.fields.templateContent'), placeholder: this.translationService.translate('contractTemplates.add.fields.templateContentPlaceholder'), required: true, section: sectionContent, order: 0, colSpan: 2, rows: 10 },
        { key: 'variables', type: 'textarea', label: this.translationService.translate('contractTemplates.add.fields.variables'), placeholder: '{"employeeName":"string","position":"string"}', required: false, section: sectionContent, order: 1, colSpan: 2, rows: 4 },
        { key: 'legalRequirements', type: 'textarea', label: this.translationService.translate('contractTemplates.add.fields.legalRequirements'), placeholder: this.translationService.translate('contractTemplates.add.fields.legalRequirementsPlaceholder'), required: false, section: sectionContent, order: 2, colSpan: 2, rows: 3 },
        { key: 'tags', type: 'input', label: this.translationService.translate('contractTemplates.add.fields.tags'), placeholder: '["tag1","tag2"]', required: false, section: sectionSettings, order: 0, colSpan: 1 },
        { key: 'isActive', type: 'checkbox', label: this.translationService.translate('contractTemplates.add.fields.isActive'), required: false, section: sectionSettings, order: 1, colSpan: 1 },
        { key: 'isDefault', type: 'checkbox', label: this.translationService.translate('contractTemplates.add.fields.isDefault'), required: false, section: sectionSettings, order: 2, colSpan: 1 },
      ],
      submitButtonText: this.translationService.translate('contractTemplates.add.submitButton'),
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
    const templateName = data['name'] as string || '';
    const confirm$ = this.dialogService.confirm({
      title: this.translationService.translate('contractTemplates.add.confirmTitle'),
      message: this.translationService.translate('contractTemplates.add.confirmMessage', { name: templateName }),
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

      // Simulate API call
      of(true).pipe(
        delay(1000),
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.loading.set(false);
          this.notificationService.success(
            'Template Added',
            `Template "${data['name']}" added successfully!`,
            { duration: 3000, autoClose: true }
          );
          this.templateCreated.emit();
          this.onFormCancel();
        },
        error: (err) => {
          this.loading.set(false);
          this.notificationService.error(
            'Add Template Failed',
            err.message || 'Failed to add template.',
            { duration: 5000, persistent: false, autoClose: true }
          );
        }
      });
    });
  }

  onFormCancel(): void {
    this.formData = {
      name: '',
      description: '',
      contractType: 'Indefinite',
      templateContent: '',
      variables: '{}',
      category: 'Employment',
      isActive: true,
      isDefault: false,
      tags: '[]',
      legalRequirements: '',
      approvalWorkflow: null,
    };
  }
}

