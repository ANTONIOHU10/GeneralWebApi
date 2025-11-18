// Path: GeneralWebApi/Frontend/general-frontend/src/app/store/position/position.effects.ts
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';

import { PositionService } from '@core/services/position.service';
import * as PositionActions from './position.actions';
import {
  selectPositionFilters,
  selectPositionPagination,
} from './position.selectors';
import { CreatePositionRequest, PositionSearchParams } from 'app/contracts/positions/position.model';

@Injectable()
export class PositionEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private positionService = inject(PositionService);

  // Load positions list
  loadPositions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PositionActions.loadPositions),
      withLatestFrom(
        this.store.select(selectPositionFilters),
        this.store.select(selectPositionPagination)
      ),
      switchMap(([action, filters, pagination]) => {
        const params: PositionSearchParams = {
          pageNumber: action.pageNumber ?? pagination.currentPage,
          pageSize: action.pageSize ?? pagination.pageSize,
          searchTerm: action.searchTerm ?? filters.searchTerm,
          departmentId: action.departmentId ?? filters.departmentId,
          level: action.level ?? filters.level,
          isManagement: action.isManagement ?? filters.isManagement,
          sortBy: action.sortBy ?? filters.sortBy,
          sortDescending: action.sortDescending ?? filters.sortDescending,
        };

        return this.positionService.getPositions(params).pipe(
          map(response => {
            const positions = Array.isArray(response.data) ? response.data : [];
            const totalItems =
              (response as { pagination?: { totalItems: number } }).pagination
                ?.totalItems ?? positions.length;

            return PositionActions.loadPositionsSuccess({
              positions,
              totalItems,
              currentPage: params.pageNumber ?? 1,
              pageSize: params.pageSize ?? 10,
            });
          }),
          catchError(error =>
            of(
              PositionActions.loadPositionsFailure({
                error: error.message || 'Failed to load positions',
              })
            )
          )
        );
      })
    )
  );

  // Load single position
  loadPosition$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PositionActions.loadPosition),
      switchMap(action =>
        this.positionService.getPositionById(action.id).pipe(
          map(position => PositionActions.loadPositionSuccess({ position })),
          catchError(error =>
            of(
              PositionActions.loadPositionFailure({
                error: error.message || 'Failed to load position',
              })
            )
          )
        )
      )
    )
  );

  // Create position
  createPosition$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PositionActions.createPosition),
      switchMap(action => {
        const position = action.position;
        const createRequest: CreatePositionRequest = {
          Title: position.title,
          Code: position.code,
          Description: position.description || '',
          DepartmentId: position.departmentId || 0,
          Level: position.level || 1,
          ParentPositionId: position.parentPositionId ?? null,
          MinSalary: position.minSalary ?? null,
          MaxSalary: position.maxSalary ?? null,
          IsManagement: position.isManagement ?? false,
        };

        return this.positionService.createPosition(createRequest).pipe(
          map(position => {
            console.log('✅ Effect: Position created successfully');
            return PositionActions.createPositionSuccess({ position });
          }),
          catchError(error => {
            console.log('❌ Effect: Position creation failed:', error);
            const errorMessage = error.message || 'Failed to create position';
            return of(
              PositionActions.createPositionFailure({
                error: errorMessage,
              })
            );
          })
        );
      })
    )
  );

  // Update position
  updatePosition$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PositionActions.updatePosition),
      switchMap(action =>
        this.positionService.updatePosition(action.id, action.position).pipe(
          map(position => PositionActions.updatePositionSuccess({ position })),
          catchError(error =>
            of(
              PositionActions.updatePositionFailure({
                error: error.message || 'Failed to update position',
              })
            )
          )
        )
      )
    )
  );

  // Delete position
  deletePosition$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PositionActions.deletePosition),
      switchMap(action =>
        this.positionService.deletePosition(action.id).pipe(
          map(() => PositionActions.deletePositionSuccess({ id: action.id })),
          catchError(error =>
            of(
              PositionActions.deletePositionFailure({
                error: error.message || 'Failed to delete position',
              })
            )
          )
        )
      )
    )
  );

  // Reload positions when filters or pagination change
  reloadPositionsOnFilterChange$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        PositionActions.setFilters,
        PositionActions.setPagination,
        PositionActions.clearFilters
      ),
      switchMap(() => of(PositionActions.loadPositions({})))
    )
  );

  // Reload positions after delete (ensure pagination info is correct)
  reloadPositionsAfterDelete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PositionActions.deletePositionSuccess),
      switchMap(() => of(PositionActions.loadPositions({})))
    )
  );
}

