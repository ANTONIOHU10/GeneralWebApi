// Path: GeneralWebApi/Frontend/general-frontend/src/app/store/department/department.facade.ts
import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { Department } from 'app/contracts/departments/department.model';
import * as DepartmentActions from './department.actions';
import * as DepartmentSelectors from './department.selectors';

@Injectable({
  providedIn: 'root',
})
export class DepartmentFacade {
  private store = inject(Store);

  // State selectors
  departments$ = this.store.select(DepartmentSelectors.selectAllDepartments);
  filteredDepartments$ = this.store.select(
    DepartmentSelectors.selectFilteredDepartments
  );
  selectedDepartment$ = this.store.select(
    DepartmentSelectors.selectSelectedDepartment
  );
  loading$ = this.store.select(DepartmentSelectors.selectDepartmentLoading);
  error$ = this.store.select(DepartmentSelectors.selectDepartmentError);
  pagination$ = this.store.select(DepartmentSelectors.selectDepartmentPagination);
  filters$ = this.store.select(DepartmentSelectors.selectDepartmentFilters);
  operationInProgress$ = this.store.select(
    DepartmentSelectors.selectOperationInProgress
  );

  // Methods - using backend format
  loadDepartments(params?: {
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
    parentDepartmentId?: number | null;
    level?: number | null;
    sortBy?: string;
    sortDescending?: boolean;
  }) {
    this.store.dispatch(DepartmentActions.loadDepartments(params || {}));
  }

  loadDepartment(id: string) {
    this.store.dispatch(DepartmentActions.loadDepartment({ id }));
  }

  createDepartment(department: Omit<Department, 'id'>) {
    this.store.dispatch(DepartmentActions.createDepartment({ department }));
  }

  updateDepartment(id: string, department: Partial<Department>) {
    this.store.dispatch(DepartmentActions.updateDepartment({ id, department }));
  }

  deleteDepartment(id: string) {
    this.store.dispatch(DepartmentActions.deleteDepartment({ id }));
  }

  selectDepartment(department: Department | null) {
    this.store.dispatch(DepartmentActions.selectDepartment({ department }));
  }

  clearSelectedDepartment() {
    this.store.dispatch(DepartmentActions.clearSelectedDepartment());
  }

  setFilters(filters: {
    searchTerm?: string;
    parentDepartmentId?: number | null;
    level?: number | null;
    sortBy?: string;
    sortDescending?: boolean;
  }) {
    this.store.dispatch(DepartmentActions.setFilters(filters));
  }

  clearFilters() {
    this.store.dispatch(DepartmentActions.clearFilters());
  }

  setPagination(pagination: { currentPage?: number; pageSize?: number }) {
    this.store.dispatch(DepartmentActions.setPagination(pagination));
  }

  clearError() {
    this.store.dispatch(DepartmentActions.clearError());
  }

  resetState() {
    this.store.dispatch(DepartmentActions.resetDepartmentState());
  }
}

