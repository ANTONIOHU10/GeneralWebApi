// Path: GeneralWebApi/Frontend/general-frontend/src/app/Shared/components/base/base-detail/base-detail.component.ts
import { Component, Input, Output, EventEmitter, TemplateRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseModalComponent } from '../base-modal/base-modal.component';
import { BaseCardComponent } from '../base-card/base-card.component';
import { BaseBadgeComponent, BadgeVariant } from '../base-badge/base-badge.component';

export interface DetailField {
  label: string;
  value: string | number | null | undefined;
  type?: 'text' | 'badge' | 'date' | 'custom';
  badgeVariant?: BadgeVariant;
  customTemplate?: TemplateRef<any>;
}

export interface DetailSection {
  title: string;
  fields: DetailField[];
  showDivider?: boolean;
  customContent?: TemplateRef<any>;
}

@Component({
  selector: 'app-base-detail',
  standalone: true,
  imports: [
    CommonModule,
    BaseModalComponent,
    BaseCardComponent,
    BaseBadgeComponent,
  ],
  templateUrl: './base-detail.component.html',
  styleUrls: ['./base-detail.component.scss'],
  encapsulation: ViewEncapsulation.None, // Allow styles to be used by child components
})
export class BaseDetailComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() mode: 'view' | 'edit' = 'view';
  @Input() sections: DetailSection[] = [];
  @Input() editFormTemplate?: TemplateRef<any>;
  @Input() customViewTemplate?: TemplateRef<any>;
  @Input() actionsTemplate?: TemplateRef<any>;
  @Input() modalConfig = {
    size: 'large' as const,
    closable: true,
    backdrop: true,
    keyboard: true,
    animation: true,
    centered: true,
    scrollable: true,
  };
  @Output() closeEvent = new EventEmitter<void>();

  onClose(): void {
    this.closeEvent.emit();
  }

  formatDate(date: string | number | null | undefined): string {
    if (!date) return 'N/A';
    if (typeof date === 'number') return date.toString();
    return new Date(date).toLocaleDateString();
  }

  getFieldValue(field: DetailField): string {
    if (field.type === 'date') {
      return this.formatDate(field.value);
    }
    return field.value?.toString() || 'N/A';
  }

  getBadgeText(field: DetailField): string {
    return field.value?.toString() || 'N/A';
  }

  getBadgeVariant(field: DetailField): BadgeVariant {
    return field.badgeVariant || 'secondary';
  }
}

