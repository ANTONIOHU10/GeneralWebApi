// Path: GeneralWebApi/Frontend/general-frontend/src/app/Shared/services/loading.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
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
 * Usage:
 * - For Observable operations: Use executeWithLoadingObservable() with RxJS pipe
 * - For Promise operations: Use executeWithLoadingAndErrorHandling() with async/await
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
   * Execute async operation with loading indicator using async/await
   * Recommended for Promise-based operations with clean async/await syntax
   * 
   * @param operation Async operation to execute
   * @param message Optional loading message
   * @param onError Optional error handler callback
   * @returns Promise that resolves with the operation result or rejects with error
   * 
   * @example
   * ```typescript
   * try {
   *   const data = await this.loadingService.executeWithLoadingAndErrorHandling(
   *     () => this.dataService.fetch(),
   *     'Loading data...',
   *     (error) => this.notificationService.error('Error', error.message)
   *   );
   *   this.items = data;
   * } catch (error) {
   *   // Error already handled by onError callback
   * }
   * ```
   */
  async executeWithLoadingAndErrorHandling<T>(
    operation: () => Promise<T>,
    message?: string,
    onError?: (error: unknown) => void
  ): Promise<T> {
    const id = this.show(message);
    try {
      const result = await operation();
      return result;
    } catch (error) {
      if (onError) {
        onError(error);
      }
      throw error;
    } finally {
      // Always hide loading indicator, even if error occurs
      this.hide(id);
    }
  }

  /**
   * Generate unique loading ID
   * Uses timestamp + random string for uniqueness
   */
  private generateId(): string {
    return `loading-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}

