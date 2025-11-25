// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/contract-templates/add-contract-template/add-contract-template.component.ts
import { Component, inject, OnDestroy, OnInit, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, delay, of } from 'rxjs';
import { takeUntil, filter, take } from 'rxjs/operators';
import {
  BaseFormComponent,
  FormConfig,
  SelectOption,
} from '../../../Shared/components/base';
import { DialogService, NotificationService } from '../../../Shared/services';
import { CONTRACT_TEMPLATE_CATEGORIES } from 'app/contracts/contract-templates/contract-template.model';
import { CONTRACT_TYPES as CONTRACT_TYPE_OPTIONS } from 'app/contracts/contracts/contract.model';

@Component({
  selector: 'app-add-contract-template',
  standalone: true,
  imports: [
    CommonModule,
    BaseFormComponent,
  ],
  templateUrl: './add-contract-template.component.html',
  styleUrls: ['./add-contract-template.component.scss'],
})
export class AddContractTemplateComponent implements OnInit, OnDestroy {
  private dialogService = inject(DialogService);
  private notificationService = inject(NotificationService);
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
    sections: [
      {
        title: 'Template Information',
        description: 'Enter template basic information',
        order: 0,
      },
      {
        title: 'Template Content',
        description: 'Enter template content and variables',
        order: 1,
      },
      {
        title: 'Settings',
        description: 'Configure template settings',
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
        placeholder: 'Enter template content (supports variables like {{employeeName}})',
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
        placeholder: '{"employeeName":"string","position":"string"}',
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
        placeholder: 'Enter legal requirements or compliance notes',
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

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFormSubmit(data: Record<string, unknown>): void {
    const confirm$ = this.dialogService.confirm({
      title: 'Confirm Add Template',
      message: `Are you sure you want to add template "${data['name']}"?`,
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

