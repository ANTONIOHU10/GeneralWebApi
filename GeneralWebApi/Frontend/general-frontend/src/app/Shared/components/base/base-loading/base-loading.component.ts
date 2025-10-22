import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type LoadingSize = 'sm' | 'md' | 'lg';
export type LoadingType = 'spinner' | 'dots' | 'pulse' | 'skeleton';

export interface LoadingConfig {
  size?: LoadingSize;
  type?: LoadingType;
  message?: string;
  overlay?: boolean;
  centered?: boolean;
  fullHeight?: boolean;
}

@Component({
  selector: 'app-base-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './base-loading.component.html',
  styleUrls: ['./base-loading.component.scss']
})
export class BaseLoadingComponent {
  @Input() config: LoadingConfig = {
    size: 'md',
    type: 'spinner',
    message: 'Loading...',
    overlay: false,
    centered: true,
    fullHeight: false
  };

  @Input() message: string = '';
  @Input() size: LoadingSize = 'md';
  @Input() type: LoadingType = 'spinner';
  @Input() overlay: boolean = false;
  @Input() centered: boolean = true;
  @Input() fullHeight: boolean = false;

  get displayMessage(): string {
    return this.message || this.config.message || 'Loading...';
  }

  get displaySize(): LoadingSize {
    return this.size || this.config.size || 'md';
  }

  get displayType(): LoadingType {
    return this.type || this.config.type || 'spinner';
  }

  get isOverlay(): boolean {
    return this.overlay || this.config.overlay || false;
  }

  get isCentered(): boolean {
    return this.centered || this.config.centered || true;
  }

  get isFullHeight(): boolean {
    return this.fullHeight || this.config.fullHeight || false;
  }
}