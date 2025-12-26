// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/positions/add-position/add-position.component.ts
import { Component, inject, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, Observable, combineLatest } from 'rxjs';
import { takeUntil, filter, take, pairwise, debounceTime, startWith, distinctUntilChanged } from 'rxjs/operators';
import {
  BaseFormComponent,
  FormConfig,
  SelectOption,
} from '../../../Shared/components/base';
import { DialogService, OperationNotificationService } from '../../../Shared/services';
import { PositionFacade } from '@store/position/position.facade';
import { DepartmentFacade } from '@store/department/department.facade';
import { TranslationService } from '@core/services/translation.service';
import { Position } from 'app/contracts/positions/position.model';

@Component({
  selector: 'app-add-position',
  standalone: true,
  imports: [
    CommonModule,
    BaseFormComponent,
  ],
  templateUrl: './add-position.component.html',
  styleUrls: ['./add-position.component.scss'],
})
export class AddPositionComponent implements OnInit, OnDestroy {
  private dialogService = inject(DialogService);
  private positionFacade = inject(PositionFacade);
  private departmentFacade = inject(DepartmentFacade);
  private operationNotification = inject(OperationNotificationService);
  private translationService = inject(TranslationService);
  private destroy$ = new Subject<void>();

  @Output() positionCreated = new EventEmitter<void>();

  loading = false;

  formData: Record<string, unknown> = {
    title: '',
    code: '',
    description: '',
    level: 1,
    departmentId: null,
    parentPositionId: null,
    isManagement: false,
    minSalary: null,
    maxSalary: null,
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
    const posInfoSection = this.translationService.translate('positions.add.sections.positionInfo');
    const salarySection = this.translationService.translate('positions.add.sections.salaryInfo');

    this.formConfig = {
      sections: [
        { title: posInfoSection, description: this.translationService.translate('positions.add.sections.positionInfoDescription'), order: 0 },
        { title: salarySection, description: this.translationService.translate('positions.add.sections.salaryInfoDescription'), order: 1, collapsible: true, collapsed: true },
      ],
      layout: { columns: 2, gap: '1.5rem', sectionGap: '2rem', labelPosition: 'top', showSectionDividers: true },
      fields: [
        { key: 'title', type: 'input', label: this.translationService.translate('positions.add.fields.title'), placeholder: this.translationService.translate('positions.add.fields.titlePlaceholder'), required: true, section: posInfoSection, order: 0, colSpan: 2 },
        { key: 'code', type: 'input', label: this.translationService.translate('positions.add.fields.code'), placeholder: this.translationService.translate('positions.add.fields.codePlaceholder'), required: true, section: posInfoSection, order: 1, colSpan: 1 },
        { key: 'level', type: 'number', label: this.translationService.translate('positions.add.fields.level'), placeholder: this.translationService.translate('positions.add.fields.levelPlaceholder'), required: true, section: posInfoSection, order: 2, colSpan: 1, min: 1 },
        { key: 'departmentId', type: 'select', label: this.translationService.translate('positions.add.fields.department'), placeholder: this.translationService.translate('positions.add.fields.departmentPlaceholder'), required: true, section: posInfoSection, order: 3, colSpan: 1, searchable: true, options: [] as SelectOption[] },
        { key: 'parentPositionId', type: 'select', label: this.translationService.translate('positions.add.fields.parentPosition'), placeholder: this.translationService.translate('positions.add.fields.parentPositionPlaceholder'), section: posInfoSection, order: 4, colSpan: 1, searchable: true, options: [] as SelectOption[] },
        { key: 'isManagement', type: 'checkbox', label: this.translationService.translate('positions.add.fields.isManagement'), section: posInfoSection, order: 5, colSpan: 2 },
        { key: 'description', type: 'textarea', label: this.translationService.translate('positions.add.fields.description'), placeholder: this.translationService.translate('positions.add.fields.descriptionPlaceholder'), section: posInfoSection, order: 6, colSpan: 2, rows: 4 },
        { key: 'minSalary', type: 'number', label: this.translationService.translate('positions.add.fields.minSalary'), placeholder: this.translationService.translate('positions.add.fields.minSalaryPlaceholder'), section: salarySection, order: 0, colSpan: 1, min: 0 },
        { key: 'maxSalary', type: 'number', label: this.translationService.translate('positions.add.fields.maxSalary'), placeholder: this.translationService.translate('positions.add.fields.maxSalaryPlaceholder'), section: salarySection, order: 1, colSpan: 1, min: 0 },
      ],
      submitButtonText: this.translationService.translate('positions.add.submitButton'),
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
      this.loadDepartmentOptions();
      this.loadParentPositionOptions();
    });

    this.positionFacade.operationInProgress$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(operationState => {
      this.loading = operationState.loading && operationState.operation === 'create';
    });

    combineLatest([
      this.positionFacade.operationInProgress$.pipe(
        startWith({ loading: false, operation: null })
      ),
      this.positionFacade.error$.pipe(
        startWith(null)
      )
    ]).pipe(
      takeUntil(this.destroy$),
      pairwise(),
      filter(([prev, curr]) => {
        const wasCreating = prev[0].loading === true && prev[0].operation === 'create';
        const isCompleted = curr[0].loading === false && curr[0].operation === null;
        const hasNoError = curr[1] === null;
        return wasCreating && isCompleted && hasNoError;
      }),
      debounceTime(150)
    ).subscribe(() => {
      this.positionCreated.emit();
      this.resetForm();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDepartmentOptions(): void {
    this.departmentFacade.departments$.pipe(
      takeUntil(this.destroy$),
      take(1)
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
      takeUntil(this.destroy$),
      take(1)
    ).subscribe(positions => {
      const parentOptions: SelectOption[] = positions.map(pos => ({
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
    const positionTitle = (data['title'] as string)?.trim() || '';

    const confirm$: Observable<boolean> = this.dialogService.confirm({
      title: this.translationService.translate('positions.add.confirmTitle'),
      message: this.translationService.translate('positions.add.confirmMessage', { name: positionTitle }),
      confirmText: this.translationService.translate('common.create'),
      cancelText: this.translationService.translate('common.cancel'),
      confirmVariant: 'primary',
      icon: 'add',
    });

    confirm$.pipe(
      take(1),
      takeUntil(this.destroy$),
      filter((confirmed: boolean) => confirmed)
    ).subscribe(() => {
      this.operationNotification.trackOperation({
        type: 'create',
        employeeName: positionTitle,
      });

      const newPosition: Omit<Position, 'id'> = {
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

      this.positionFacade.createPosition(newPosition);
    });
  }

  onFormCancel(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.formData = {
      title: '',
      code: '',
      description: '',
      level: 1,
      departmentId: null,
      parentPositionId: null,
      isManagement: false,
      minSalary: null,
      maxSalary: null,
    };
  }
}

