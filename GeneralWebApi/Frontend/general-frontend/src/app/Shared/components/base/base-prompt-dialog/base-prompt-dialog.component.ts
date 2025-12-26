// Path: GeneralWebApi/Frontend/general-frontend/src/app/Shared/components/base/base-prompt-dialog/base-prompt-dialog.component.ts
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
import { FormsModule } from '@angular/forms';
import { BaseModalComponent, ModalConfig } from '../base-modal/base-modal.component';
import { BaseButtonComponent } from '../base-button/base-button.component';
import { BaseTextareaComponent } from '../base-textarea/base-textarea.component';
import { TranslatePipe } from '@core/pipes/translate.pipe';

export interface PromptDialogConfig {
  title?: string;
  message: string;
  placeholder?: string;
  label?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  cancelVariant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  icon?: string;
  showCancel?: boolean;
  size?: 'small' | 'medium' | 'large';
  closable?: boolean;
  required?: boolean;
  maxLength?: number;
  rows?: number;
}

@Component({
  selector: 'app-base-prompt-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseModalComponent, BaseButtonComponent, BaseTextareaComponent, TranslatePipe],
  templateUrl: './base-prompt-dialog.component.html',
  styleUrls: ['./base-prompt-dialog.component.scss'],
})
export class BasePromptDialogComponent implements OnInit, OnDestroy, OnChanges {
  @Input() isOpen = false;
  @Input() config: PromptDialogConfig = {
    message: '',
    placeholder: '',
    label: '',
    confirmText: '',
    cancelText: '',
    confirmVariant: 'primary',
    cancelVariant: 'outline',
    showCancel: true,
    size: 'medium',
    closable: true,
    required: false,
    maxLength: 500,
    rows: 4,
  };

  @Output() confirm = new EventEmitter<string>();
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

  inputValue = '';

  ngOnInit(): void {
    this.updateModalConfig();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config']) {
      this.updateModalConfig();
    }
    if (changes['isOpen'] && !this.isOpen) {
      // Reset input when dialog closes
      this.inputValue = '';
    }
  }

  ngOnDestroy(): void {
    // Component cleanup - state managed by parent
  }

  onConfirm(): void {
    if (this.config.required && !this.inputValue.trim()) {
      return; // Don't emit if required and empty
    }
    this.confirm.emit(this.inputValue);
    this.dialogClose.emit();
    this.inputValue = '';
  }

  onCancel(): void {
    this.cancelAction.emit();
    this.dialogClose.emit();
    this.inputValue = '';
  }

  onClose(): void {
    this.dialogClose.emit();
    this.inputValue = '';
  }

  close(): void {
    this.dialogClose.emit();
    this.inputValue = '';
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

  get canConfirm(): boolean {
    return !this.config.required || !!this.inputValue.trim();
  }
}














