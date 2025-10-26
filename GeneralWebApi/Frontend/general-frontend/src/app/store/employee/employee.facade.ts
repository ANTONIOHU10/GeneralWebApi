// Path: GeneralWebApi/Frontend/general-frontend/src/app/store/employee/employee.facade.ts
import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { Employee } from 'app/contracts/employees/employee.model';
import * as EmployeeActions from './employee.actions';
import * as EmployeeSelectors from './employee.selectors';

@Injectable({
  providedIn: 'root',
})
export class EmployeeFacade {
  private store = inject(Store);

  // 状态选择器
  employees$ = this.store.select(EmployeeSelectors.selectAllEmployees);
  filteredEmployees$ = this.store.select(
    EmployeeSelectors.selectFilteredEmployees
  );
  selectedEmployee$ = this.store.select(
    EmployeeSelectors.selectSelectedEmployee
  );
  loading$ = this.store.select(EmployeeSelectors.selectEmployeeLoading);
  error$ = this.store.select(EmployeeSelectors.selectEmployeeError);
  pagination$ = this.store.select(EmployeeSelectors.selectEmployeePagination);
  filters$ = this.store.select(EmployeeSelectors.selectEmployeeFilters);
  operationInProgress$ = this.store.select(
    EmployeeSelectors.selectOperationInProgress
  );
  employeeStats$ = this.store.select(EmployeeSelectors.selectEmployeeStats);

  // 方法
  loadEmployees(params?: {
    page?: number;
    pageSize?: number;
    searchTerm?: string;
    department?: string;
    status?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }) {
    this.store.dispatch(EmployeeActions.loadEmployees(params || {}));
  }

  loadEmployee(id: string) {
    this.store.dispatch(EmployeeActions.loadEmployee({ id }));
  }

  createEmployee(employee: Omit<Employee, 'id'>) {
    this.store.dispatch(EmployeeActions.createEmployee({ employee }));
  }

  updateEmployee(id: string, employee: Partial<Employee>) {
    this.store.dispatch(EmployeeActions.updateEmployee({ id, employee }));
  }

  deleteEmployee(id: string) {
    this.store.dispatch(EmployeeActions.deleteEmployee({ id }));
  }

  selectEmployee(employee: Employee | null) {
    this.store.dispatch(EmployeeActions.selectEmployee({ employee }));
  }

  clearSelectedEmployee() {
    this.store.dispatch(EmployeeActions.clearSelectedEmployee());
  }

  setFilters(filters: {
    searchTerm?: string;
    department?: string;
    status?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }) {
    this.store.dispatch(EmployeeActions.setFilters(filters));
  }

  clearFilters() {
    this.store.dispatch(EmployeeActions.clearFilters());
  }

  setPagination(pagination: { currentPage?: number; pageSize?: number }) {
    this.store.dispatch(EmployeeActions.setPagination(pagination));
  }

  clearError() {
    this.store.dispatch(EmployeeActions.clearError());
  }

  resetState() {
    this.store.dispatch(EmployeeActions.resetEmployeeState());
  }

  // 便捷方法
  getEmployeeById(id: string): Observable<Employee | undefined> {
    return this.store.select(EmployeeSelectors.selectEmployeeById(id));
  }

  getEmployeesByDepartment(department: string): Observable<Employee[]> {
    return this.store.select(
      EmployeeSelectors.selectEmployeesByDepartment(department)
    );
  }

  getActiveEmployees(): Observable<Employee[]> {
    return this.store.select(EmployeeSelectors.selectActiveEmployees);
  }

  isOperationInProgress(
    operation?: 'create' | 'update' | 'delete'
  ): Observable<boolean> {
    return this.store.select(
      EmployeeSelectors.selectIsEmployeeLoading(operation)
    );
  }
}
