// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/base/base-confirm-dialog/base-confirm-dialog.component.ts
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseModalComponent, ModalConfig } from '../base-modal/base-modal.component';
import { BaseButtonComponent } from '../base-button/base-button.component';

export interface ConfirmDialogConfig {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  cancelVariant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  icon?: string;
  showCancel?: boolean;
  size?: 'small' | 'medium' | 'large';
  closable?: boolean;
}

@Component({
  selector: 'app-base-confirm-dialog',
  standalone: true,
  imports: [CommonModule, BaseModalComponent, BaseButtonComponent],
  templateUrl: './base-confirm-dialog.component.html',
  styleUrls: ['./base-confirm-dialog.component.scss'],
})
export class BaseConfirmDialogComponent implements OnInit, OnDestroy, OnChanges {
  @Input() isOpen = false;
  @Input() config: ConfirmDialogConfig = {
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    confirmVariant: 'primary',
    cancelVariant: 'outline',
    showCancel: true,
    size: 'medium',
    closable: true,
  };

  @Output() confirm = new EventEmitter<void>();
  @Output() cancelAction = new EventEmitter<void>();
  @Output() dialogClose = new EventEmitter<void>();

  modalConfig: ModalConfig = {
    size: 'medium',
    closable: true,
    backdrop: true,
    keyboard: true,
    animation: true,
    centered: true,
    scrollable: false,
  };

  ngOnInit(): void {
    this.updateModalConfig();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config']) {
      this.updateModalConfig();
    }
  }

  ngOnDestroy(): void {
    // Component cleanup - state managed by parent
  }

  onConfirm(): void {
    this.confirm.emit();
    // Don't emit dialogClose here - let DialogContainerComponent handle cleanup
    // dialogClose will be emitted when the dialog is actually removed
  }

  onCancel(): void {
    this.cancelAction.emit();
    // Don't emit dialogClose here - let DialogContainerComponent handle cleanup
    // dialogClose will be emitted when the dialog is actually removed
  }

  onClose(): void {
    this.dialogClose.emit();
  }

  close(): void {
    this.dialogClose.emit();
  }

  open(): void {
    // Dialog opening is controlled by parent via @Input() isOpen
  }

  private updateModalConfig(): void {
    this.modalConfig = {
      size: this.config.size || 'medium',
      closable: this.config.closable !== false,
      backdrop: true,
      keyboard: true,
      animation: true,
      centered: true,
      scrollable: false,
    };
  }

  get confirmButtonVariant(): 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline' | 'ghost' {
    return this.config.confirmVariant || 'primary';
  }

  get cancelButtonVariant(): 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline' | 'ghost' {
    return this.config.cancelVariant || 'outline';
  }

  get iconType(): string {
    if (this.config.icon) {
      return this.config.icon;
    }
    // Default icon based on variant
    switch (this.config.confirmVariant) {
      case 'danger':
        return 'warning';
      case 'warning':
        return 'warning';
      case 'success':
        return 'check_circle';
      default:
        return 'info';
    }
  }
}
