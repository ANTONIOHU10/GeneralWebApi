// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/base/base-dropdown/base-dropdown.component.ts
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
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DropdownItem {
  label?: string;
  value?: unknown;
  icon?: string;
  disabled?: boolean;
  divider?: boolean;
  onClick?: () => void;
  children?: DropdownItem[];
}

export type DropdownPlacement = 'bottom' | 'top' | 'left' | 'right' | 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
export type DropdownTrigger = 'click' | 'hover' | 'manual';

@Component({
  selector: 'app-base-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './base-dropdown.component.html',
  styleUrls: ['./base-dropdown.component.scss'],
})
export class BaseDropdownComponent implements OnInit, OnDestroy {
  @Input() items: DropdownItem[] = [];
  @Input() trigger: DropdownTrigger = 'click';
  @Input() placement: DropdownPlacement = 'bottom-start';
  @Input() disabled = false;
  @Input() triggerText = '';
  @Input() triggerIcon = '';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() customClass = '';
  @Input() offset = 8;

  @Output() itemClick = new EventEmitter<DropdownItem>();
  @Output() openChange = new EventEmitter<boolean>();

  @ViewChild('triggerElement') triggerElement!: ElementRef;
  @ViewChild('dropdownMenu') dropdownMenu!: ElementRef;

  isOpen = false;
  dropdownId = `dropdown-${Math.random().toString(36).slice(2, 11)}`;

  private clickListener?: () => void;
  private hoverTimeout?: number;

  ngOnInit(): void {
    if (this.trigger === 'manual') {
      // Manual control, no event listeners needed
      return;
    }
  }

  ngOnDestroy(): void {
    this.removeEventListeners();
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen && this.trigger === 'click') {
      const target = event.target as Node;
      if (
        this.triggerElement &&
        !this.triggerElement.nativeElement.contains(target) &&
        this.dropdownMenu &&
        !this.dropdownMenu.nativeElement.contains(target)
      ) {
        this.close();
      }
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isOpen) {
      this.close();
    }
  }

  toggle(): void {
    if (this.disabled) return;
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open(): void {
    if (this.disabled || this.isOpen) return;
    this.isOpen = true;
    this.openChange.emit(true);
    this.updatePosition();
  }

  close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.openChange.emit(false);
  }

  onTriggerClick(): void {
    if (this.trigger === 'click') {
      this.toggle();
    }
  }

  onTriggerMouseEnter(): void {
    if (this.trigger === 'hover') {
      if (this.hoverTimeout) {
        clearTimeout(this.hoverTimeout);
      }
      this.open();
    }
  }

  onTriggerMouseLeave(): void {
    if (this.trigger === 'hover') {
      this.hoverTimeout = window.setTimeout(() => {
        this.close();
      }, 150);
    }
  }

  onMenuMouseEnter(): void {
    if (this.trigger === 'hover') {
      if (this.hoverTimeout) {
        clearTimeout(this.hoverTimeout);
      }
    }
  }

  onMenuMouseLeave(): void {
    if (this.trigger === 'hover') {
      this.close();
    }
  }

  onItemClick(item: DropdownItem, event: Event): void {
    event.stopPropagation();
    if (item.disabled || item.divider) return;

    if (item.onClick) {
      item.onClick();
    }

    this.itemClick.emit(item);
    this.close();
  }

  get dropdownClass(): string {
    const classes = [
      'dropdown-menu',
      `placement-${this.placement}`,
      this.size !== 'medium' ? this.size : '',
      this.customClass,
    ].filter(Boolean);
    return classes.join(' ');
  }

  get triggerClass(): string {
    const classes = [
      'dropdown-trigger',
      this.size !== 'medium' ? this.size : '',
      this.isOpen ? 'open' : '',
      this.disabled ? 'disabled' : '',
    ].filter(Boolean);
    return classes.join(' ');
  }

  private updatePosition(): void {
    // Position calculation would be implemented here
    // For now, CSS handles positioning via placement classes
    setTimeout(() => {
      if (this.triggerElement && this.dropdownMenu) {
        // Future: dynamic positioning logic
      }
    }, 0);
  }

  private removeEventListeners(): void {
    if (this.clickListener) {
      document.removeEventListener('click', this.clickListener);
      this.clickListener = undefined;
    }
  }
}
