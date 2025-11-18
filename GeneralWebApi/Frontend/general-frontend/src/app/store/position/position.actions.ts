// Path: GeneralWebApi/Frontend/general-frontend/src/app/store/position/position.actions.ts
import { createAction, props } from '@ngrx/store';
import { Position } from 'app/contracts/positions/position.model';

// Load positions list
export const loadPositions = createAction(
  '[Position] Load Positions',
  props<{
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
    departmentId?: number | null;
    level?: number | null;
    isManagement?: boolean | null;
    sortBy?: string;
    sortDescending?: boolean;
  }>()
);

export const loadPositionsSuccess = createAction(
  '[Position] Load Positions Success',
  props<{
    positions: Position[];
    totalItems: number;
    currentPage: number;
    pageSize: number;
  }>()
);

export const loadPositionsFailure = createAction(
  '[Position] Load Positions Failure',
  props<{ error: string }>()
);

// Load single position
export const loadPosition = createAction(
  '[Position] Load Position',
  props<{ id: string }>()
);

export const loadPositionSuccess = createAction(
  '[Position] Load Position Success',
  props<{ position: Position }>()
);

export const loadPositionFailure = createAction(
  '[Position] Load Position Failure',
  props<{ error: string }>()
);

// Create position
export const createPosition = createAction(
  '[Position] Create Position',
  props<{ position: Omit<Position, 'id'> }>()
);

export const createPositionSuccess = createAction(
  '[Position] Create Position Success',
  props<{ position: Position }>()
);

export const createPositionFailure = createAction(
  '[Position] Create Position Failure',
  props<{ error: string }>()
);

// Update position
export const updatePosition = createAction(
  '[Position] Update Position',
  props<{ id: string; position: Partial<Position> }>()
);

export const updatePositionSuccess = createAction(
  '[Position] Update Position Success',
  props<{ position: Position }>()
);

export const updatePositionFailure = createAction(
  '[Position] Update Position Failure',
  props<{ error: string }>()
);

// Delete position
export const deletePosition = createAction(
  '[Position] Delete Position',
  props<{ id: string }>()
);

export const deletePositionSuccess = createAction(
  '[Position] Delete Position Success',
  props<{ id: string }>()
);

export const deletePositionFailure = createAction(
  '[Position] Delete Position Failure',
  props<{ error: string }>()
);

// Select position
export const selectPosition = createAction(
  '[Position] Select Position',
  props<{ position: Position | null }>()
);

// Clear selection
export const clearSelectedPosition = createAction(
  '[Position] Clear Selected Position'
);

// Set filters
export const setFilters = createAction(
  '[Position] Set Filters',
  props<{
    searchTerm?: string;
    departmentId?: number | null;
    level?: number | null;
    isManagement?: boolean | null;
    sortBy?: string;
    sortDescending?: boolean;
  }>()
);

// Clear filters
export const clearFilters = createAction('[Position] Clear Filters');

// Set pagination
export const setPagination = createAction(
  '[Position] Set Pagination',
  props<{
    currentPage?: number;
    pageSize?: number;
  }>()
);

// Clear error
export const clearError = createAction('[Position] Clear Error');

// Reset state
export const resetPositionState = createAction('[Position] Reset State');

