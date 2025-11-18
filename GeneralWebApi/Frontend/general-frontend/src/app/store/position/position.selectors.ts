// Path: GeneralWebApi/Frontend/general-frontend/src/app/store/position/position.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PositionState } from './position.state';

// Select entire position state
export const selectPositionState =
  createFeatureSelector<PositionState>('position');

// Basic selectors
export const selectAllPositions = createSelector(
  selectPositionState,
  (state: PositionState) => state.positions
);

export const selectSelectedPosition = createSelector(
  selectPositionState,
  (state: PositionState) => state.selectedPosition
);

export const selectPositionLoading = createSelector(
  selectPositionState,
  (state: PositionState) => state.loading
);

export const selectPositionError = createSelector(
  selectPositionState,
  (state: PositionState) => state.error
);

export const selectPositionPagination = createSelector(
  selectPositionState,
  (state: PositionState) => state.pagination
);

export const selectPositionFilters = createSelector(
  selectPositionState,
  (state: PositionState) => state.filters
);

export const selectOperationInProgress = createSelector(
  selectPositionState,
  (state: PositionState) => state.operationInProgress
);

// Composite selectors
export const selectFilteredPositions = createSelector(
  selectAllPositions,
  selectPositionFilters,
  (positions, filters) => {
    let filtered = [...positions];

    // Filter by search term
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        pos =>
          pos.title.toLowerCase().includes(searchTerm) ||
          pos.code.toLowerCase().includes(searchTerm) ||
          pos.description.toLowerCase().includes(searchTerm) ||
          pos.departmentName?.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by department
    if (filters.departmentId !== null) {
      filtered = filtered.filter(
        pos => pos.departmentId === filters.departmentId
      );
    }

    // Filter by level
    if (filters.level !== null) {
      filtered = filtered.filter(pos => pos.level === filters.level);
    }

    // Filter by isManagement
    if (filters.isManagement !== null) {
      filtered = filtered.filter(
        pos => pos.isManagement === filters.isManagement
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const aValue = getNestedValue(
        a as unknown as Record<string, unknown>,
        filters.sortBy
      );
      const bValue = getNestedValue(
        b as unknown as Record<string, unknown>,
        filters.sortBy
      );

      const aStr = String(aValue ?? '');
      const bStr = String(bValue ?? '');

      // sortDescending: false = ascending, true = descending
      if (aStr < bStr) return filters.sortDescending ? 1 : -1;
      if (aStr > bStr) return filters.sortDescending ? -1 : 1;
      return 0;
    });

    return filtered;
  }
);

export const selectPositionById = (id: string) =>
  createSelector(selectAllPositions, positions =>
    positions.find(position => position.id === id)
  );

export const selectPositionsByDepartment = (departmentId: number) =>
  createSelector(selectAllPositions, positions =>
    positions.filter(pos => pos.departmentId === departmentId)
  );

export const selectManagementPositions = createSelector(
  selectAllPositions,
  positions => positions.filter(pos => pos.isManagement)
);

// Helper function
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return (
    path
      .split('.')
      .reduce<unknown>(
        (current, key) => (current as Record<string, unknown>)?.[key],
        obj
      ) ?? ''
  );
}

