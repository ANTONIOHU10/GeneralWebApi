// Path: GeneralWebApi/Frontend/general-frontend/src/app/Shared/services/operation-notification.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from './notification.service';
import { LoadingService } from './loading.service';
import { TranslationService } from '@core/services/translation.service';

/**
 * Operation state interface
 */
export interface OperationState {
  loading: boolean;
  operation: string | null;
  //employeeId?: string | null;
}

/**
 * Current operation tracking
 */
export interface CurrentOperation {
  type: 'delete' | 'update' | 'create' | null;
  employeeName?: string;
}

/**
 * Operation notification configuration
 */
export interface OperationNotificationConfig {
  /**
   * Observable stream for error messages
   */
  // error$: this.employeeFacade.error$
  // 当 Store 中 error 状态变化时，服务会自动收到通知
  error$: Observable<string | null>;

  /**
   * Observable stream for operation progress state
   */
  // 当操作状态从 { loading: false } → { loading: true } 时
  // 服务检测到操作开始，可以显示加载指示器
  operationInProgress$: Observable<OperationState>;

  /**
   * Whether to automatically show/hide loading indicators
   * Default: true
   * Set to false if loading is managed elsewhere (e.g., by ActionService)
   */
  autoShowLoading?: boolean;

  /**
   * Custom success messages for each operation type
   */
  successMessages?: {
    delete?: (name?: string) => string;
    update?: (name?: string) => string;
    create?: (name?: string) => string;
  };

  /**
   * Custom loading messages for each operation type
   * Only used when autoShowLoading is true
   */
  loadingMessages?: {
    delete?: string;
    update?: string;
    create?: string;
    default?: string;
  };

  /**
   * Destroy subject to unsubscribe when component is destroyed
   */
  destroy$: Subject<void>;
}

/**
 * OperationNotificationService - Unified operation monitoring and notification service
 * 
 * Purpose: Extract common operation monitoring logic from components
 * - Monitors error and operation progress streams (e.g., from NgRx facades)
 * - Optionally shows loading indicators (configurable)
 * - Displays success/error notifications
 * - Tracks current operation state
 * 
 * Use Cases:
 * 1. **NgRx-based operations**: When using facades with operationInProgress$ streams
 *    - Automatically monitors state changes
 *    - Shows notifications based on operation completion
 * 
 * 2. **ActionService-based operations**: When using ActionService for HTTP operations
 *    - Set autoShowLoading: false (ActionService handles loading)
 *    - Only use for monitoring and notifications
 * 
 * Usage:
 * - Call setup() to start monitoring
 * - Call trackOperation() before starting an operation
 * - Service automatically handles the rest
 * 
 * @example
 * ```typescript
 * // In component with NgRx facade
 * private operationNotification = inject(OperationNotificationService);
 * 
 * ngOnInit() {
 *   this.operationNotification.setup({
 *     error$: this.facade.error$,
 *     operationInProgress$: this.facade.operationInProgress$,
 *     destroy$: this.destroy$,
 *     autoShowLoading: true // Default: show loading automatically
 *   });
 * }
 * 
 * onDelete(item: Item) {
 *   this.operationNotification.trackOperation({
 *     type: 'delete',
 *     employeeName: item.name
 *   });
 *   this.facade.deleteEmployee(item.id); // NgRx action
 * }
 * 
 * // When using ActionService (loading handled by ActionService)
 * ngOnInit() {
 *   this.operationNotification.setup({
 *     error$: this.facade.error$,
 *     operationInProgress$: this.facade.operationInProgress$,
 *     destroy$: this.destroy$,
 *     autoShowLoading: false // ActionService handles loading
 *   });
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class OperationNotificationService {
  private notificationService = inject(NotificationService);
  private loadingService = inject(LoadingService);
  private translationService = inject(TranslationService);

  // Track current operation
  private currentOperation: CurrentOperation = { type: null };
  private hasError = false;
  private previousOperation: OperationState | null = null;
  private lastErrorShown: string | null = null; // Track last error to prevent duplicates

  /**
   * Setup operation monitoring
   * @param config Configuration for operation monitoring
   */
  setup(config: OperationNotificationConfig): void {
    // Reset state
    this.currentOperation = { type: null };
    this.hasError = false;
    this.previousOperation = null;
    this.lastErrorShown = null;

    // Listen to errors - when error occurs, mark the flag immediately
    config.error$
      .pipe(takeUntil(config.destroy$))
      .subscribe(error => {
        if (error !== null) {
        this.hasError = true;
          // Only show notification if it's a different error (prevent duplicates)
          if (this.lastErrorShown !== error) {
            this.lastErrorShown = error;
            this.notificationService.error(
              this.translationService.translate('employees.operations.errorTitle'),
              error
            );
          }
        } else {
          // Error cleared - reset flag and last error
          this.hasError = false;
          this.lastErrorShown = null;
        }
      });

    // Track operation state changes
    config.operationInProgress$
      .pipe(takeUntil(config.destroy$))
      .subscribe(operationState => {
        this.handleOperationStateChange(operationState, config);
      });
  }

  /**
   * Track an operation before it starts
   * @param operation Operation to track
   */
  trackOperation(operation: CurrentOperation): void {
    this.currentOperation = operation;
  }

  /**
   * Handle operation state changes
   * @param operationState Current operation state
   * @param config Configuration
   */
  private handleOperationStateChange(
    operationState: OperationState,
    config: OperationNotificationConfig
  ): void {
    const wasLoading = this.previousOperation?.loading || false;
    const isLoading = operationState?.loading || false;
    const operation = operationState?.operation;
    const autoShowLoading = config.autoShowLoading !== false; // Default: true

    // Operation started - show loading if enabled
    if (!wasLoading && isLoading && autoShowLoading) {
      const loadingMessage = this.getLoadingMessage(operation, config.loadingMessages);
      this.loadingService.show(loadingMessage);
    }

    // Operation completed (success or failure)
    if (wasLoading && !isLoading && this.previousOperation?.operation) {
      // Hide loading if we were managing it
      if (autoShowLoading) {
        this.loadingService.hide();
      }

      // Show success notification ONLY if operation completed AND no error
      if (this.currentOperation.type && !this.hasError) {
        this.showSuccessNotification(config.successMessages);
    }

      // Reset current operation after handling
      this.currentOperation = { type: null };
    }

    this.previousOperation = operationState;
  }

  /**
   * Get loading message for operation
   * @param operation Operation type
   * @param loadingMessages Custom loading messages
   * @returns Loading message
   */
  private getLoadingMessage(
    operation: string | null,
    loadingMessages?: OperationNotificationConfig['loadingMessages']
  ): string {
    if (!operation) {
      return loadingMessages?.default || this.translationService.translate('employees.operations.loading.processing');
    }

    switch (operation.toLowerCase()) {
      case 'delete':
        return loadingMessages?.delete || this.translationService.translate('employees.operations.loading.deleting');
      case 'update':
        return loadingMessages?.update || this.translationService.translate('employees.operations.loading.updating');
      case 'create':
        return loadingMessages?.create || this.translationService.translate('employees.operations.loading.creating');
      default:
        return loadingMessages?.default || this.translationService.translate('employees.operations.loading.processing');
    }
  }

  /**
   * Show success notification based on current operation
   * @param successMessages Custom success messages
   */
  private showSuccessNotification(
    successMessages?: OperationNotificationConfig['successMessages']
  ): void {
    const { type, employeeName } = this.currentOperation;

    if (!type) return;

    let title: string;
    let message: string;

    switch (type) {
      case 'delete':
        title = this.translationService.translate('employees.operations.success.deleteTitle');
        message = successMessages?.delete
          ? successMessages.delete(employeeName)
          : this.translationService.translate('employees.operations.success.deleteMessage', { 
              name: employeeName || this.translationService.translate('employees.employee') 
            });
        break;
      case 'update':
        title = this.translationService.translate('employees.operations.success.updateTitle');
        message = successMessages?.update
          ? successMessages.update(employeeName)
          : this.translationService.translate('employees.operations.success.updateMessage', { 
              name: employeeName || this.translationService.translate('employees.employee') 
            });
        break;
      case 'create':
        title = this.translationService.translate('employees.operations.success.createTitle');
        message = successMessages?.create
          ? successMessages.create(employeeName)
          : this.translationService.translate('employees.operations.success.createMessage', { 
              name: employeeName || this.translationService.translate('employees.employee') 
            });
        break;
      default:
        return;
    }

    this.notificationService.success(title, message);
  }

  /**
   * Reset service state
   */
  reset(): void {
    this.currentOperation = { type: null };
    this.hasError = false;
    this.previousOperation = null;
    this.lastErrorShown = null;
  }
}

