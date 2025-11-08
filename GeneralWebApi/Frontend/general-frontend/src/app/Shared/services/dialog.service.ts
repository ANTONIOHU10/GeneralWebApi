// Path: GeneralWebApi/Frontend/general-frontend/src/app/Shared/services/dialog.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ConfirmDialogConfig } from '../components/base/base-confirm-dialog/base-confirm-dialog.component';

export interface DialogData extends ConfirmDialogConfig {
  id: string;
  resolve: (value: boolean) => void;
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private dialogsSubject = new BehaviorSubject<DialogData[]>([]);
  public dialogs$: Observable<DialogData[]> = this.dialogsSubject.asObservable();

  private dialogId = 0;

  /**
   * Show a confirmation dialog
   * @param config Configuration for the confirmation dialog
   * @returns Promise that resolves to true if confirmed, false if cancelled
   */
  confirm(config: ConfirmDialogConfig): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const id = this.generateId();
      const dialogData: DialogData = {
        ...config,
        id,
        resolve,
        timestamp: Date.now(),
      };

      const currentDialogs = this.dialogsSubject.value;
      this.dialogsSubject.next([...currentDialogs, dialogData]);
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
      dialog.resolve(result);
      this.dialogsSubject.next(currentDialogs.filter(d => d.id !== id));
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
    currentDialogs.forEach(dialog => dialog.resolve(false));
    this.dialogsSubject.next([]);
  }

  private generateId(): string {
    return `dialog-${++this.dialogId}`;
  }

  /**
   * Quick confirmation methods with predefined configurations
   */
  confirmDelete(message?: string): Promise<boolean> {
    return this.confirm({
      title: 'Confirm Delete',
      message: message || 'Are you sure you want to delete this item? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmVariant: 'danger',
      icon: 'warning',
    });
  }

  confirmSave(message?: string): Promise<boolean> {
    return this.confirm({
      title: 'Save Changes',
      message: message || 'Do you want to save your changes?',
      confirmText: 'Save',
      cancelText: 'Cancel',
      confirmVariant: 'primary',
      icon: 'save',
    });
  }

  confirmDiscard(message?: string): Promise<boolean> {
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

