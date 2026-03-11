
// Path: GeneralWebApi/Frontend/general-frontend/src/app/Shared/components/base/base-filter-container/base-filter-container.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseCardComponent } from '../base-card/base-card.component';

export type BaseFilterFieldType = 'select' | 'segment';

export interface BaseFilterOption {
  value: string;
  label: string;
  count?: number | null;
}

export interface BaseFilterField {
  key: string;
  type: BaseFilterFieldType;
  label?: string;
  options: BaseFilterOption[];
}

@Component({
  selector: 'app-base-filter-container',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseCardComponent],
  templateUrl: './base-filter-container.component.html',
  styleUrls: ['./base-filter-container.component.scss'],
})
export class BaseFilterContainerComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() icon = '';
  @Input() variant: 'default' | 'elevated' | 'outlined' | 'flat' = 'flat';
  @Input() customClass = '';

  /**
   * Filter field definitions
   */
  @Input() fields: BaseFilterField[] = [];

  /**
   * Current filter value map, e.g. { status: 'Pending' }
   */
  @Input() value: Record<string, unknown> = {};

  /**
   * Emitted whenever any field value changes
   */
  @Output() valueChange = new EventEmitter<Record<string, unknown>>();

  get cardClass(): string {
    return `base-filter-container ${this.customClass}`.trim();
  }

  trackByFieldKey(_index: number, field: BaseFilterField): string {
    return field.key;
  }

  onFieldChange(key: string, newValue: unknown): void {
    const next = { ...(this.value || {}) };
    next[key] = newValue;
    this.value = next;
    this.valueChange.emit(next);
  }
}
