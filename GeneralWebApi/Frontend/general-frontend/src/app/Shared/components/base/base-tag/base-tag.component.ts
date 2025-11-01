// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/base/base-tag/base-tag.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TagVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
export type TagSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-base-tag',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './base-tag.component.html',
  styleUrls: ['./base-tag.component.scss'],
})
export class BaseTagComponent {
  @Input() label = '';
  @Input() icon = '';
  @Input() variant: TagVariant = 'primary';
  @Input() size: TagSize = 'medium';
  @Input() closable = false;
  @Input() clickable = false;
  @Input() children = false;
  @Input() customClass = '';

  @Output() closed = new EventEmitter<void>();

  get tagClass(): string {
    const classes = [
      'base-tag',
      this.variant,
      this.size !== 'medium' ? this.size : '',
      this.clickable ? 'clickable' : '',
      this.customClass,
    ].filter(Boolean);

    return classes.join(' ');
  }

  onClose(event: Event): void {
    event.stopPropagation();
    this.closed.emit();
  }
}



