// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/positions/position-detail/position-detail.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, OnDestroy, SimpleChanges, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Position } from 'app/contracts/positions/position.model';
import {
  BaseModalComponent,
  BaseFormComponent,
  FormConfig,
  SelectOption,
} from '../../../Shared/components/base';
import { TranslationService } from '@core/services/translation.service';
import { PositionFacade } from '@store/position/position.facade';
import { DepartmentFacade } from '@store/department/department.facade';
import { DialogService, OperationNotificationService } from '../../../Shared/services';
import { Observable, combineLatest, Subject } from 'rxjs';
import { filter, first, pairwise, debounceTime, startWith, distinctUntilChanged, takeUntil } from 'rxjs/operators';

/**
 * PositionDetailComponent - Modal component for displaying detailed position information
 */
@Component({
  selector: 'app-position-detail',
  standalone: true,
  imports: [
    CommonModule,
    BaseModalComponent,
    BaseFormComponent,
  ],
  templateUrl: './position-detail.component.html',
  styleUrls: ['./position-detail.component.scss'],
})
export class PositionDetailComponent implements OnInit, OnChanges, OnDestroy {
  private positionFacade = inject(PositionFacade);
  private departmentFacade = inject(DepartmentFacade);
  private dialogService = inject(DialogService);
  private operationNotification = inject(OperationNotificationService);
  private translationService = inject(TranslationService);
  private cdr = inject(ChangeDetectorRef);

  @Input() position: Position | null = null;
  @Input() isOpen = false;
  @Input() mode: 'edit' | 'view' = 'edit';

  @Output() closeEvent = new EventEmitter<void>();
  @Output() positionUpdated = new EventEmitter<Position>();

  loading = signal(false);
  formData: Record<string, unknown> = {};

  // Destroy subject for cleanup
  private destroy$ = new Subject<void>();

  // Form configuration - will be initialized with translations
  formConfig: FormConfig = {
    sections: [
      {
        title: 'Position Information',
        description: 'Position details',
        order: 0,
      },
      {
        title: 'Salary Information',
        description: 'Salary range details',
        order: 1,
        collapsible: true,
        collapsed: false,
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
        key: 'title',
        type: 'input',
        label: 'Position Title',
        placeholder: 'Enter position title',
        required: true,
        section: 'Position Information',
        order: 0,
        colSpan: 2,
      },
      {
        key: 'code',
        type: 'input',
        label: 'Position Code',
        placeholder: 'Enter position code',
        required: true,
        section: 'Position Information',
        order: 1,
        colSpan: 1,
      },
      {
        key: 'level',
        type: 'number',
        label: 'Level',
        placeholder: 'Enter level',
        required: true,
        section: 'Position Information',
        order: 2,
        colSpan: 1,
        min: 1,
      },
      {
        key: 'departmentId',
        type: 'select',
        label: 'Department',
        placeholder: 'Select department',
        required: true,
        section: 'Position Information',
        order: 3,
        colSpan: 1,
        searchable: true,
        options: [] as SelectOption[],
      },
      {
        key: 'parentPositionId',
        type: 'select',
        label: 'Parent Position',
        placeholder: 'Select parent position (optional)',
        section: 'Position Information',
        order: 4,
        colSpan: 1,
        searchable: true,
        options: [] as SelectOption[],
      },
      {
        key: 'isManagement',
        type: 'checkbox',
        label: 'Is Management Position',
        section: 'Position Information',
        order: 5,
        colSpan: 2,
      },
      {
        key: 'description',
        type: 'textarea',
        label: 'Description',
        placeholder: 'Enter position description',
        section: 'Position Information',
        order: 6,
        colSpan: 2,
        rows: 4,
      },
      {
        key: 'minSalary',
        type: 'number',
        label: 'Minimum Salary',
        placeholder: 'Enter minimum salary',
        section: 'Salary Information',
        order: 0,
        colSpan: 1,
        min: 0,
      },
      {
        key: 'maxSalary',
        type: 'number',
        label: 'Maximum Salary',
        placeholder: 'Enter maximum salary',
        section: 'Salary Information',
        order: 1,
        colSpan: 1,
        min: 0,
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
      this.loadDepartmentOptions();
      this.loadParentPositionOptions();
    });

    // Subscribe to operation progress to update loading state
    // Simplified: Direct subscription without effect wrapper
    this.positionFacade.operationInProgress$.subscribe(operationState => {
      this.loading.set(operationState.loading && operationState.operation === 'update');
    });

    // Listen for successful update operation completion
    combineLatest([
      this.positionFacade.operationInProgress$.pipe(
        startWith({ loading: false, operation: null })
      ),
      this.positionFacade.error$.pipe(
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
      if (this.position) {
        this.positionUpdated.emit(this.position);
        this.onClose();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['position'] && this.position) {
      this.initializeFormData();
      this.loadParentPositionOptions();
    }
    if (changes['mode'] || (changes['position'] && this.position)) {
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
      return this.translationService.translate('positions.detail.title.edit');
    }
    return this.translationService.translate('positions.detail.title.view');
  }

  /**
   * Initialize form config with translations
   */
  private initializeFormConfig(): void {
    const t = (key: string) => this.translationService.translate(key);
    
    // Get section titles
    const positionInfoSection = t('positions.detail.sections.positionInformation');
    const salaryInfoSection = t('positions.detail.sections.salaryInformation');

    this.formConfig = {
      sections: [
        {
          title: positionInfoSection,
          description: t('positions.detail.sections.positionInformationDescription'),
          order: 0,
        },
        {
          title: salaryInfoSection,
          description: t('positions.detail.sections.salaryInformationDescription'),
          order: 1,
          collapsible: true,
          collapsed: false,
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
          key: 'title',
          type: 'input',
          label: t('positions.detail.fields.title'),
          placeholder: t('positions.detail.fields.titlePlaceholder'),
          required: true,
          section: positionInfoSection,
          order: 0,
          colSpan: 2,
        },
        {
          key: 'code',
          type: 'input',
          label: t('positions.detail.fields.code'),
          placeholder: t('positions.detail.fields.codePlaceholder'),
          required: true,
          section: positionInfoSection,
          order: 1,
          colSpan: 1,
        },
        {
          key: 'level',
          type: 'number',
          label: t('positions.detail.fields.level'),
          placeholder: t('positions.detail.fields.levelPlaceholder'),
          required: true,
          section: positionInfoSection,
          order: 2,
          colSpan: 1,
          min: 1,
        },
        {
          key: 'departmentId',
          type: 'select',
          label: t('positions.detail.fields.department'),
          placeholder: t('positions.detail.fields.departmentPlaceholder'),
          required: true,
          section: positionInfoSection,
          order: 3,
          colSpan: 1,
          searchable: true,
          options: [] as SelectOption[],
        },
        {
          key: 'parentPositionId',
          type: 'select',
          label: t('positions.detail.fields.parentPosition'),
          placeholder: t('positions.detail.fields.parentPositionPlaceholder'),
          section: positionInfoSection,
          order: 4,
          colSpan: 1,
          searchable: true,
          options: [] as SelectOption[],
        },
        {
          key: 'isManagement',
          type: 'checkbox',
          label: t('positions.detail.fields.isManagement'),
          section: positionInfoSection,
          order: 5,
          colSpan: 2,
        },
        {
          key: 'description',
          type: 'textarea',
          label: t('positions.detail.fields.description'),
          placeholder: t('positions.detail.fields.descriptionPlaceholder'),
          section: positionInfoSection,
          order: 6,
          colSpan: 2,
          rows: 4,
        },
        {
          key: 'minSalary',
          type: 'number',
          label: t('positions.detail.fields.minSalary'),
          placeholder: t('positions.detail.fields.minSalaryPlaceholder'),
          section: salaryInfoSection,
          order: 0,
          colSpan: 1,
          min: 0,
        },
        {
          key: 'maxSalary',
          type: 'number',
          label: t('positions.detail.fields.maxSalary'),
          placeholder: t('positions.detail.fields.maxSalaryPlaceholder'),
          section: salaryInfoSection,
          order: 1,
          colSpan: 1,
          min: 0,
        },
      ],
      submitButtonText: t('positions.detail.buttons.saveChanges'),
      cancelButtonText: t('positions.detail.buttons.cancel'),
      submitButtonVariant: 'primary',
      cancelButtonVariant: 'secondary',
    };
    this.cdr.markForCheck();
  }

  private initializeFormData(): void {
    if (!this.position) return;

    this.formData = {
      title: this.position.title || '',
      code: this.position.code || '',
      description: this.position.description || '',
      level: this.position.level || 1,
      departmentId: this.position.departmentId || null,
      parentPositionId: this.position.parentPositionId || null,
      isManagement: this.position.isManagement || false,
      minSalary: this.position.minSalary || null,
      maxSalary: this.position.maxSalary || null,
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
          label: this.translationService.translate('positions.detail.buttons.close'),
          type: 'reset',
          variant: 'secondary',
          icon: 'close',
        },
      ] : undefined,
    };
  }

  private loadDepartmentOptions(): void {
    this.departmentFacade.departments$.pipe(
      first() // Simplified - only take first emission
    ).subscribe(departments => {
      const departmentOptions: SelectOption[] = departments.map(dept => ({
        value: parseInt(dept.id),
        label: `${dept.name} (${dept.code})`
      }));

      const departmentField = this.formConfig.fields.find(f => f.key === 'departmentId');
      if (departmentField) {
        departmentField.options = departmentOptions;
      }
    });
  }

  private loadParentPositionOptions(): void {
    this.positionFacade.positions$.pipe(
      first() // Simplified - only take first emission
    ).subscribe(positions => {
      const parentOptions: SelectOption[] = positions
        .filter(pos => pos.id !== this.position?.id)
        .map(pos => ({
          value: parseInt(pos.id),
          label: `${pos.title} (${pos.code})`
        }));

      const parentField = this.formConfig.fields.find(f => f.key === 'parentPositionId');
      if (parentField) {
        parentField.options = parentOptions;
      }
    });
  }

  onFormSubmit(data: Record<string, unknown>): void {
    if (!this.position) return;

    const positionTitle = (data['title'] as string)?.trim() || '';

    const confirm$: Observable<boolean> = this.dialogService.confirm({
      title: this.translationService.translate('positions.detail.confirm.title'),
      message: this.translationService.translate('positions.detail.confirm.message', { name: positionTitle }),
      confirmText: this.translationService.translate('positions.detail.confirm.confirmText'),
      cancelText: this.translationService.translate('positions.detail.confirm.cancelText'),
      confirmVariant: 'primary',
      icon: 'save',
    });

    confirm$.pipe(
      first(), // Simplified - only take first emission
      filter((confirmed: boolean) => confirmed)
    ).subscribe(() => {
      this.operationNotification.trackOperation({
        type: 'update',
        employeeName: positionTitle,
      });

      const updateData: Partial<Position> = {
        title: (data['title'] as string)?.trim() || '',
        code: (data['code'] as string)?.trim() || '',
        description: (data['description'] as string)?.trim() || '',
        level: (data['level'] as number) || 1,
        departmentId: (data['departmentId'] as number) || 0,
        parentPositionId: (data['parentPositionId'] as number) || null,
        isManagement: (data['isManagement'] as boolean) || false,
        minSalary: (data['minSalary'] as number) || null,
        maxSalary: (data['maxSalary'] as number) || null,
      };

      if (this.position) {
        this.positionFacade.updatePosition(this.position.id, updateData);
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

