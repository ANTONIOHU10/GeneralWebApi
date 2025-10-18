// Path: GeneralWebApi/Frontend/general-frontend/src/app/store/employee/employee.effects.ts
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';

import { EmployeeService } from '@core/services/employee.service';
import * as EmployeeActions from './employee.actions';
import { selectEmployeeFilters, selectEmployeePagination } from './employee.selectors';

@Injectable()
export class EmployeeEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private employeeService = inject(EmployeeService);

  // 加载员工列表
  loadEmployees$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmployeeActions.loadEmployees),
      withLatestFrom(
        this.store.select(selectEmployeeFilters),
        this.store.select(selectEmployeePagination)
      ),
      switchMap(([action, filters, pagination]) => {
        const params = {
          page: action.page ?? pagination.currentPage,
          pageSize: action.pageSize ?? pagination.pageSize,
          searchTerm: action.searchTerm ?? filters.searchTerm,
          department: action.department ?? filters.department,
          status: action.status ?? filters.status,
          sortBy: action.sortBy ?? filters.sortBy,
          sortDirection: action.sortDirection ?? filters.sortDirection,
        };

        return this.employeeService.getEmployees(params).pipe(
          map(response => {
            const employees = Array.isArray(response.data) ? response.data : [];
            const totalItems = (response as { pagination?: { totalItems: number } }).pagination?.totalItems ?? employees.length;
            
            return EmployeeActions.loadEmployeesSuccess({
              employees,
              totalItems,
              currentPage: params.page ?? 1,
              pageSize: params.pageSize ?? 10,
            });
          }),
          catchError(error => 
            of(EmployeeActions.loadEmployeesFailure({ 
              error: error.message || 'Failed to load employees' 
            }))
          )
        );
      })
    )
  );

  // 加载单个员工
  loadEmployee$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmployeeActions.loadEmployee),
      switchMap(action =>
        this.employeeService.getEmployeeById(action.id).pipe(
          map(employee => EmployeeActions.loadEmployeeSuccess({ employee })),
          catchError(error =>
            of(EmployeeActions.loadEmployeeFailure({ 
              error: error.message || 'Failed to load employee' 
            }))
          )
        )
      )
    )
  );

  // 创建员工
  createEmployee$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmployeeActions.createEmployee),
      switchMap(action =>
        this.employeeService.createEmployee(action.employee).pipe(
          map(employee => EmployeeActions.createEmployeeSuccess({ employee })),
          catchError(error =>
            of(EmployeeActions.createEmployeeFailure({ 
              error: error.message || 'Failed to create employee' 
            }))
          )
        )
      )
    )
  );

  // 更新员工
  updateEmployee$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmployeeActions.updateEmployee),
      switchMap(action =>
        this.employeeService.updateEmployee(action.id, action.employee).pipe(
          map(employee => EmployeeActions.updateEmployeeSuccess({ employee })),
          catchError(error =>
            of(EmployeeActions.updateEmployeeFailure({ 
              error: error.message || 'Failed to update employee' 
            }))
          )
        )
      )
    )
  );

  // 删除员工
  deleteEmployee$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmployeeActions.deleteEmployee),
      switchMap(action =>
        this.employeeService.deleteEmployee(action.id).pipe(
          map(() => EmployeeActions.deleteEmployeeSuccess({ id: action.id })),
          catchError(error =>
            of(EmployeeActions.deleteEmployeeFailure({ 
              error: error.message || 'Failed to delete employee' 
            }))
          )
        )
      )
    )
  );

  // 当过滤器或分页改变时，重新加载员工列表
  reloadEmployeesOnFilterChange$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        EmployeeActions.setFilters,
        EmployeeActions.setPagination,
        EmployeeActions.clearFilters
      ),
      switchMap(() => of(EmployeeActions.loadEmployees({})))
    )
  );
}

