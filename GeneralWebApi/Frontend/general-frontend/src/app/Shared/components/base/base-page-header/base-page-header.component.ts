// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/base/base-page-header/base-page-header.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-base-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h1>
        <span class="material-icons" [style.color]="iconColor">{{ icon }}</span>
        {{ title }}
      </h1>
      <p *ngIf="subtitle">{{ subtitle }}</p>
      <div class="header-actions" *ngIf="showActions">
        <ng-content select="[slot=actions]"></ng-content>
      </div>
    </div>
  `,
  styles: [
    `
      .page-header {
        padding: 2rem 2rem 1rem 2rem;
        border-bottom: 1px solid var(--border-primary);
        background: var(--bg-surface);
        position: relative;
        transition:
          background-color 0.3s ease,
          border-color 0.3s ease;
      }

      h1 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--text-primary);
        font-size: 1.5rem;
        margin: 0 0 0.5rem 0;
        font-weight: 600;
        transition: color 0.3s ease;
      }

      .material-icons {
        font-size: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.3s ease;
      }

      p {
        margin: 0;
        color: var(--text-secondary);
        font-size: 0.95rem;
        line-height: 1.4;
        transition: color 0.3s ease;
      }

      .header-actions {
        position: absolute;
        top: 2rem;
        right: 2rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      @media (max-width: 768px) {
        .page-header {
          padding: 1.5rem 1rem 1rem 1rem;
        }

        .header-actions {
          position: static;
          margin-top: 1rem;
          justify-content: flex-end;
        }

        h1 {
          font-size: 1.25rem;
        }
      }
    `,
  ],
})
export class BasePageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() icon = '';
  @Input() iconColor = 'var(--color-primary-500)';
  @Input() showActions = false;
}
