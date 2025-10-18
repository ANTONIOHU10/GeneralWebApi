// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/base/base-container/base-container.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ContainerConfig {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  margin?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'auto';
  center?: boolean;
  fluid?: boolean;
  background?: 'transparent' | 'surface' | 'secondary' | 'primary';
  border?: boolean;
  rounded?: boolean;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

@Component({
  selector: 'app-base-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="base-container" [class]="containerClass" [style]="containerStyle">
      <ng-content></ng-content>
    </div>
  `,
  styles: [
    `
      .base-container {
        width: 100%;
        position: relative;
        transition: all 0.3s ease;

        /* Max width variants */
        &.max-width-sm {
          max-width: 640px;
        }

        &.max-width-md {
          max-width: 768px;
        }

        &.max-width-lg {
          max-width: 1024px;
        }

        &.max-width-xl {
          max-width: 1280px;
        }

        &.max-width-2xl {
          max-width: 1536px;
        }

        &.max-width-full {
          max-width: 100%;
        }

        /* Padding variants */
        &.padding-none {
          padding: 0;
        }

        &.padding-sm {
          padding: var(--spacing-2);
        }

        &.padding-md {
          padding: var(--spacing-4);
        }

        &.padding-lg {
          padding: var(--spacing-6);
        }

        &.padding-xl {
          padding: var(--spacing-8);
        }

        /* Margin variants */
        &.margin-none {
          margin: 0;
        }

        &.margin-sm {
          margin: var(--spacing-2);
        }

        &.margin-md {
          margin: var(--spacing-4);
        }

        &.margin-lg {
          margin: var(--spacing-6);
        }

        &.margin-xl {
          margin: var(--spacing-8);
        }

        &.margin-auto {
          margin: 0 auto;
        }

        /* Background variants */
        &.bg-transparent {
          background: transparent;
        }

        &.bg-surface {
          background: var(--bg-surface);
        }

        &.bg-secondary {
          background: var(--bg-secondary);
        }

        &.bg-primary {
          background: var(--color-primary-50);
        }

        /* Border variants */
        &.bordered {
          border: 1px solid var(--border-primary);
        }

        /* Rounded variants */
        &.rounded {
          border-radius: var(--border-radius-lg);
        }

        /* Shadow variants */
        &.shadow-none {
          box-shadow: none;
        }

        &.shadow-sm {
          box-shadow: var(--shadow-sm);
        }

        &.shadow-md {
          box-shadow: var(--shadow-md);
        }

        &.shadow-lg {
          box-shadow: var(--shadow-lg);
        }

        &.shadow-xl {
          box-shadow: var(--shadow-xl);
        }

        /* Centered */
        &.centered {
          margin-left: auto;
          margin-right: auto;
        }

        /* Fluid */
        &.fluid {
          max-width: none;
        }
      }

      /* Responsive design */
      @media (max-width: 768px) {
        .base-container {
          &.padding-lg {
            padding: 1rem;
          }

          &.padding-xl {
            padding: 1.5rem;
          }

          &.margin-lg {
            margin: 1rem;
          }

          &.margin-xl {
            margin: 1.5rem;
          }
        }
      }

      @media (max-width: 480px) {
        .base-container {
          &.padding-md {
            padding: 0.75rem;
          }

          &.padding-lg {
            padding: 1rem;
          }

          &.padding-xl {
            padding: 1.25rem;
          }

          &.margin-md {
            margin: 0.75rem;
          }

          &.margin-lg {
            margin: 1rem;
          }

          &.margin-xl {
            margin: 1.25rem;
          }
        }
      }
    `,
  ],
})
export class BaseContainerComponent {
  @Input() config: ContainerConfig = {
    maxWidth: 'lg',
    padding: 'md',
    margin: 'auto',
    center: true,
    fluid: false,
    background: 'transparent',
    border: false,
    rounded: false,
    shadow: 'none',
  };
  @Input() customClass = '';
  @Input() customStyle = '';

  get containerClass(): string {
    const classes = [
      'base-container',
      this.getMaxWidthClass(),
      this.getPaddingClass(),
      this.getMarginClass(),
      this.getBackgroundClass(),
      this.getBorderClass(),
      this.getRoundedClass(),
      this.getShadowClass(),
      this.getCenterClass(),
      this.getFluidClass(),
      this.customClass,
    ].filter(Boolean);

    return classes.join(' ');
  }

  get containerStyle(): string {
    return this.customStyle;
  }

  private getMaxWidthClass(): string {
    if (this.config.fluid) return '';
    return `max-width-${this.config.maxWidth || 'lg'}`;
  }

  private getPaddingClass(): string {
    return `padding-${this.config.padding || 'md'}`;
  }

  private getMarginClass(): string {
    return `margin-${this.config.margin || 'auto'}`;
  }

  private getBackgroundClass(): string {
    return `bg-${this.config.background || 'transparent'}`;
  }

  private getBorderClass(): string {
    return this.config.border ? 'bordered' : '';
  }

  private getRoundedClass(): string {
    return this.config.rounded ? 'rounded' : '';
  }

  private getShadowClass(): string {
    return `shadow-${this.config.shadow || 'none'}`;
  }

  private getCenterClass(): string {
    return this.config.center ? 'centered' : '';
  }

  private getFluidClass(): string {
    return this.config.fluid ? 'fluid' : '';
  }
}

