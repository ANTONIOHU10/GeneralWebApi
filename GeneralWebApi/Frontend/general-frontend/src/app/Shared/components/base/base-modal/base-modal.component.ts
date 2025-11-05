// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/base/base-modal/base-modal.component.ts
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

export interface ModalConfig {
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  closable?: boolean;
  backdrop?: boolean | 'static';
  keyboard?: boolean;
  animation?: boolean;
  centered?: boolean;
  scrollable?: boolean;
}

@Component({
  selector: 'app-base-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './base-modal.component.html',
  styleUrls: ['./base-modal.component.scss'],
})
export class BaseModalComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() icon = '';
  @Input() showHeader = true;
  @Input() showFooter = false;
  @Input() config: ModalConfig = {
    size: 'medium',
    closable: true,
    backdrop: true,
    keyboard: true,
    animation: true,
    centered: true,
    scrollable: false,
  };
  @Input() customClass = '';
  @Input() bodyClass = '';

  @Output() open = new EventEmitter<void>();
  @Output() closeEvent = new EventEmitter<void>();
  @Output() backdropClick = new EventEmitter<void>();

  @ViewChild('modalElement') modalElement!: ElementRef;

  titleId = `modal-title-${Math.random().toString(36).slice(2, 11)}`;
  contentId = `modal-content-${Math.random().toString(36).slice(2, 11)}`;

  get modalClass(): string {
    const classes = [
      'modal',
      this.config.size || 'medium',
      this.config.centered ? 'centered' : '',
      this.config.scrollable ? 'scrollable' : '',
      this.customClass,
    ].filter(Boolean);

    return classes.join(' ');
  }

  ngOnInit(): void {
    if (this.isOpen) {
      this.openModal();
    }
  }

  ngOnDestroy(): void {
    this.closeModal();
  }

  openModal(): void {
    this.isOpen = true;
    document.body.style.overflow = 'hidden';
    this.open.emit();

    // Focus management
    setTimeout(() => {
      if (this.modalElement) {
        this.modalElement.nativeElement.focus();
      }
    }, 100);
  }

  closeModal(): void {
    this.isOpen = false;
    document.body.style.overflow = '';
    this.closeEvent.emit();
  }

  close(): void {
    this.closeModal();
  }

  onBackdropClick(): void {
    if (this.config.backdrop === true) {
      this.backdropClick.emit();
      this.closeModal();
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (this.config.keyboard && event.key === 'Escape') {
      this.closeModal();
    }
  }

  // Public methods for external control
  show(): void {
    this.openModal();
  }

  hide(): void {
    this.closeModal();
  }

  toggle(): void {
    if (this.isOpen) {
      this.hide();
    } else {
      this.show();
    }
  }
}
