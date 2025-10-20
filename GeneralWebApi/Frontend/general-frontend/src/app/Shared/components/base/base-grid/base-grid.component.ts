// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/base/base-grid/base-grid.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface GridConfig {
  columns?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';
  wrap?: boolean;
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
}

@Component({
  selector: 'app-base-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="base-grid" [class]="gridClass" [style]="gridStyle">
      <ng-content></ng-content>
    </div>
  `,
  styles: [
    `
      .base-grid {
        display: grid;
        width: 100%;
        transition: all 0.3s ease;

        /* Gap variants */
        &.gap-none {
          gap: 0;
        }

        &.gap-sm {
          gap: 0.5rem;
        }

        &.gap-md {
          gap: 1rem;
        }

        &.gap-lg {
          gap: 1.5rem;
        }

        &.gap-xl {
          gap: 2rem;
        }

        /* Alignment variants */
        &.align-start {
          align-items: start;
        }

        &.align-center {
          align-items: center;
        }

        &.align-end {
          align-items: end;
        }

        &.align-stretch {
          align-items: stretch;
        }

        /* Justify variants */
        &.justify-start {
          justify-items: start;
        }

        &.justify-center {
          justify-items: center;
        }

        &.justify-end {
          justify-items: end;
        }

        &.justify-space-between {
          justify-content: space-between;
        }

        &.justify-space-around {
          justify-content: space-around;
        }

        &.justify-space-evenly {
          justify-content: space-evenly;
        }

        /* Direction variants */
        &.direction-row {
          grid-auto-flow: row;
        }

        &.direction-column {
          grid-auto-flow: column;
        }

        &.direction-row-reverse {
          grid-auto-flow: row;
          direction: rtl;
        }

        &.direction-column-reverse {
          grid-auto-flow: column;
          direction: rtl;
        }

        /* Wrap */
        &.wrap {
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        }

        /* Column variants */
        &.cols-1 {
          grid-template-columns: repeat(1, 1fr);
        }

        &.cols-2 {
          grid-template-columns: repeat(2, 1fr);
        }

        &.cols-3 {
          grid-template-columns: repeat(3, 1fr);
        }

        &.cols-4 {
          grid-template-columns: repeat(4, 1fr);
        }

        &.cols-5 {
          grid-template-columns: repeat(5, 1fr);
        }

        &.cols-6 {
          grid-template-columns: repeat(6, 1fr);
        }

        &.cols-12 {
          grid-template-columns: repeat(12, 1fr);
        }

        /* Auto-fit variants */
        &.auto-fit-sm {
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        }

        &.auto-fit-md {
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        }

        &.auto-fit-lg {
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        }

        &.auto-fit-xl {
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        }

        /* Auto-fill variants */
        &.auto-fill-sm {
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        }

        &.auto-fill-md {
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        }

        &.auto-fill-lg {
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        }

        &.auto-fill-xl {
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        }
      }

      /* Responsive breakpoints */
      @media (max-width: 640px) {
        .base-grid {
          &.cols-2,
          &.cols-3,
          &.cols-4,
          &.cols-5,
          &.cols-6,
          &.cols-12 {
            grid-template-columns: 1fr;
          }

          &.gap-lg,
          &.gap-xl {
            gap: 1rem;
          }
        }
      }

      @media (min-width: 641px) and (max-width: 768px) {
        .base-grid {
          &.cols-3,
          &.cols-4,
          &.cols-5,
          &.cols-6,
          &.cols-12 {
            grid-template-columns: repeat(2, 1fr);
          }

          &.cols-4,
          &.cols-5,
          &.cols-6,
          &.cols-12 {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      }

      @media (min-width: 769px) and (max-width: 1024px) {
        .base-grid {
          &.cols-4,
          &.cols-5,
          &.cols-6,
          &.cols-12 {
            grid-template-columns: repeat(3, 1fr);
          }

          &.cols-5,
          &.cols-6,
          &.cols-12 {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      }

      @media (min-width: 1025px) and (max-width: 1280px) {
        .base-grid {
          &.cols-5,
          &.cols-6,
          &.cols-12 {
            grid-template-columns: repeat(4, 1fr);
          }

          &.cols-6,
          &.cols-12 {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      }

      @media (min-width: 1281px) {
        .base-grid {
          &.cols-6,
          &.cols-12 {
            grid-template-columns: repeat(6, 1fr);
          }
        }
      }
    `,
  ],
})
export class BaseGridComponent {
  @Input() config: GridConfig = {
    columns: 3,
    gap: 'md',
    align: 'stretch',
    justify: 'start',
    wrap: false,
    direction: 'row',
  };
  @Input() customClass = '';
  @Input() customStyle = '';

  get gridClass(): string {
    const classes = [
      'base-grid',
      this.getColumnsClass(),
      this.getGapClass(),
      this.getAlignClass(),
      this.getJustifyClass(),
      this.getDirectionClass(),
      this.getWrapClass(),
      this.customClass,
    ].filter(Boolean);

    return classes.join(' ');
  }

  get gridStyle(): string {
    let style = this.customStyle;

    // Handle responsive columns
    if (typeof this.config.columns === 'object') {
      const responsiveColumns = this.config.columns;
      const mediaQueries = [];

      if (responsiveColumns.xs) {
        mediaQueries.push(`@media (max-width: 640px) { grid-template-columns: repeat(${responsiveColumns.xs}, 1fr); }`);
      }
      if (responsiveColumns.sm) {
        mediaQueries.push(`@media (min-width: 641px) and (max-width: 768px) { grid-template-columns: repeat(${responsiveColumns.sm}, 1fr); }`);
      }
      if (responsiveColumns.md) {
        mediaQueries.push(`@media (min-width: 769px) and (max-width: 1024px) { grid-template-columns: repeat(${responsiveColumns.md}, 1fr); }`);
      }
      if (responsiveColumns.lg) {
        mediaQueries.push(`@media (min-width: 1025px) and (max-width: 1280px) { grid-template-columns: repeat(${responsiveColumns.lg}, 1fr); }`);
      }
      if (responsiveColumns.xl) {
        mediaQueries.push(`@media (min-width: 1281px) { grid-template-columns: repeat(${responsiveColumns.xl}, 1fr); }`);
      }

      if (mediaQueries.length > 0) {
        style += `; ${mediaQueries.join(' ')}`;
      }
    }

    return style;
  }

  private getColumnsClass(): string {
    if (typeof this.config.columns === 'object') {
      return '';
    }

    const columns = this.config.columns || 3;
    
    if (columns <= 12) {
      return `cols-${columns}`;
    }

    // For columns > 12, use auto-fit
    if (columns <= 16) {
      return 'auto-fit-md';
    } else if (columns <= 20) {
      return 'auto-fit-lg';
    } else {
      return 'auto-fit-xl';
    }
  }

  private getGapClass(): string {
    return `gap-${this.config.gap || 'md'}`;
  }

  private getAlignClass(): string {
    return `align-${this.config.align || 'stretch'}`;
  }

  private getJustifyClass(): string {
    return `justify-${this.config.justify || 'start'}`;
  }

  private getDirectionClass(): string {
    return `direction-${this.config.direction || 'row'}`;
  }

  private getWrapClass(): string {
    return this.config.wrap ? 'wrap' : '';
  }
}

