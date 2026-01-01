// Path: GeneralWebApi/Frontend/general-frontend/src/app/store/employee/employee.effects.ts
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, map, switchMap, withLatestFrom, tap } from 'rxjs/operators';
import { of } from 'rxjs';

import { EmployeeService } from '@core/services/employee.service';
import * as EmployeeActions from './employee.actions';
import {
  selectEmployeeFilters,
  selectEmployeePagination,
} from './employee.selectors';
import { CreateEmployeeRequest } from 'app/contracts/employees/employee.model';

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
        // Use backend format directly - no conversion needed
        const params = {
          pageNumber: action.pageNumber ?? pagination.currentPage,
          pageSize: action.pageSize ?? pagination.pageSize,
          searchTerm: action.searchTerm ?? filters.searchTerm,
          department: action.department ?? filters.department,
          employmentStatus: action.employmentStatus ?? filters.employmentStatus,
          sortBy: action.sortBy ?? filters.sortBy,
          sortDescending: action.sortDescending ?? filters.sortDescending,
        };

        return this.employeeService.getEmployees(params).pipe(
          map(response => {
            const employees = Array.isArray(response.data) ? response.data : [];
            const totalItems =
              (response as { pagination?: { totalItems: number } }).pagination
                ?.totalItems ?? employees.length;

            return EmployeeActions.loadEmployeesSuccess({
              employees,
              totalItems,
              currentPage: params.pageNumber ?? 1,
              pageSize: params.pageSize ?? 10,
            });
          }),
          catchError(error =>
            of(
              EmployeeActions.loadEmployeesFailure({
                error: error.message || 'Failed to load employees',
              })
            )
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
            of(
              EmployeeActions.loadEmployeeFailure({
                error: error.message || 'Failed to load employee',
              })
            )
          )
        )
      )
    )
  );

  // 创建员工
  createEmployee$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmployeeActions.createEmployee),
      switchMap(action => {
        // Convert Omit<Employee, 'id'> to CreateEmployeeRequest
        const employee = action.employee;
        const createRequest: CreateEmployeeRequest = {
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          hireDate: employee.hireDate || new Date().toISOString().split('T')[0],
          employmentStatus: employee.status || 'Active',
          employmentType: employee.employmentType || 'FullTime',
          taxCode: employee.taxCode || '',
          // Optional fields
          ...(employee.employeeNumber ? { employeeNumber: employee.employeeNumber } : {}),
          ...(employee.phone ? { phoneNumber: employee.phone } : {}),
          ...(employee.departmentId ? { departmentId: employee.departmentId } : {}),
          ...(employee.positionId ? { positionId: employee.positionId } : {}),
          ...(employee.managerId ? { managerId: parseInt(employee.managerId, 10) } : {}),
          ...(employee.salary ? { currentSalary: employee.salary } : {}),
          ...(employee.salaryCurrency ? { salaryCurrency: employee.salaryCurrency } : {}),
          ...(employee.address?.street ? { address: employee.address.street } : {}),
          ...(employee.address?.city ? { city: employee.address.city } : {}),
          ...(employee.address?.zipCode ? { postalCode: employee.address.zipCode } : {}),
          ...(employee.address?.country ? { country: employee.address.country } : {}),
          ...(employee.emergencyContact?.name ? { emergencyContactName: employee.emergencyContact.name } : {}),
          ...(employee.emergencyContact?.phone ? { emergencyContactPhone: employee.emergencyContact.phone } : {}),
          ...(employee.emergencyContact?.relation ? { emergencyContactRelation: employee.emergencyContact.relation } : {}),
        };
        
        return this.employeeService.createEmployee(createRequest).pipe(
          map(employee => {
            console.log('✅ Effect: Employee created successfully');
            return EmployeeActions.createEmployeeSuccess({ employee });
          }),
          catchError(error => {
            console.log('❌ Effect: Employee creation failed:', error);
            const errorMessage = error.message || 'Failed to create employee';
            console.log('📤 Effect: Dispatching failure with message:', errorMessage);
            return of(
              EmployeeActions.createEmployeeFailure({
                error: errorMessage,
              })
            );
          })
        );
      })
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
            of(
              EmployeeActions.updateEmployeeFailure({
                error: error.message || 'Failed to update employee',
              })
            )
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
            of(
              EmployeeActions.deleteEmployeeFailure({
                error: error.message || 'Failed to delete employee',
              })
            )
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

  // 删除成功后重新加载员工列表（确保分页信息正确）
  reloadEmployeesAfterDelete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmployeeActions.deleteEmployeeSuccess),
      switchMap(() => of(EmployeeActions.loadEmployees({})))
    )
  );

  // Note: No auto-reload after create - the reducer adds the new employee to the store directly
  // This avoids unnecessary GET requests
}
