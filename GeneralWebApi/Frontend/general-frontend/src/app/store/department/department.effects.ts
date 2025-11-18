// Path: GeneralWebApi/Frontend/general-frontend/src/app/store/department/department.effects.ts
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';

import { DepartmentService } from '@core/services/department.service';
import * as DepartmentActions from './department.actions';
import {
  selectDepartmentFilters,
  selectDepartmentPagination,
} from './department.selectors';
import { CreateDepartmentRequest, DepartmentSearchParams } from 'app/contracts/departments/department.model';

@Injectable()
export class DepartmentEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private departmentService = inject(DepartmentService);

  // Load departments list
  loadDepartments$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DepartmentActions.loadDepartments),
      withLatestFrom(
        this.store.select(selectDepartmentFilters),
        this.store.select(selectDepartmentPagination)
      ),
      switchMap(([action, filters, pagination]) => {
        const params: DepartmentSearchParams = {
          pageNumber: action.pageNumber ?? pagination.currentPage,
          pageSize: action.pageSize ?? pagination.pageSize,
          searchTerm: action.searchTerm ?? filters.searchTerm,
          parentDepartmentId: action.parentDepartmentId ?? filters.parentDepartmentId,
          level: action.level ?? filters.level,
          sortBy: action.sortBy ?? filters.sortBy,
          sortDescending: action.sortDescending ?? filters.sortDescending,
        };

        return this.departmentService.getDepartments(params).pipe(
          map(response => {
            const departments = Array.isArray(response.data) ? response.data : [];
            const totalItems =
              (response as { pagination?: { totalItems: number } }).pagination
                ?.totalItems ?? departments.length;

            return DepartmentActions.loadDepartmentsSuccess({
              departments,
              totalItems,
              currentPage: params.pageNumber ?? 1,
              pageSize: params.pageSize ?? 10,
            });
          }),
          catchError(error =>
            of(
              DepartmentActions.loadDepartmentsFailure({
                error: error.message || 'Failed to load departments',
              })
            )
          )
        );
      })
    )
  );

  // Load single department
  loadDepartment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DepartmentActions.loadDepartment),
      switchMap(action =>
        this.departmentService.getDepartmentById(action.id).pipe(
          map(department => DepartmentActions.loadDepartmentSuccess({ department })),
          catchError(error =>
            of(
              DepartmentActions.loadDepartmentFailure({
                error: error.message || 'Failed to load department',
              })
            )
          )
        )
      )
    )
  );

  // Create department
  createDepartment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DepartmentActions.createDepartment),
      switchMap(action => {
        const department = action.department;
        const createRequest: CreateDepartmentRequest = {
          Name: department.name,
          Code: department.code,
          Description: department.description || '',
          ParentDepartmentId: department.parentDepartmentId ?? null,
          Level: department.level || 1,
          Path: department.path || '',
        };

        return this.departmentService.createDepartment(createRequest).pipe(
          map(department => {
            console.log('✅ Effect: Department created successfully');
            return DepartmentActions.createDepartmentSuccess({ department });
          }),
          catchError(error => {
            console.log('❌ Effect: Department creation failed:', error);
            const errorMessage = error.message || 'Failed to create department';
            return of(
              DepartmentActions.createDepartmentFailure({
                error: errorMessage,
              })
            );
          })
        );
      })
    )
  );

  // Update department
  updateDepartment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DepartmentActions.updateDepartment),
      switchMap(action =>
        this.departmentService.updateDepartment(action.id, action.department).pipe(
          map(department => DepartmentActions.updateDepartmentSuccess({ department })),
          catchError(error =>
            of(
              DepartmentActions.updateDepartmentFailure({
                error: error.message || 'Failed to update department',
              })
            )
          )
        )
      )
    )
  );

  // Delete department
  deleteDepartment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DepartmentActions.deleteDepartment),
      switchMap(action =>
        this.departmentService.deleteDepartment(action.id).pipe(
          map(() => DepartmentActions.deleteDepartmentSuccess({ id: action.id })),
          catchError(error =>
            of(
              DepartmentActions.deleteDepartmentFailure({
                error: error.message || 'Failed to delete department',
              })
            )
          )
        )
      )
    )
  );

  // Reload departments when filters or pagination change
  reloadDepartmentsOnFilterChange$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        DepartmentActions.setFilters,
        DepartmentActions.setPagination,
        DepartmentActions.clearFilters
      ),
      switchMap(() => of(DepartmentActions.loadDepartments({})))
    )
  );

  // Reload departments after delete (ensure pagination info is correct)
  reloadDepartmentsAfterDelete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DepartmentActions.deleteDepartmentSuccess),
      switchMap(() => of(DepartmentActions.loadDepartments({})))
    )
  );
}

