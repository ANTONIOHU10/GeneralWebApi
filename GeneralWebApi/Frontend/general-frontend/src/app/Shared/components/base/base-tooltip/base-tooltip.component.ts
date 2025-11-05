// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/base/base-tooltip/base-tooltip.component.ts
import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  HostListener,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type TooltipPlacement =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-start'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-end';

export type TooltipTrigger = 'hover' | 'focus' | 'click' | 'manual';

@Component({
  selector: 'app-base-tooltip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './base-tooltip.component.html',
  styleUrls: ['./base-tooltip.component.scss'],
})
export class BaseTooltipComponent implements OnInit, OnDestroy {
  @Input() text = '';
  @Input() placement: TooltipPlacement = 'top';
  @Input() trigger: TooltipTrigger = 'hover';
  @Input() disabled = false;
  @Input() delay = 0;
  @Input() showArrow = true;
  @Input() customClass = '';

  @ViewChild('triggerElement') triggerElement!: ElementRef;
  @ViewChild('tooltipContent') tooltipContent!: ElementRef;

  isVisible = false;
  tooltipId = `tooltip-${Math.random().toString(36).slice(2, 11)}`;
  private showTimeout?: number;
  private hideTimeout?: number;

  ngOnInit(): void {
    // Initial setup
  }

  ngOnDestroy(): void {
    this.clearTimeouts();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isVisible && this.trigger === 'click') {
      const target = event.target as Node;
      if (
        this.triggerElement &&
        !this.triggerElement.nativeElement.contains(target) &&
        this.tooltipContent &&
        !this.tooltipContent.nativeElement.contains(target)
      ) {
        this.hide();
      }
    }
  }

  onTriggerMouseEnter(): void {
    if (this.disabled || this.trigger !== 'hover') return;
    this.clearTimeouts();
    this.showTimeout = window.setTimeout(() => {
      this.show();
    }, this.delay);
  }

  onTriggerMouseLeave(): void {
    if (this.trigger !== 'hover') return;
    this.clearTimeouts();
    this.hideTimeout = window.setTimeout(() => {
      this.hide();
    }, 100);
  }

  onTriggerClick(): void {
    if (this.disabled || this.trigger !== 'click') return;
    this.toggle();
  }

  onTriggerFocus(): void {
    if (this.disabled || this.trigger !== 'focus') return;
    this.show();
  }

  onTriggerBlur(): void {
    if (this.trigger !== 'focus') return;
    this.hide();
  }

  onTooltipMouseEnter(): void {
    if (this.trigger === 'hover') {
      this.clearTimeouts();
    }
  }

  onTooltipMouseLeave(): void {
    if (this.trigger === 'hover') {
      this.clearTimeouts();
      this.hideTimeout = window.setTimeout(() => {
        this.hide();
      }, 100);
    }
  }

  show(): void {
    if (this.disabled || this.isVisible || !this.text) return;
    this.clearTimeouts();
    this.isVisible = true;
    setTimeout(() => this.updatePosition(), 0);
  }

  hide(): void {
    if (!this.isVisible) return;
    this.clearTimeouts();
    this.isVisible = false;
  }

  toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  get tooltipClass(): string {
    const classes = [
      'tooltip-content',
      `placement-${this.placement}`,
      this.showArrow ? 'with-arrow' : '',
      this.customClass,
    ].filter(Boolean);
    return classes.join(' ');
  }

  private updatePosition(): void {
    // Position calculation would be implemented here
    // For now, CSS handles positioning via placement classes
  }

  private clearTimeouts(): void {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = undefined;
    }
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = undefined;
    }
  }
}
