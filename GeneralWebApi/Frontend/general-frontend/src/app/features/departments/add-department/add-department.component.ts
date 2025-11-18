// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/departments/add-department/add-department.component.ts
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
import { DepartmentFacade } from '@store/department/department.facade';
import { Department } from 'app/contracts/departments/department.model';

@Component({
  selector: 'app-add-department',
  standalone: true,
  imports: [
    CommonModule,
    BaseFormComponent,
  ],
  templateUrl: './add-department.component.html',
  styleUrls: ['./add-department.component.scss'],
})
export class AddDepartmentComponent implements OnInit, OnDestroy {
  private dialogService = inject(DialogService);
  private departmentFacade = inject(DepartmentFacade);
  private operationNotification = inject(OperationNotificationService);
  private destroy$ = new Subject<void>();

  @Output() departmentCreated = new EventEmitter<void>();

  loading = false;

  formData: Record<string, unknown> = {
    name: '',
    code: '',
    description: '',
    level: 1,
    parentDepartmentId: null,
  };

  formConfig: FormConfig = {
    sections: [
      {
        title: 'Department Information',
        description: 'Enter department details',
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
    submitButtonText: 'Create Department',
    cancelButtonText: 'Cancel',
    submitButtonVariant: 'primary',
    cancelButtonVariant: 'secondary',
  };

  ngOnInit(): void {
    this.loadParentDepartmentOptions();

    this.departmentFacade.operationInProgress$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(operationState => {
      this.loading = operationState.loading && operationState.operation === 'create';
    });

    combineLatest([
      this.departmentFacade.operationInProgress$.pipe(
        startWith({ loading: false, operation: null })
      ),
      this.departmentFacade.error$.pipe(
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
      this.departmentCreated.emit();
      this.resetForm();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadParentDepartmentOptions(): void {
    this.departmentFacade.departments$.pipe(
      takeUntil(this.destroy$),
      take(1)
    ).subscribe(departments => {
      const parentOptions: SelectOption[] = departments.map(dept => ({
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
    const departmentName = (data['name'] as string)?.trim() || '';

    const confirm$: Observable<boolean> = this.dialogService.confirm({
      title: 'Confirm Create',
      message: `Are you sure you want to create department ${departmentName}?`,
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
        employeeName: departmentName,
      });

      const newDepartment: Omit<Department, 'id'> = {
        name: (data['name'] as string)?.trim() || '',
        code: (data['code'] as string)?.trim() || '',
        description: (data['description'] as string)?.trim() || '',
        level: (data['level'] as number) || 1,
        parentDepartmentId: (data['parentDepartmentId'] as number) || null,
        path: '',
      };

      this.departmentFacade.createDepartment(newDepartment);
    });
  }

  onFormCancel(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.formData = {
      name: '',
      code: '',
      description: '',
      level: 1,
      parentDepartmentId: null,
    };
  }
}

