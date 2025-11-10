// Path: GeneralWebApi/Frontend/general-frontend/src/app/Shared/services/loading.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError, from } from 'rxjs';
import { finalize, catchError, map, distinctUntilChanged } from 'rxjs/operators';

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number; // 0-100
}

/**
 * LoadingService - Global loading state management service
 * 
 * Purpose: Centralized loading indicator management across the application
 * - Manages global loading state with stack-based approach (supports multiple concurrent operations)
 * - Provides reactive Observable streams for components to subscribe
 * - Integrates seamlessly with RxJS operators for Angular reactive patterns
 * - Handles loading state for both Promise and Observable operations
 * 
 * Use Cases:
 * 1. **Direct control**: Manual show/hide for custom loading scenarios
 *    - Used by ActionService and OperationNotificationService
 *    - Best for: Complex flows with conditional loading
 * 
 * 2. **Observable wrapping**: Automatic loading for Observable operations
 *    - Use executeWithLoadingObservable() for simple cases
 *    - Best for: Direct HTTP calls without confirmation dialogs
 * 
 * 3. **Promise wrapping**: Automatic loading for Promise operations
 *    - Use executeWithLoadingFromPromise() for Promise-based code
 *    - Best for: Legacy code or third-party libraries using Promises
 * 
 * Relationship with other services:
 * - Used by ActionService for HTTP operation loading
 * - Used by OperationNotificationService for state-based loading
 * - Provides reactive streams for UI components
 * 
 * Usage:
 * - For Observable operations: Use executeWithLoadingObservable() with RxJS pipe
 * - For Promise operations: Use executeWithLoadingFromPromise() with async/await
 * - Direct control: Use show()/hide() methods for manual control
 */
@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  // Private Subject to prevent external modifications
  private readonly loadingSubject = new BehaviorSubject<LoadingState>({
    isLoading: false,
  });

  // Public readonly Observable - Angular best practice
  public readonly loading$: Observable<LoadingState> = this.loadingSubject.asObservable();

  // Computed observables for convenience
  public readonly isLoading$: Observable<boolean> = this.loading$.pipe(
    map(state => state.isLoading),
    distinctUntilChanged()
  );

  public readonly loadingMessage$: Observable<string | undefined> = this.loading$.pipe(
    map(state => state.message),
    distinctUntilChanged()
  );

  public readonly loadingProgress$: Observable<number | undefined> = this.loading$.pipe(
    map(state => state.progress),
    distinctUntilChanged()
  );

  private loadingStack: string[] = []; // Stack to handle multiple loading operations

  /**
   * Show loading indicator
   * @param message Optional loading message
   * @returns Loading ID for tracking
   */
  show(message?: string): string {
    const id = this.generateId();
    this.loadingStack.push(id);

    this.loadingSubject.next({
      isLoading: true,
      message: message || 'Loading...',
    });

    return id;
  }

  /**
   * Hide loading indicator
   * @param id Optional loading ID to remove from stack
   */
  hide(id?: string): void {
    if (id) {
      const index = this.loadingStack.indexOf(id);
      if (index > -1) {
        this.loadingStack.splice(index, 1);
      }
    } else {
      this.loadingStack.pop();
    }

    // Only hide if stack is empty
    if (this.loadingStack.length === 0) {
      this.loadingSubject.next({
        isLoading: false,
      });
    }
  }

  /**
   * Update loading message
   */
  setMessage(message: string): void {
    const currentState = this.loadingSubject.value;
    if (currentState.isLoading) {
      this.loadingSubject.next({
        ...currentState,
        message,
      });
    }
  }

  /**
   * Update loading progress (0-100)
   */
  setProgress(progress: number): void {
    const currentState = this.loadingSubject.value;
    if (currentState.isLoading) {
      this.loadingSubject.next({
        ...currentState,
        progress: Math.max(0, Math.min(100, progress)),
      });
    }
  }

  /**
   * Check if loading is active
   */
  isLoading(): boolean {
    return this.loadingSubject.value.isLoading;
  }

  /**
   * Get current loading state
   */
  getState(): LoadingState {
    return { ...this.loadingSubject.value };
  }

  /**
   * Force hide all loading indicators (clears stack)
   */
  forceHide(): void {
    this.loadingStack = [];
    this.loadingSubject.next({
      isLoading: false,
    });
  }

  /**
   * Execute Observable operation with loading indicator (RxJS-based)
   * Recommended for Angular reactive patterns - integrates seamlessly with RxJS operators
   * 
   * @param operation Observable operation to execute
   * @param message Optional loading message
   * @returns Observable that emits the operation result
   * 
   * @example
   * ```typescript
   * this.loadingService
   *   .executeWithLoadingObservable(
   *     () => this.http.get<Employee[]>('/api/employees'),
   *     'Loading employees...'
   *   )
   *   .pipe(
   *     map(data => data.items),
   *     catchError(error => {
   *       this.notificationService.error('Error', error.message);
   *       return of([]);
   *     })
   *   )
   *   .subscribe(employees => this.employees = employees);
   * ```
   */
  executeWithLoadingObservable<T>(
    operation: () => Observable<T>,
    message?: string
  ): Observable<T> {
    const id = this.show(message);

    return operation().pipe(
      finalize(() => {
        // Always hide loading indicator, regardless of success or error
        // finalize ensures cleanup happens even if subscription is unsubscribed
        this.hide(id);
      }),
      catchError((error) => {
        // Re-throw error after cleanup (finalize already executed)
        return throwError(() => error);
      })
    );
  }

  /**
   * Execute Promise-based operation with loading indicator (converts to Observable)
   * Recommended for Promise-based operations that need to be integrated with RxJS
   * Uses RxJS from() to convert Promise to Observable
   * 
   * @param operation Promise-based operation to execute
   * @param message Optional loading message
   * @returns Observable that emits the operation result
   * 
   * @example
   * ```typescript
   * this.loadingService
   *   .executeWithLoadingFromPromise(
   *     () => this.dataService.fetch(),
   *     'Loading data...'
   *   )
   *   .pipe(
   *     catchError(error => {
   *       this.notificationService.error('Error', error.message);
   *       return of(null);
   *     })
   *   )
   *   .subscribe(data => {
   *     if (data) {
   *       this.items = data;
   *     }
   *   });
   * ```
   */
  executeWithLoadingFromPromise<T>(
    operation: () => Promise<T>,
    message?: string
  ): Observable<T> {
    const id = this.show(message);
    
    return from(operation()).pipe(
      finalize(() => {
        // Always hide loading indicator, regardless of success or error
        this.hide(id);
      }),
      catchError((error) => {
        // Re-throw error after cleanup
        return throwError(() => error);
      })
    );
  }

  /**
   * Generate unique loading ID
   * Uses timestamp + random string for uniqueness
   */
  private generateId(): string {
    return `loading-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}

