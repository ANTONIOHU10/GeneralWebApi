// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/base/base-popover/base-popover.component.ts
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  HostListener,
  ElementRef,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type PopoverPlacement =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-start'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-end'
  | 'left-start'
  | 'left-end'
  | 'right-start'
  | 'right-end';

export type PopoverTrigger = 'click' | 'hover' | 'focus' | 'manual';

@Component({
  selector: 'app-base-popover',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './base-popover.component.html',
  styleUrls: ['./base-popover.component.scss'],
})
export class BasePopoverComponent implements OnInit, OnDestroy {
  @Input() title = '';
  @Input() content = '';
  @Input() trigger: PopoverTrigger = 'hover';
  @Input() placement: PopoverPlacement = 'top';
  @Input() disabled = false;
  @Input() visible = false;
  @Input() offset = 8;
  @Input() customClass = '';
  @Input() showArrow = true;
  @Input() width?: string;

  @Output() visibleChange = new EventEmitter<boolean>();

  @ViewChild('triggerElement') triggerElement!: ElementRef;
  @ViewChild('popoverContent') popoverContent!: ElementRef;

  isVisible = false;
  popoverId = `popover-${Math.random().toString(36).slice(2, 11)}`;
  private hoverTimeout?: number;

  ngOnInit(): void {
    if (this.trigger === 'manual') {
      this.isVisible = this.visible;
    }
  }

  ngOnDestroy(): void {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isVisible && this.trigger === 'click') {
      const target = event.target as Node;
      if (
        this.triggerElement &&
        !this.triggerElement.nativeElement.contains(target) &&
        this.popoverContent &&
        !this.popoverContent.nativeElement.contains(target)
      ) {
        this.hide();
      }
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isVisible) {
      this.hide();
    }
  }

  onTriggerClick(): void {
    if (this.disabled) return;
    if (this.trigger === 'click') {
      this.toggle();
    }
  }

  onTriggerMouseEnter(): void {
    if (this.disabled) return;
    if (this.trigger === 'hover') {
      if (this.hoverTimeout) {
        clearTimeout(this.hoverTimeout);
      }
      this.show();
    }
  }

  onTriggerMouseLeave(): void {
    if (this.trigger === 'hover') {
      this.hoverTimeout = window.setTimeout(() => {
        this.hide();
      }, 150);
    }
  }

  onPopoverMouseEnter(): void {
    if (this.trigger === 'hover') {
      if (this.hoverTimeout) {
        clearTimeout(this.hoverTimeout);
      }
    }
  }

  onPopoverMouseLeave(): void {
    if (this.trigger === 'hover') {
      this.hide();
    }
  }

  onTriggerFocus(): void {
    if (this.disabled) return;
    if (this.trigger === 'focus') {
      this.show();
    }
  }

  onTriggerBlur(): void {
    if (this.trigger === 'focus') {
      this.hide();
    }
  }

  show(): void {
    if (this.disabled || this.isVisible) return;
    this.isVisible = true;
    this.visibleChange.emit(true);
    setTimeout(() => this.updatePosition(), 0);
  }

  hide(): void {
    if (!this.isVisible) return;
    this.isVisible = false;
    this.visibleChange.emit(false);
  }

  toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  get popoverClass(): string {
    const classes = [
      'popover-content',
      `placement-${this.placement}`,
      this.showArrow ? 'with-arrow' : '',
      this.customClass,
    ].filter(Boolean);
    return classes.join(' ');
  }

  get popoverStyle(): Record<string, string> {
    const style: Record<string, string> = {};
    if (this.width) {
      style['width'] = this.width;
    }
    return style;
  }

  private updatePosition(): void {
    // Position calculation would be implemented here
    // For now, CSS handles positioning via placement classes
  }
}
