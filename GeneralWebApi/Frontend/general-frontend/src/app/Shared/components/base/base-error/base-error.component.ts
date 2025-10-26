import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ErrorType = 'error' | 'warning' | 'info' | 'critical';
export type ErrorSize = 'sm' | 'md' | 'lg';

export interface ErrorConfig {
  type?: ErrorType;
  size?: ErrorSize;
  showIcon?: boolean;
  showRetryButton?: boolean;
  showDismissButton?: boolean;
  retryButtonText?: string;
  dismissButtonText?: string;
  centered?: boolean;
  fullWidth?: boolean;
}

@Component({
  selector: 'app-base-error',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './base-error.component.html',
  styleUrls: ['./base-error.component.scss'],
})
export class BaseErrorComponent {
  @Input() message = 'An error occurred';
  @Input() details?: string;
  @Input() config: ErrorConfig = {
    type: 'error',
    size: 'md',
    showIcon: true,
    showRetryButton: true,
    showDismissButton: false,
    retryButtonText: 'Retry',
    dismissButtonText: 'Dismiss',
    centered: true,
    fullWidth: false,
  };

  @Input() type: ErrorType = 'error';
  @Input() size: ErrorSize = 'md';
  @Input() showIcon = true;
  @Input() showRetryButton = true;
  @Input() showDismissButton = false;
  @Input() retryButtonText = 'Retry';
  @Input() dismissButtonText = 'Dismiss';
  @Input() centered = true;
  @Input() fullWidth = false;

  @Output() retry = new EventEmitter<void>();
  @Output() dismiss = new EventEmitter<void>();

  get displayType(): ErrorType {
    return this.type || this.config.type || 'error';
  }

  get displaySize(): ErrorSize {
    return this.size || this.config.size || 'md';
  }

  get displayShowIcon(): boolean {
    return this.showIcon !== undefined
      ? this.showIcon
      : (this.config.showIcon ?? true);
  }

  get displayShowRetryButton(): boolean {
    return this.showRetryButton !== undefined
      ? this.showRetryButton
      : (this.config.showRetryButton ?? true);
  }

  get displayShowDismissButton(): boolean {
    return this.showDismissButton !== undefined
      ? this.showDismissButton
      : (this.config.showDismissButton ?? false);
  }

  get displayRetryButtonText(): string {
    return this.retryButtonText || this.config.retryButtonText || 'Retry';
  }

  get displayDismissButtonText(): string {
    return this.dismissButtonText || this.config.dismissButtonText || 'Dismiss';
  }

  get displayCentered(): boolean {
    return this.centered !== undefined
      ? this.centered
      : (this.config.centered ?? true);
  }

  get displayFullWidth(): boolean {
    return this.fullWidth !== undefined
      ? this.fullWidth
      : (this.config.fullWidth ?? false);
  }

  get iconName(): string {
    switch (this.displayType) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      case 'critical':
        return 'error_outline';
      default:
        return 'error';
    }
  }

  onRetry() {
    this.retry.emit();
  }

  onDismiss() {
    this.dismiss.emit();
  }
}
