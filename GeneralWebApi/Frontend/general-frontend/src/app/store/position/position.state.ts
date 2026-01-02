// Path: GeneralWebApi/Frontend/general-frontend/src/app/store/position/position.state.ts
import { Position } from 'app/contracts/positions/position.model';

export interface PositionState {
  // Position list
  positions: Position[];

  // Currently selected position
  selectedPosition: Position | null;

  // Loading state
  loading: boolean;

  // Error message
  error: string | null;

  // Pagination info
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };

  // Search and filters - using backend format
  filters: {
    searchTerm: string;
    departmentId: number | null;
    level: number | null;
    isManagement: boolean | null;
    sortBy: string;
    sortDescending: boolean;
  };

  // Operation state
  operationInProgress: {
    loading: boolean;
    operation: 'create' | 'update' | 'delete' | null;
    positionId: string | null;
  };
}

export const initialPositionState: PositionState = {
  positions: [],
  selectedPosition: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    pageSize: 5,
    totalItems: 0,
    totalPages: 0,
  },
  filters: {
    searchTerm: '',
    departmentId: null,
    level: null,
    isManagement: null,
    sortBy: 'title',
    sortDescending: false,
  },
  operationInProgress: {
    loading: false,
    operation: null,
    positionId: null,
  },
};

