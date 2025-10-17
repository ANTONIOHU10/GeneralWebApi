// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/base/base-card/base-card.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-base-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="base-card" [class]="cardClass" [style]="cardStyle">
      <div class="card-header" *ngIf="showHeader">
        <div class="card-title" *ngIf="title">
          <span class="material-icons" *ngIf="icon">{{ icon }}</span>
          {{ title }}
        </div>
        <div class="card-subtitle" *ngIf="subtitle">{{ subtitle }}</div>
        <div class="card-actions" *ngIf="showActions">
          <ng-content select="[slot=actions]"></ng-content>
        </div>
      </div>
      <div class="card-content">
        <ng-content></ng-content>
      </div>
      <div class="card-footer" *ngIf="showFooter">
        <ng-content select="[slot=footer]"></ng-content>
      </div>
    </div>
  `,
  styles: [
    `
      .base-card {
        background: var(--bg-surface);
        border: 1px solid var(--border-primary);
        border-radius: 8px;
        box-shadow: var(--shadow-base);
        overflow: hidden;
        transition: all 0.3s ease;
      }

      .base-card:hover {
        box-shadow: var(--shadow-lg);
      }

      .card-header {
        padding: 1.5rem;
        border-bottom: 1px solid var(--border-primary);
        background: var(--bg-surface);
        position: relative;
        transition:
          background-color 0.3s ease,
          border-color 0.3s ease;
      }

      .card-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 0.25rem;
        transition: color 0.3s ease;
      }

      .material-icons {
        font-size: 1.2rem;
        color: var(--color-primary-500);
        transition: color 0.3s ease;
      }

      .card-subtitle {
        color: var(--text-secondary);
        font-size: 0.9rem;
        margin: 0;
        transition: color 0.3s ease;
      }

      .card-actions {
        position: absolute;
        top: 1.5rem;
        right: 1.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .card-content {
        padding: 1.5rem;
      }

      .card-footer {
        padding: 1rem 1.5rem;
        border-top: 1px solid var(--border-primary);
        background: var(--bg-secondary);
        transition:
          background-color 0.3s ease,
          border-color 0.3s ease;
      }

      /* Card variants */
      .base-card.elevated {
        box-shadow: var(--shadow-lg);
      }

      .base-card.elevated:hover {
        box-shadow: var(--shadow-xl);
      }

      .base-card.outlined {
        box-shadow: none;
        border: 2px solid var(--border-primary);
      }

      .base-card.outlined:hover {
        border-color: var(--color-primary-300);
      }

      .base-card.flat {
        box-shadow: none;
        border: none;
      }

      @media (max-width: 768px) {
        .card-header {
          padding: 1rem;
        }

        .card-content {
          padding: 1rem;
        }

        .card-footer {
          padding: 0.75rem 1rem;
        }

        .card-actions {
          position: static;
          margin-top: 1rem;
          justify-content: flex-end;
        }
      }
    `,
  ],
})
export class BaseCardComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() icon = '';
  @Input() showHeader = true;
  @Input() showFooter = false;
  @Input() showActions = false;
  @Input() variant: 'default' | 'elevated' | 'outlined' | 'flat' = 'default';
  @Input() customClass = '';
  @Input() cardStyle = '';

  get cardClass(): string {
    return `base-card ${this.variant} ${this.customClass}`.trim();
  }
}
