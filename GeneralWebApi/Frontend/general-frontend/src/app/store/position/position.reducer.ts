// Path: GeneralWebApi/Frontend/general-frontend/src/app/store/position/position.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { initialPositionState } from './position.state';
import * as PositionActions from './position.actions';

export const positionReducer = createReducer(
  initialPositionState,

  // Load positions list
  on(PositionActions.loadPositions, state => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(
    PositionActions.loadPositionsSuccess,
    (state, { positions, totalItems, currentPage, pageSize }) => ({
      ...state,
      positions,
      loading: false,
      error: null,
      pagination: {
        ...state.pagination,
        totalItems,
        currentPage,
        pageSize,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    })
  ),

  on(PositionActions.loadPositionsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Load single position
  on(PositionActions.loadPosition, state => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(PositionActions.loadPositionSuccess, (state, { position }) => ({
    ...state,
    selectedPosition: position,
    loading: false,
    error: null,
  })),

  on(PositionActions.loadPositionFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Create position
  on(PositionActions.createPosition, state => ({
    ...state,
    operationInProgress: {
      loading: true,
      operation: 'create' as const,
      positionId: null,
    },
    error: null,
  })),

  on(PositionActions.createPositionSuccess, (state, { position }) => ({
    ...state,
    positions: [...state.positions, position],
    operationInProgress: {
      loading: false,
      operation: null,
      positionId: null,
    },
    error: null,
  })),

  on(PositionActions.createPositionFailure, (state, { error }) => ({
    ...state,
    operationInProgress: {
      loading: false,
      operation: null,
      positionId: null,
    },
    error,
  })),

  // Update position
  on(PositionActions.updatePosition, (state, { id }) => ({
    ...state,
    operationInProgress: {
      loading: true,
      operation: 'update' as const,
      positionId: id,
    },
    error: null,
  })),

  on(PositionActions.updatePositionSuccess, (state, { position }) => ({
    ...state,
    positions: state.positions.map(pos =>
      pos.id === position.id ? position : pos
    ),
    selectedPosition:
      state.selectedPosition?.id === position.id
        ? position
        : state.selectedPosition,
    operationInProgress: {
      loading: false,
      operation: null,
      positionId: null,
    },
    error: null,
  })),

  on(PositionActions.updatePositionFailure, (state, { error }) => ({
    ...state,
    operationInProgress: {
      loading: false,
      operation: null,
      positionId: null,
    },
    error,
  })),

  // Delete position
  on(PositionActions.deletePosition, (state, { id }) => ({
    ...state,
    operationInProgress: {
      loading: true,
      operation: 'delete' as const,
      positionId: id,
    },
    error: null,
  })),

  on(PositionActions.deletePositionSuccess, (state, { id }) => ({
    ...state,
    positions: state.positions.filter(pos => pos.id !== id),
    selectedPosition:
      state.selectedPosition?.id === id ? null : state.selectedPosition,
    operationInProgress: {
      loading: false,
      operation: null,
      positionId: null,
    },
    error: null,
  })),

  on(PositionActions.deletePositionFailure, (state, { error }) => ({
    ...state,
    operationInProgress: {
      loading: false,
      operation: null,
      positionId: null,
    },
    error,
  })),

  // Select position
  on(PositionActions.selectPosition, (state, { position }) => ({
    ...state,
    selectedPosition: position,
  })),

  // Clear selection
  on(PositionActions.clearSelectedPosition, state => ({
    ...state,
    selectedPosition: null,
  })),

  // Set filters
  on(PositionActions.setFilters, (state, filters) => ({
    ...state,
    filters: {
      ...state.filters,
      ...filters,
    },
    pagination: {
      ...state.pagination,
      currentPage: 1,
    },
  })),

  // Clear filters
  on(PositionActions.clearFilters, state => ({
    ...state,
    filters: {
      searchTerm: '',
      departmentId: null,
      level: null,
      isManagement: null,
      sortBy: 'title',
      sortDescending: false,
    },
    pagination: {
      ...state.pagination,
      currentPage: 1,
    },
  })),

  // Set pagination
  on(PositionActions.setPagination, (state, pagination) => ({
    ...state,
    pagination: {
      ...state.pagination,
      ...pagination,
    },
  })),

  // Clear error
  on(PositionActions.clearError, state => ({
    ...state,
    error: null,
  })),

  // Reset state
  on(PositionActions.resetPositionState, () => initialPositionState)
);

