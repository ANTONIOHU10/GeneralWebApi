// Path: GeneralWebApi/Frontend/general-frontend/src/app/store/position/position.facade.ts
import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { Position } from 'app/contracts/positions/position.model';
import * as PositionActions from './position.actions';
import * as PositionSelectors from './position.selectors';

@Injectable({
  providedIn: 'root',
})
export class PositionFacade {
  private store = inject(Store);

  // State selectors
  positions$ = this.store.select(PositionSelectors.selectAllPositions);
  filteredPositions$ = this.store.select(
    PositionSelectors.selectFilteredPositions
  );
  selectedPosition$ = this.store.select(
    PositionSelectors.selectSelectedPosition
  );
  loading$ = this.store.select(PositionSelectors.selectPositionLoading);
  error$ = this.store.select(PositionSelectors.selectPositionError);
  pagination$ = this.store.select(PositionSelectors.selectPositionPagination);
  filters$ = this.store.select(PositionSelectors.selectPositionFilters);
  operationInProgress$ = this.store.select(
    PositionSelectors.selectOperationInProgress
  );

  // Methods - using backend format
  loadPositions(params?: {
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
    departmentId?: number | null;
    level?: number | null;
    isManagement?: boolean | null;
    sortBy?: string;
    sortDescending?: boolean;
  }) {
    this.store.dispatch(PositionActions.loadPositions(params || {}));
  }

  loadPosition(id: string) {
    this.store.dispatch(PositionActions.loadPosition({ id }));
  }

  createPosition(position: Omit<Position, 'id'>) {
    this.store.dispatch(PositionActions.createPosition({ position }));
  }

  updatePosition(id: string, position: Partial<Position>) {
    this.store.dispatch(PositionActions.updatePosition({ id, position }));
  }

  deletePosition(id: string) {
    this.store.dispatch(PositionActions.deletePosition({ id }));
  }

  selectPosition(position: Position | null) {
    this.store.dispatch(PositionActions.selectPosition({ position }));
  }

  clearSelectedPosition() {
    this.store.dispatch(PositionActions.clearSelectedPosition());
  }

  setFilters(filters: {
    searchTerm?: string;
    departmentId?: number | null;
    level?: number | null;
    isManagement?: boolean | null;
    sortBy?: string;
    sortDescending?: boolean;
  }) {
    this.store.dispatch(PositionActions.setFilters(filters));
  }

  clearFilters() {
    this.store.dispatch(PositionActions.clearFilters());
  }

  setPagination(pagination: { currentPage?: number; pageSize?: number }) {
    this.store.dispatch(PositionActions.setPagination(pagination));
  }

  clearError() {
    this.store.dispatch(PositionActions.clearError());
  }

  resetState() {
    this.store.dispatch(PositionActions.resetPositionState());
  }
}

