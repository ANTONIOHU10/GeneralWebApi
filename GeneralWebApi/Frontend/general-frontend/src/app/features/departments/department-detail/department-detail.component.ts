// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/departments/department-detail/department-detail.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, OnDestroy, SimpleChanges, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Department } from 'app/contracts/departments/department.model';
import {
  BaseModalComponent,
  BaseFormComponent,
  FormConfig,
  SelectOption,
} from '../../../Shared/components/base';
import { TranslationService } from '@core/services/translation.service';
import { DepartmentFacade } from '@store/department/department.facade';
import { DialogService, OperationNotificationService } from '../../../Shared/services';
import { Observable, combineLatest, Subject } from 'rxjs';
import { filter, first, pairwise, debounceTime, startWith, distinctUntilChanged, takeUntil } from 'rxjs/operators';

/**
 * DepartmentDetailComponent - Modal component for displaying detailed department information
 */
@Component({
  selector: 'app-department-detail',
  standalone: true,
  imports: [
    CommonModule,
    BaseModalComponent,
    BaseFormComponent,
  ],
  templateUrl: './department-detail.component.html',
  styleUrls: ['./department-detail.component.scss'],
})
export class DepartmentDetailComponent implements OnInit, OnChanges, OnDestroy {
  private departmentFacade = inject(DepartmentFacade);
  private dialogService = inject(DialogService);
  private operationNotification = inject(OperationNotificationService);
  private translationService = inject(TranslationService);
  private cdr = inject(ChangeDetectorRef);

  @Input() department: Department | null = null;
  @Input() isOpen = false;
  @Input() mode: 'edit' | 'view' = 'edit';

  @Output() closeEvent = new EventEmitter<void>();
  @Output() departmentUpdated = new EventEmitter<Department>();

  // Loading state for form (using signal for reactive updates)
  loading = signal(false);

  // Form data
  formData: Record<string, unknown> = {};

  // Destroy subject for cleanup
  private destroy$ = new Subject<void>();

  // Form configuration - will be initialized with translations
  formConfig: FormConfig = {
    sections: [
      {
        title: 'Department Information',
        description: 'Department details',
        order: 0,
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
        label: 'Department Name',
        placeholder: 'Enter department name',
        required: true,
        section: 'Department Information',
        order: 0,
        colSpan: 2,
      },
      {
        key: 'code',
        type: 'input',
        label: 'Department Code',
        placeholder: 'Enter department code',
        required: true,
        section: 'Department Information',
        order: 1,
        colSpan: 1,
      },
      {
        key: 'level',
        type: 'number',
        label: 'Level',
        placeholder: 'Enter level',
        required: true,
        section: 'Department Information',
        order: 2,
        colSpan: 1,
        min: 1,
      },
      {
        key: 'parentDepartmentId',
        type: 'select',
        label: 'Parent Department',
        placeholder: 'Select parent department (optional)',
        section: 'Department Information',
        order: 3,
        colSpan: 2,
        searchable: true,
        options: [] as SelectOption[],
      },
      {
        key: 'description',
        type: 'textarea',
        label: 'Description',
        placeholder: 'Enter department description',
        section: 'Department Information',
        order: 4,
        colSpan: 2,
        rows: 4,
      },
    ],
    submitButtonText: 'Save Changes',
    cancelButtonText: 'Cancel',
    submitButtonVariant: 'primary',
    cancelButtonVariant: 'secondary',
  };

  ngOnInit(): void {
    // Wait for translations to load before initializing form config
    this.translationService.getTranslationsLoaded$().pipe(
      distinctUntilChanged(),
      filter(loaded => loaded),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.initializeFormConfig();
      // Initialize form config for current mode (edit/view)
      this.updateFormConfigForMode();
    });

    // Subscribe to operation progress to update loading state
    // Simplified: Direct subscription without effect wrapper
    this.departmentFacade.operationInProgress$.subscribe(operationState => {
      this.loading.set(operationState.loading && operationState.operation === 'update');
    });

    // Listen for successful update operation completion
    combineLatest([
      this.departmentFacade.operationInProgress$.pipe(
        startWith({ loading: false, operation: null })
      ),
      this.departmentFacade.error$.pipe(
        startWith(null)
      )
    ]).pipe(
      pairwise(),
      filter(([prev, curr]) => {
        const wasUpdating = prev[0].loading === true && prev[0].operation === 'update';
        const isCompleted = curr[0].loading === false && curr[0].operation === null;
        const hasNoError = curr[1] === null;
        return wasUpdating && isCompleted && hasNoError;
      }),
      debounceTime(150)
    ).subscribe(() => {
      if (this.department) {
        this.departmentUpdated.emit(this.department);
        this.onClose();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['department'] && this.department) {
      this.initializeFormData();
      this.loadParentDepartmentOptions();
    }
    if (changes['mode'] || (changes['department'] && this.department)) {
      setTimeout(() => {
        this.updateFormConfigForMode();
      }, 0);
    }
  }


  onClose(): void {
    this.closeEvent.emit();
  }

  onBackdropClick(): void {
    this.onClose();
  }

  /**
   * Get modal title based on mode
   */
  getModalTitle(): string {
    if (this.mode === 'edit') {
      return this.translationService.translate('departments.detail.title.edit');
    }
    return this.translationService.translate('departments.detail.title.view');
  }

  /**
   * Initialize form config with translations
   */
  private initializeFormConfig(): void {
    const t = (key: string) => this.translationService.translate(key);
    
    // Get section title
    const departmentInfoSection = t('departments.detail.sections.departmentInformation');

    this.formConfig = {
      sections: [
        {
          title: departmentInfoSection,
          description: t('departments.detail.sections.departmentInformationDescription'),
          order: 0,
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
          label: t('departments.detail.fields.name'),
          placeholder: t('departments.detail.fields.namePlaceholder'),
          required: true,
          section: departmentInfoSection,
          order: 0,
          colSpan: 2,
        },
        {
          key: 'code',
          type: 'input',
          label: t('departments.detail.fields.code'),
          placeholder: t('departments.detail.fields.codePlaceholder'),
          required: true,
          section: departmentInfoSection,
          order: 1,
          colSpan: 1,
        },
        {
          key: 'level',
          type: 'number',
          label: t('departments.detail.fields.level'),
          placeholder: t('departments.detail.fields.levelPlaceholder'),
          required: true,
          section: departmentInfoSection,
          order: 2,
          colSpan: 1,
          min: 1,
        },
        {
          key: 'parentDepartmentId',
          type: 'select',
          label: t('departments.detail.fields.parentDepartment'),
          placeholder: t('departments.detail.fields.parentDepartmentPlaceholder'),
          section: departmentInfoSection,
          order: 3,
          colSpan: 2,
          searchable: true,
          options: [] as SelectOption[],
        },
        {
          key: 'description',
          type: 'textarea',
          label: t('departments.detail.fields.description'),
          placeholder: t('departments.detail.fields.descriptionPlaceholder'),
          section: departmentInfoSection,
          order: 4,
          colSpan: 2,
          rows: 4,
        },
      ],
      submitButtonText: t('departments.detail.buttons.saveChanges'),
      cancelButtonText: t('departments.detail.buttons.cancel'),
      submitButtonVariant: 'primary',
      cancelButtonVariant: 'secondary',
    };
    this.cdr.markForCheck();
  }

  private initializeFormData(): void {
    if (!this.department) return;

    this.formData = {
      name: this.department.name || '',
      code: this.department.code || '',
      description: this.department.description || '',
      level: this.department.level || 1,
      parentDepartmentId: this.department.parentDepartmentId || null,
    };
  }

  private updateFormConfigForMode(): void {
    if (!this.formConfig.fields || this.formConfig.fields.length === 0) {
      return;
    }

    const isReadOnly = this.mode === 'view';

    const updatedFields = this.formConfig.fields.map(field => ({
      ...field,
      readonly: isReadOnly,
      disabled: isReadOnly,
    }));

    this.formConfig = {
      ...this.formConfig,
      fields: updatedFields,
      showButtons: isReadOnly ? false : true,
      buttons: isReadOnly ? [
        {
          label: this.translationService.translate('departments.detail.buttons.close'),
          type: 'reset',
          variant: 'secondary',
          icon: 'close',
        },
      ] : undefined,
    };
  }

  private loadParentDepartmentOptions(): void {
    this.departmentFacade.departments$.pipe(
      first() // Simplified - only take first emission
    ).subscribe(departments => {
      const parentOptions: SelectOption[] = departments
        .filter(dept => dept.id !== this.department?.id)
        .map(dept => ({
          value: parseInt(dept.id),
          label: `${dept.name} (${dept.code})`
        }));

      const parentField = this.formConfig.fields.find(f => f.key === 'parentDepartmentId');
      if (parentField) {
        parentField.options = parentOptions;
      }
    });
  }

  onFormSubmit(data: Record<string, unknown>): void {
    if (!this.department) return;

    const departmentName = (data['name'] as string)?.trim() || '';

    const confirm$: Observable<boolean> = this.dialogService.confirm({
      title: this.translationService.translate('departments.detail.confirm.title'),
      message: this.translationService.translate('departments.detail.confirm.message', { name: departmentName }),
      confirmText: this.translationService.translate('departments.detail.confirm.confirmText'),
      cancelText: this.translationService.translate('departments.detail.confirm.cancelText'),
      confirmVariant: 'primary',
      icon: 'save',
    });

    confirm$.pipe(
      first(), // Simplified - only take first emission
      filter((confirmed: boolean) => confirmed)
    ).subscribe(() => {
      this.operationNotification.trackOperation({
        type: 'update',
        employeeName: departmentName,
      });

      const updateData: Partial<Department> = {
        name: (data['name'] as string)?.trim() || '',
        code: (data['code'] as string)?.trim() || '',
        description: (data['description'] as string)?.trim() || '',
        level: (data['level'] as number) || 1,
        parentDepartmentId: (data['parentDepartmentId'] as number) || null,
      };

      if (this.department) {
        this.departmentFacade.updateDepartment(this.department.id, updateData);
      }
    });
  }

  onFormCancel(): void {
    this.onClose();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

