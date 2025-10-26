// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/base/base-page-header/base-page-header.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-base-page-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './base-page-header.component.html',
  styleUrls: ['./base-page-header.component.scss'],
})
export class BasePageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() icon = '';
  @Input() iconColor = 'var(--color-primary-500)';
  @Input() showActions = false;
}
