// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/base/base-badge/base-badge.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeSize = 'small' | 'medium' | 'large';
export type BadgeShape = 'pill' | 'square' | 'dot';

@Component({
  selector: 'app-base-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './base-badge.component.html',
  styleUrls: ['./base-badge.component.scss'],
})
export class BaseBadgeComponent {
  @Input() text = '';
  @Input() icon = '';
  @Input() count: number | null = null;
  @Input() variant: BadgeVariant = 'primary';
  @Input() size: BadgeSize = 'medium';
  @Input() shape: BadgeShape = 'pill';
  @Input() customClass = '';

  get badgeClass(): string {
    const classes = [
      'base-badge',
      this.variant,
      this.size,
      this.shape,
      this.customClass,
    ].filter(Boolean);

    return classes.join(' ');
  }

  formatCount(count: number): string {
    if (count > 99) return '99+';
    return count.toString();
  }
}

