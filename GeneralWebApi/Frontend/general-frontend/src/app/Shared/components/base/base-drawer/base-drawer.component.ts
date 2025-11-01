// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/base/base-drawer/base-drawer.component.ts
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DrawerConfig {
  placement?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'small' | 'medium' | 'large' | 'full';
  closable?: boolean;
  backdrop?: boolean | 'static';
  keyboard?: boolean;
  animation?: boolean;
}

@Component({
  selector: 'app-base-drawer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './base-drawer.component.html',
  styleUrls: ['./base-drawer.component.scss'],
})
export class BaseDrawerComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() icon = '';
  @Input() showHeader = true;
  @Input() showFooter = false;
  @Input() config: DrawerConfig = {
    placement: 'right',
    size: 'medium',
    closable: true,
    backdrop: true,
    keyboard: true,
    animation: true,
  };
  @Input() customClass = '';
  @Input() bodyClass = '';

  @Output() open = new EventEmitter<void>();
  @Output() closeEvent = new EventEmitter<void>();
  @Output() backdropClick = new EventEmitter<void>();

  @ViewChild('drawerElement') drawerElement!: ElementRef;

  titleId = `drawer-title-${Math.random().toString(36).slice(2, 11)}`;
  contentId = `drawer-content-${Math.random().toString(36).slice(2, 11)}`;

  get drawerClass(): string {
    const classes = [
      'drawer',
      this.config.placement || 'right',
      this.config.size || 'medium',
      this.customClass,
    ].filter(Boolean);

    return classes.join(' ');
  }

  ngOnInit(): void {
    if (this.isOpen) {
      this.openDrawer();
    }
  }

  ngOnDestroy(): void {
    this.closeDrawer();
  }

  openDrawer(): void {
    this.isOpen = true;
    document.body.style.overflow = 'hidden';
    this.open.emit();
  }

  closeDrawer(): void {
    this.isOpen = false;
    document.body.style.overflow = '';
    this.closeEvent.emit();
  }

  close(): void {
    this.closeDrawer();
  }

  onBackdropClick(): void {
    if (this.config.backdrop === true) {
      this.backdropClick.emit();
      this.closeDrawer();
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (this.config.keyboard && event.key === 'Escape') {
      this.closeDrawer();
    }
  }

  show(): void {
    this.openDrawer();
  }

  hide(): void {
    this.closeDrawer();
  }

  toggle(): void {
    if (this.isOpen) {
      this.hide();
    } else {
      this.show();
    }
  }
}

