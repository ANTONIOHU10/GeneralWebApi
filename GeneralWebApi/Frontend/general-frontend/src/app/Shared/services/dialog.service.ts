// Path: GeneralWebApi/Frontend/general-frontend/src/app/Shared/services/dialog.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { take, finalize } from 'rxjs/operators';
import { ConfirmDialogConfig } from '../components/base/base-confirm-dialog/base-confirm-dialog.component';

export interface DialogData extends ConfirmDialogConfig {
  id: string;
  result$: Subject<boolean>;
  timestamp: number;
}

/**
 * DialogService - Centralized dialog management service using RxJS Observables
 * 
 * Purpose: Provides reactive dialog confirmation system following Angular best practices
 * - Uses Observable pattern instead of Promise for better Angular integration
 * - Supports RxJS operators for advanced use cases
 * - Automatic cleanup and memory management
 * - Type-safe dialog configuration
 * 
 * Use Cases:
 * 1. **Standalone confirmations**: Direct user confirmation before actions
 * 2. **ActionService integration**: Used by ActionService for automatic confirmations
 * 3. **Component-level confirmations**: Manual confirmation dialogs in components
 * 
 * Relationship with other services:
 * - Used by ActionService for automatic confirmations
 * - Can be used independently in components
 * - Works with RxJS operators for complex flows
 * 
 * Usage:
 * - Use confirm() or quick methods (confirmDelete, confirmSave, etc.)
 * - Subscribe to Observable to handle user response
 * - Use RxJS operators (take(1), pipe, etc.) for better control
 * 
 * @example
 * ```typescript
 * // Basic usage
 * this.dialogService.confirmDelete('Are you sure?')
 *   .pipe(take(1))
 *   .subscribe(confirmed => {
 *     if (confirmed) {
 *       // Delete logic
 *     }
 *   });
 * 
 * // With RxJS operators
 * this.dialogService.confirm({ message: 'Save changes?' })
 *   .pipe(
 *     take(1),
 *     filter(confirmed => confirmed),
 *     switchMap(() => this.saveData())
 *   )
 *   .subscribe();
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private readonly dialogsSubject = new BehaviorSubject<DialogData[]>([]);
  public readonly dialogs$: Observable<DialogData[]> = this.dialogsSubject.asObservable();

  private dialogId = 0;

  /**
   * Show a confirmation dialog
   * Returns Observable that emits once with the user's decision (true = confirmed, false = cancelled)
   * 
   * @param config Configuration for the confirmation dialog
   * @returns Observable<boolean> that emits once and completes
   * 
   * @example
   * ```typescript
   * this.dialogService.confirm({ message: 'Are you sure?' })
   *   .pipe(take(1))
   *   .subscribe(confirmed => {
   *     if (confirmed) {
   *       // User confirmed
   *     }
   *   });
   * ```
   */
  confirm(config: ConfirmDialogConfig): Observable<boolean> {
    // Return a new Observable that will emit true/false when user confirms/cancels
    // This Observable is lazy - it only executes when subscribed
    return new Observable<boolean>(subscriber => {
      // Generate unique ID for this dialog
      const id = this.generateId();
      
      // Create a Subject to handle user's click result (confirm = true, cancel = false)
      // This Subject will emit the result when user clicks a button
      const resultSubject = new Subject<boolean>();
      
      // Create dialog data object that will be displayed in UI
      // result$ contains the Subject that will emit user's choice
      const dialogData: DialogData = {
        ...config,
        id,
        result$: resultSubject, // This Subject emits true/false when user clicks
        timestamp: Date.now(),
      };

      // Add dialog to the list
      // This notifies DialogContainerComponent to display the dialog
      const currentDialogs = this.dialogsSubject.value;
      this.dialogsSubject.next([...currentDialogs, dialogData]);

      // Subscribe to resultSubject to listen for user's action (confirm/cancel)
      // resultSubject is a Subject<boolean> that will emit true/false when user clicks
      // We store the subscription in a variable so we can unsubscribe later in cleanup
      const resultSubscription = resultSubject
        .pipe(
          take(1), // Only take the first value (user can only click once)
          finalize(() => {
            // Remove dialog from list when completed (success or error)
            // This ensures cleanup even if subscription is cancelled
            this.removeDialog(id);
          })
        )
        .subscribe({
          next: (result) => {
            // When user clicks confirm/cancel, resultSubject emits true/false
            // Forward the result to the component's subscriber
            subscriber.next(result);
            subscriber.complete();
          }, 
          error: (error) => {
            // Forward any errors to the component's subscriber
            subscriber.error(error);
          }
        });

      // Cleanup function - executed when component unsubscribes
      // This is the teardown function returned by Observable constructor
      // It's automatically called when:
      //   - Component calls unsubscribe()
      //   - Component is destroyed (if using takeUntil)
      return () => {
        // 1. Unsubscribe from resultSubject to stop listening
        //    This prevents memory leaks if component cancels before user clicks
        resultSubscription.unsubscribe();
        
        // 2. If dialog still exists, mark it as cancelled (false)
        //    This ensures the dialog is properly closed even if component unsubscribes
        const dialogs = this.dialogsSubject.value;
        const dialog = dialogs.find(d => d.id === id);
        if (dialog) {
          // Emit false to indicate cancellation (not getting value, but emitting it)
          dialog.result$.next(false);
          dialog.result$.complete();
          this.removeDialog(id);
        }
      };
    });
  }

  /**
   * Resolve a dialog (called by the dialog container component)
   * @param id Dialog ID
   * @param result true if confirmed, false if cancelled
   */
  resolveDialog(id: string, result: boolean): void {
    const currentDialogs = this.dialogsSubject.value;
    const dialog = currentDialogs.find(d => d.id === id);
    
    if (dialog) {
      dialog.result$.next(result);
      dialog.result$.complete();
      // Dialog will be removed in finalize operator
    }
  }

  /**
   * Close a dialog without resolving (cancelled)
   * @param id Dialog ID
   */
  closeDialog(id: string): void {
    this.resolveDialog(id, false);
  }

  /**
   * Remove dialog from the list
   */
  private removeDialog(id: string): void {
    const currentDialogs = this.dialogsSubject.value;
    this.dialogsSubject.next(currentDialogs.filter(d => d.id !== id));
  }

  /**
   * Get current dialogs
   */
  getDialogs(): DialogData[] {
    return this.dialogsSubject.value;
  }

  /**
   * Clear all dialogs
   */
  clearAll(): void {
    const currentDialogs = this.dialogsSubject.value;
    currentDialogs.forEach(dialog => {
      dialog.result$.next(false);
      dialog.result$.complete();
    });
    this.dialogsSubject.next([]);
  }

  private generateId(): string {
    return `dialog-${++this.dialogId}`;
  }

  /**
   * Quick confirmation methods with predefined configurations
   * All methods return Observable<boolean> following Angular RxJS patterns
   */
  
  /**
   * Show delete confirmation dialog
   * @param message Optional custom message
   * @returns Observable<boolean> that emits true if confirmed, false if cancelled
   */
  confirmDelete(message?: string): Observable<boolean> {
    return this.confirm({
      title: 'Confirm Delete',
      message: message || 'Are you sure you want to delete this item? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmVariant: 'danger',
      icon: 'warning',
    });
  }

  /**
   * Show save confirmation dialog
   * @param message Optional custom message
   * @returns Observable<boolean> that emits true if confirmed, false if cancelled
   */
  confirmSave(message?: string): Observable<boolean> {
    return this.confirm({
      title: 'Save Changes',
      message: message || 'Do you want to save your changes?',
      confirmText: 'Save',
      cancelText: 'Cancel',
      confirmVariant: 'primary',
      icon: 'save',
    });
  }

  /**
   * Show discard confirmation dialog
   * @param message Optional custom message
   * @returns Observable<boolean> that emits true if confirmed, false if cancelled
   */
  confirmDiscard(message?: string): Observable<boolean> {
    return this.confirm({
      title: 'Discard Changes',
      message: message || 'Are you sure you want to discard your changes?',
      confirmText: 'Discard',
      cancelText: 'Cancel',
      confirmVariant: 'warning',
      icon: 'warning',
    });
  }
}

