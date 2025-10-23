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
  templateUrl: './base-container.component.html',
  styleUrls: ['./base-container.component.scss']
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

