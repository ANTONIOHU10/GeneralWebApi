// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/base/base-loading/base-loading.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-base-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="base-loading" [class]="loadingClass">
      <div class="loading-container">
        <div class="loading-spinner" [class]="spinnerClass">
          <div class="spinner-circle"></div>
        </div>
        <div class="loading-text" *ngIf="text">{{ text }}</div>
        <div class="loading-subtext" *ngIf="subtext">{{ subtext }}</div>
      </div>
    </div>
  `,
  styles: [
    `
      .base-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        min-height: 200px;
      }

      .loading-container {
        text-align: center;
      }

      .loading-spinner {
        margin: 0 auto 1rem;
        width: 40px;
        height: 40px;
        position: relative;
      }

      .spinner-circle {
        width: 100%;
        height: 100%;
        border: 3px solid var(--border-primary);
        border-top: 3px solid var(--color-primary-500);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      .loading-text {
        font-size: 1rem;
        font-weight: 500;
        color: var(--text-primary);
        margin-bottom: 0.5rem;
        transition: color 0.3s ease;
      }

      .loading-subtext {
        font-size: 0.9rem;
        color: var(--text-secondary);
        transition: color 0.3s ease;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      /* Loading variants */
      .base-loading.small .loading-spinner {
        width: 24px;
        height: 24px;
      }

      .base-loading.small .spinner-circle {
        border-width: 2px;
      }

      .base-loading.small .loading-text {
        font-size: 0.9rem;
      }

      .base-loading.large .loading-spinner {
        width: 60px;
        height: 60px;
      }

      .base-loading.large .spinner-circle {
        border-width: 4px;
      }

      .base-loading.large .loading-text {
        font-size: 1.2rem;
      }

      .base-loading.overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.9);
        z-index: 9999;
        min-height: 100vh;
      }

      .base-loading.inline {
        padding: 1rem;
        min-height: auto;
      }

      .base-loading.inline .loading-spinner {
        width: 20px;
        height: 20px;
        margin: 0 0.5rem 0 0;
        display: inline-block;
      }

      .base-loading.inline .loading-container {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .base-loading.inline .loading-text {
        margin: 0;
      }

      /* Spinner variants */
      .loading-spinner.dots .spinner-circle {
        display: none;
      }

      .loading-spinner.dots::before,
      .loading-spinner.dots::after {
        content: '';
        position: absolute;
        width: 8px;
        height: 8px;
        background: var(--color-primary-500);
        border-radius: 50%;
        animation: dots 1.4s infinite ease-in-out both;
      }

      .loading-spinner.dots::before {
        left: 0;
        animation-delay: -0.32s;
      }

      .loading-spinner.dots::after {
        right: 0;
        animation-delay: 0.32s;
      }

      @keyframes dots {
        0%,
        80%,
        100% {
          transform: scale(0);
        }
        40% {
          transform: scale(1);
        }
      }
    `,
  ],
})
export class BaseLoadingComponent {
  @Input() text = 'Loading...';
  @Input() subtext = '';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() variant: 'default' | 'overlay' | 'inline' = 'default';
  @Input() spinnerType: 'circle' | 'dots' = 'circle';
  @Input() customClass = '';

  get loadingClass(): string {
    const classes = [
      'base-loading',
      this.size !== 'medium' ? this.size : '',
      this.variant,
      this.customClass,
    ].filter(Boolean);

    return classes.join(' ');
  }

  get spinnerClass(): string {
    return this.spinnerType === 'dots' ? 'dots' : '';
  }
}
