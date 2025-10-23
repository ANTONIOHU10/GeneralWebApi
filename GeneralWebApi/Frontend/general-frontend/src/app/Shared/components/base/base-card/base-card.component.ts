// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/base/base-card/base-card.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-base-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './base-card.component.html',
  styleUrls: ['./base-card.component.scss']
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
