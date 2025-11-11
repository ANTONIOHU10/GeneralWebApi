// Path: GeneralWebApi/Frontend/general-frontend/src/app/core/services/action.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { switchMap, filter, tap, finalize, catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { DialogService } from 'app/Shared/services/dialog.service';
import { BaseHttpService } from './base-http.service';
import { NotificationService } from 'app/Shared/services/notification.service';
import { LoadingService } from 'app/Shared/services/loading.service';

export interface ActionConfig<TRequest = unknown, TResponse = unknown> {
  // API configuration
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  body?: TRequest;
  params?: Record<string, unknown>;

  // Confirmation dialog configuration
  confirm?: {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'primary' | 'danger' | 'warning';
    icon?: string;
  };

  // Response handling
  onSuccess?: (response: TResponse) => void;
  onError?: (error: Error) => void;
  showLoading?: boolean;
  loadingMessage?: string;
  showSuccessNotification?: boolean | string; // true for default message, or custom message string
  showErrorNotification?: boolean | string; // true for default message, or custom message string
}

/**
 * ActionService - Unified action execution service
 * 
 * Purpose: Provides a unified interface for executing HTTP actions with:
 * - Automatic confirmation dialogs (via DialogService)
 * - Loading indicators (via LoadingService)
 * - Success/error notifications (via NotificationService)
 * - Error handling
 * - Type-safe API calls
 * 
 * Use Cases:
 * 1. **Direct HTTP operations**: When you need confirmation + execution + notifications
 *    - Best for: CRUD operations that need user confirmation
 *    - Handles: Dialog → Loading → API → Success/Error notification
 * 
 * 2. **Service layer convenience methods**: Used by domain services (e.g., EmployeeService)
 *    - Provides consistent UX across the application
 *    - Reduces boilerplate in feature components
 * 
 * Relationship with other services:
 * - Uses DialogService for confirmations
 * - Uses LoadingService for loading state (manual show/hide)
 * - Uses NotificationService for notifications
 * - Can work alongside OperationNotificationService (set autoShowLoading: false)
 * 
 * Usage:
 * ```typescript
 * // Basic usage
 * this.actionService.execute({
 *   method: 'DELETE',
 *   endpoint: `${this.baseUrl}/employees/${id}`,
 *   confirm: {
 *     message: `Are you sure you want to delete ${name}?`
 *   },
 *   showSuccessNotification: 'Employee deleted successfully',
 *   onSuccess: () => this.refreshList()
 * }).subscribe();
 * 
 * // Without confirmation
 * this.actionService.execute({
 *   method: 'GET',
 *   endpoint: `${this.baseUrl}/employees`,
 *   showLoading: true,
 *   loadingMessage: 'Loading employees...'
 * }).subscribe(employees => {
 *   this.employees = employees;
 * });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class ActionService extends BaseHttpService {
  private dialogService = inject(DialogService);
  private notificationService = inject(NotificationService);
  private loadingService = inject(LoadingService);

  /**
   * Execute action with confirmation and automatic response handling
   * 
   * @param config Action configuration
   * @returns Observable that emits the response
   * 
   * @example
   * ```typescript
   * // Delete with confirmation
   * this.actionService.execute({
   *   method: 'DELETE',
   *   endpoint: `${this.baseUrl}/employees/${id}`,
   *   confirm: {
   *     message: `Are you sure you want to delete ${name}?`,
   *     title: 'Confirm Delete'
   *   },
   *   showSuccessNotification: 'Employee deleted successfully',
   *   onSuccess: () => this.refreshList()
   * }).subscribe();
   * 
   * // Update with confirmation
   * this.actionService.execute({
   *   method: 'PUT',
   *   endpoint: `${this.baseUrl}/employees/${id}`,
   *   body: employeeData,
   *   confirm: {
   *     message: 'Are you sure you want to save these changes?',
   *     title: 'Save Changes'
   *   },
   *   showSuccessNotification: 'Employee updated successfully',
   *   onSuccess: () => this.refreshList()
   * }).subscribe();
   * ```
   */
  execute<TRequest = unknown, TResponse = unknown>(
    config: ActionConfig<TRequest, TResponse>
  ): Observable<TResponse> {
    let action$: Observable<TResponse>;

    // Build API call based on method
    switch (config.method) {
      case 'GET':
        action$ = this.get<TResponse>(config.endpoint, config.params);
        break;
      case 'POST':
        action$ = this.post<TResponse>(config.endpoint, config.body);
        break;
      case 'PUT':
        action$ = this.put<TResponse>(config.endpoint, config.body);
        break;
      case 'PATCH':
        action$ = this.patch<TResponse>(config.endpoint, config.body);
        break;
      case 'DELETE':
        action$ = this.delete<TResponse>(config.endpoint);
        break;
      default:
        return throwError(() => new Error(`Unsupported HTTP method: ${config.method}`));
    }

    // Wrap with confirmation dialog if needed
    if (config.confirm) {
      const confirm$: Observable<boolean> = this.dialogService.confirm({
        title: config.confirm.title || 'Confirm Action',
        message: config.confirm.message,
        confirmText: config.confirm.confirmText || 'Confirm',
        cancelText: config.confirm.cancelText || 'Cancel',
        confirmVariant: config.confirm.variant || 'primary',
        icon: config.confirm.icon,
      });
      
      action$ = confirm$.pipe(
        filter((confirmed: boolean) => confirmed), // Only proceed if confirmed
        switchMap(() => action$)
      );
    }

    // Add loading indicator
    // Note: Using manual show/hide instead of executeWithLoadingObservable
    // because we need to handle confirmation dialog before showing loading
    if (config.showLoading !== false) {
      const loadingId = this.loadingService.show(config.loadingMessage);
      action$ = action$.pipe(
        finalize(() => {
          this.loadingService.hide(loadingId);
        })
      );
    }

    // Add success/error handling
    return action$.pipe(
      tap({
        next: (response) => {
          if (config.showSuccessNotification) {
            const message = typeof config.showSuccessNotification === 'string' 
              ? config.showSuccessNotification 
              : 'Operation completed successfully';
            this.notificationService.success('Success', message);
          }
          config.onSuccess?.(response);
        },
      }),
      catchError((error: unknown) => {
        // Extract error message from various error formats
        const errorMessage = this.extractErrorMessage(error);
        const errorObj = error instanceof Error ? error : new Error(errorMessage);

        if (config.showErrorNotification !== false) {
          const message = typeof config.showErrorNotification === 'string'
            ? config.showErrorNotification
            : errorMessage;
          this.notificationService.error('Error', message);
        }
        config.onError?.(errorObj);
        return throwError(() => errorObj);
      })
    );
  }

  /**
   * Extract error message from various error formats
   * Handles HttpErrorResponse, Error objects, and plain error messages
   * Priority: message > error > validation errors > statusText
   */
  private extractErrorMessage(error: unknown): string {
    // HttpErrorResponse (from Angular HttpClient)
    if (error instanceof HttpErrorResponse) {
      // Priority 1: Check for ApiResponse message format (most detailed)
      if (error.error?.message) {
        return error.error.message;
      }
      // Priority 2: Check for ASP.NET Core validation errors
      if (error.error?.errors && typeof error.error.errors === 'object') {
        const validationErrors = Object.entries(error.error.errors)
          .map(([field, messages]) => {
            const msgArray = Array.isArray(messages) ? messages : [messages];
            return `${field}: ${msgArray.join(', ')}`;
          })
          .join('; ');
        return validationErrors;
      }
      // Priority 3: Check for ApiResponse error format (error title/type)
      if (error.error?.error) {
        return error.error.error;
      }
      // Fallback to status text or default
      return error.statusText || `HTTP ${error.status}: ${error.message}`;
    }

    // Error object
    if (error instanceof Error) {
      return error.message;
    }

    // Plain string
    if (typeof error === 'string') {
      return error;
    }

    // Object with message property
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message: unknown }).message);
    }

    // Fallback
    return 'Operation failed';
  }
}

