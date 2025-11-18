// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/positions/add-position/add-position.component.ts
import { Component, inject, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, Observable, combineLatest } from 'rxjs';
import { takeUntil, filter, take, pairwise, debounceTime, startWith } from 'rxjs/operators';
import {
  BaseFormComponent,
  FormConfig,
  SelectOption,
} from '../../../Shared/components/base';
import { DialogService, OperationNotificationService } from '../../../Shared/services';
import { PositionFacade } from '@store/position/position.facade';
import { DepartmentFacade } from '@store/department/department.facade';
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
    sections: [
      {
        title: 'Position Information',
        description: 'Enter position details',
        order: 0,
      },
      {
        title: 'Salary Information',
        description: 'Optional salary range details',
        order: 1,
        collapsible: true,
        collapsed: true,
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
    submitButtonText: 'Create Position',
    cancelButtonText: 'Cancel',
    submitButtonVariant: 'primary',
    cancelButtonVariant: 'secondary',
  };

  ngOnInit(): void {
    this.loadDepartmentOptions();
    this.loadParentPositionOptions();

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
      title: 'Confirm Create',
      message: `Are you sure you want to create position ${positionTitle}?`,
      confirmText: 'Create',
      cancelText: 'Cancel',
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

