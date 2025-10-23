import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type EmptySize = 'sm' | 'md' | 'lg';
export type EmptyType = 'default' | 'search' | 'data' | 'error' | 'custom';

export interface EmptyConfig {
  type?: EmptyType;
  size?: EmptySize;
  showIcon?: boolean;
  showActionButton?: boolean;
  actionButtonText?: string;
  centered?: boolean;
  fullHeight?: boolean;
}

@Component({
  selector: 'app-base-empty',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './base-empty.component.html',
  styleUrls: ['./base-empty.component.scss']
})
export class BaseEmptyComponent {
  @Input() title = 'No data found';
  @Input() description?: string;
  @Input() config: EmptyConfig = {
    type: 'default',
    size: 'md',
    showIcon: true,
    showActionButton: false,
    actionButtonText: 'Add New',
    centered: true,
    fullHeight: false
  };

  @Input() type: EmptyType = 'default';
  @Input() size: EmptySize = 'md';
  @Input() showIcon = true;
  @Input() showActionButton = false;
  @Input() actionButtonText = 'Add New';
  @Input() centered = true;
  @Input() fullHeight = false;

  @Output() actionClick = new EventEmitter<void>();

  get displayType(): EmptyType {
    return this.type || this.config.type || 'default';
  }

  get displaySize(): EmptySize {
    return this.size || this.config.size || 'md';
  }

  get displayShowIcon(): boolean {
    return this.showIcon !== undefined ? this.showIcon : (this.config.showIcon ?? true);
  }

  get displayShowActionButton(): boolean {
    return this.showActionButton !== undefined ? this.showActionButton : (this.config.showActionButton ?? false);
  }

  get displayActionButtonText(): string {
    return this.actionButtonText || this.config.actionButtonText || 'Add New';
  }

  get displayCentered(): boolean {
    return this.centered !== undefined ? this.centered : (this.config.centered ?? true);
  }

  get displayFullHeight(): boolean {
    return this.fullHeight !== undefined ? this.fullHeight : (this.config.fullHeight ?? false);
  }

  get iconName(): string {
    switch (this.displayType) {
      case 'search':
        return 'search_off';
      case 'data':
        return 'inbox';
      case 'error':
        return 'error_outline';
      case 'custom':
        return 'help_outline';
      default:
        return 'inbox';
    }
  }

  get defaultTitle(): string {
    switch (this.displayType) {
      case 'search':
        return 'No results found';
      case 'data':
        return 'No data available';
      case 'error':
        return 'Unable to load data';
      case 'custom':
        return 'Nothing here';
      default:
        return 'No data found';
    }
  }

  get defaultDescription(): string {
    switch (this.displayType) {
      case 'search':
        return 'Try adjusting your search terms or filters';
      case 'data':
        return 'There are no items to display at the moment';
      case 'error':
        return 'Something went wrong while loading the data';
      case 'custom':
        return 'This section is empty';
      default:
        return 'There are no items to display';
    }
  }

  onActionClick() {
    this.actionClick.emit();
  }
}

