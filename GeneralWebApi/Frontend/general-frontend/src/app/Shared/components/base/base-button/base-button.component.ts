// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/base/base-button/base-button.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-base-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './base-button.component.html',
  styleUrls: ['./base-button.component.scss'],
})
export class BaseButtonComponent {
  @Input() text = '';
  @Input() icon = '';
  @Input() iconRight = false;
  @Input() variant:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'outline'
    | 'ghost' = 'primary';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() customClass = '';

  @Output() buttonClick = new EventEmitter<Event>();

  get buttonClass(): string {
    const classes = [
      'base-button',
      this.variant,
      this.size !== 'medium' ? this.size : '',
      this.icon && !this.text ? 'icon-only' : '',
      this.customClass,
    ].filter(Boolean);

    return classes.join(' ');
  }

  onClick(event: Event): void {
    if (!this.disabled && !this.loading) {
      this.buttonClick.emit(event);
    }
  }
}
