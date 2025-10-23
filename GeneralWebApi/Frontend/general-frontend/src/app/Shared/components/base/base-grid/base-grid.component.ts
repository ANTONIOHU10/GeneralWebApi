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
  templateUrl: './base-grid.component.html',
  styleUrls: ['./base-grid.component.scss']
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

