// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/base/base-button/base-button.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-base-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="base-button"
      [class]="buttonClass"
      [disabled]="disabled"
      [type]="type"
      (click)="onClick($event)"
    >
      <span class="material-icons" *ngIf="icon && !iconRight">{{ icon }}</span>
      <span class="button-text" *ngIf="text">{{ text }}</span>
      <ng-content></ng-content>
      <span class="material-icons" *ngIf="icon && iconRight">{{ icon }}</span>
      <span class="loading-spinner" *ngIf="loading">
        <span class="material-icons">refresh</span>
      </span>
    </button>
  `,
  styles: [
    `
      .base-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 6px;
        font-size: 0.95rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;
        min-height: 40px;
        text-decoration: none;
        outline: none;
      }

      .base-button:focus {
        box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.2);
      }

      .base-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .material-icons {
        font-size: 1.1rem;
      }

      .button-text {
        white-space: nowrap;
      }

      .loading-spinner {
        animation: spin 1s linear infinite;
      }

      .loading-spinner .material-icons {
        font-size: 1rem;
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      /* Button variants */
      .base-button.primary {
        background: var(--color-primary-500);
        color: var(--color-white);
        border: 1px solid var(--color-primary-500);
      }

      .base-button.primary:hover:not(:disabled) {
        background: var(--color-primary-600);
        border-color: var(--color-primary-600);
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
      }

      .base-button.secondary {
        background: var(--color-gray-600);
        color: var(--color-white);
        border: 1px solid var(--color-gray-600);
      }

      .base-button.secondary:hover:not(:disabled) {
        background: var(--color-gray-700);
        border-color: var(--color-gray-700);
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
      }

      .base-button.success {
        background: var(--color-success);
        color: var(--color-white);
        border: 1px solid var(--color-success);
      }

      .base-button.success:hover:not(:disabled) {
        background: var(--color-success-dark);
        border-color: var(--color-success-dark);
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
      }

      .base-button.warning {
        background: var(--color-warning);
        color: var(--color-white);
        border: 1px solid var(--color-warning);
      }

      .base-button.warning:hover:not(:disabled) {
        background: var(--color-warning-dark);
        border-color: var(--color-warning-dark);
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
      }

      .base-button.danger {
        background: var(--color-error);
        color: var(--color-white);
        border: 1px solid var(--color-error);
      }

      .base-button.danger:hover:not(:disabled) {
        background: var(--color-error-dark);
        border-color: var(--color-error-dark);
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
      }

      .base-button.outline {
        background: transparent;
        border: 2px solid var(--color-primary-500);
        color: var(--color-primary-500);
      }

      .base-button.outline:hover:not(:disabled) {
        background: var(--color-primary-500);
        color: var(--color-white);
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
      }

      .base-button.ghost {
        background: transparent;
        color: var(--text-primary);
        border: 1px solid transparent;
      }

      .base-button.ghost:hover:not(:disabled) {
        background: var(--bg-secondary);
        border-color: var(--border-primary);
      }

      /* Button sizes */
      .base-button.small {
        padding: 0.5rem 1rem;
        font-size: 0.85rem;
        min-height: 32px;
      }

      .base-button.large {
        padding: 1rem 2rem;
        font-size: 1.1rem;
        min-height: 48px;
      }

      .base-button.icon-only {
        padding: 0.75rem;
        min-width: 40px;
      }

      .base-button.icon-only.small {
        padding: 0.5rem;
        min-width: 32px;
      }

      .base-button.icon-only.large {
        padding: 1rem;
        min-width: 48px;
      }

      @media (max-width: 768px) {
        .base-button {
          padding: 0.75rem 1.25rem;
          font-size: 0.9rem;
        }

        .base-button.small {
          padding: 0.5rem 0.75rem;
          font-size: 0.8rem;
        }
      }
    `,
  ],
})
export class BaseButtonComponent {
  @Input() text = '';
  @Input() icon = '';
  @Input() iconRight = false;
  @Input() variant:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'outline'
    | 'ghost' = 'primary';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() customClass = '';

  @Output() buttonClick = new EventEmitter<Event>();

  get buttonClass(): string {
    const classes = [
      'base-button',
      this.variant,
      this.size !== 'medium' ? this.size : '',
      this.icon && !this.text ? 'icon-only' : '',
      this.customClass,
    ].filter(Boolean);

    return classes.join(' ');
  }

  onClick(event: Event): void {
    if (!this.disabled && !this.loading) {
      this.buttonClick.emit(event);
    }
  }
}
