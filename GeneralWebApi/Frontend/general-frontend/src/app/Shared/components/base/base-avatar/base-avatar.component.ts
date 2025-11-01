// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/base/base-avatar/base-avatar.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AvatarSize = 'small' | 'medium' | 'large' | 'xlarge';
export type AvatarShape = 'circle' | 'square' | 'rounded';
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy';

@Component({
  selector: 'app-base-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './base-avatar.component.html',
  styleUrls: ['./base-avatar.component.scss'],
})
export class BaseAvatarComponent {
  @Input() src = '';
  @Input() alt = '';
  @Input() fallbackText = '';
  @Input() icon = '';
  @Input() size: AvatarSize = 'medium';
  @Input() shape: AvatarShape = 'circle';
  @Input() showBadge = false;
  @Input() badgeCount: number | null = null;
  @Input() badgeSize: 'small' | 'medium' | 'large' = 'medium';
  @Input() status: AvatarStatus | null = null;
  @Input() customClass = '';

  error = false;

  get avatarClass(): string {
    const classes = [
      'base-avatar',
      this.size !== 'medium' ? this.size : '',
      this.shape !== 'circle' ? this.shape : '',
      this.customClass,
    ].filter(Boolean);

    return classes.join(' ');
  }

  get badgeClass(): string {
    const classes = ['avatar-badge'];
    if (this.badgeSize !== 'medium') {
      classes.push(`${this.badgeSize}-badge`);
    }
    return classes.join(' ');
  }


  onImageError(): void {
    this.error = true;
  }
}

