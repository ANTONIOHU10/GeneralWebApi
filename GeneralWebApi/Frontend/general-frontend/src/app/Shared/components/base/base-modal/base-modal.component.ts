// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/base/base-modal/base-modal.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
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
  template: `
    <div
      class="modal-backdrop"
      [class.show]="isOpen"
      [class.fade]="config.animation"
      (click)="onBackdropClick()"
      (keydown.escape)="onBackdropClick()"
      tabindex="0"
      role="button"
      [attr.aria-label]="'Close modal'"
      *ngIf="isOpen"
    >
      <div
        #modalElement
        class="modal"
        [class]="modalClass"
        role="dialog"
        [attr.aria-modal]="true"
        [attr.aria-labelledby]="titleId"
        [attr.aria-describedby]="contentId"
        (click)="$event.stopPropagation()"
        (keydown)="$event.stopPropagation()"
      >
        <!-- Modal Header -->
        <div class="modal-header" *ngIf="showHeader">
          <div class="modal-title">
            <span *ngIf="icon" class="modal-icon material-icons">{{ icon }}</span>
            <h4 [id]="titleId" class="modal-title-text">{{ title }}</h4>
          </div>
          
          <div class="modal-actions">
            <ng-content select="[slot=header-actions]"></ng-content>
            
            <button
              *ngIf="config.closable"
              type="button"
              class="modal-close"
              (click)="close()"
              [attr.aria-label]="'Close modal'"
            >
              <span class="material-icons">close</span>
            </button>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="modal-body" [id]="contentId" [class]="bodyClass">
          <ng-content></ng-content>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer" *ngIf="showFooter">
          <ng-content select="[slot=footer]"></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--bg-overlay);
        z-index: 1050;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;

        &.show {
          opacity: 1;
          visibility: visible;
        }

        &.fade {
          transition: opacity 0.3s ease, visibility 0.3s ease;
        }
      }

      .modal {
        background: var(--bg-surface);
        border: 1px solid var(--border-primary);
        border-radius: var(--border-radius-lg);
        box-shadow: var(--shadow-xl);
        max-width: 90vw;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        transform: scale(0.9);
        transition: transform 0.3s ease;

        .modal-backdrop.show & {
          transform: scale(1);
        }

        &.small {
          width: 400px;
        }

        &.medium {
          width: 600px;
        }

        &.large {
          width: 800px;
        }

        &.fullscreen {
          width: 95vw;
          height: 95vh;
          max-width: none;
          max-height: none;
        }

        &.centered {
          margin: auto;
        }

        &.scrollable {
          overflow: hidden;
        }
      }

      .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.5rem;
        border-bottom: 1px solid var(--border-primary);
        background: var(--bg-surface);

        .modal-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;

          .modal-icon {
            font-size: 1.5rem;
            color: var(--color-primary-500);
          }

          .modal-title-text {
            margin: 0;
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--text-primary);
          }
        }

        .modal-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;

          .modal-close {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 2rem;
            height: 2rem;
            border: none;
            background: none;
            border-radius: 50%;
            cursor: pointer;
            color: var(--text-tertiary);
            transition: all 0.2s ease;

            &:hover {
              background: var(--bg-secondary);
              color: var(--text-primary);
            }

            .material-icons {
              font-size: 1.2rem;
            }
          }
        }
      }

      .modal-body {
        padding: 1.5rem;
        flex: 1;
        overflow-y: auto;
        color: var(--text-primary);

        &.scrollable {
          max-height: 60vh;
        }

        &.no-padding {
          padding: 0;
        }
      }

      .modal-footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.75rem;
        padding: 1rem 1.5rem;
        border-top: 1px solid var(--border-primary);
        background: var(--bg-secondary);
      }

      /* Modal sizes */
      .modal.small {
        .modal-header,
        .modal-body,
        .modal-footer {
          padding: 1rem;
        }
      }

      .modal.large {
        .modal-header,
        .modal-body,
        .modal-footer {
          padding: 2rem;
        }
      }

      /* Animation variants */
      .modal-backdrop.fade {
        .modal {
          &.slide-down {
            transform: translateY(-50px);
            transition: transform 0.3s ease;

            .modal-backdrop.show & {
              transform: translateY(0);
            }
          }

          &.slide-up {
            transform: translateY(50px);
            transition: transform 0.3s ease;

            .modal-backdrop.show & {
              transform: translateY(0);
            }
          }

          &.slide-left {
            transform: translateX(-50px);
            transition: transform 0.3s ease;

            .modal-backdrop.show & {
              transform: translateX(0);
            }
          }

          &.slide-right {
            transform: translateX(50px);
            transition: transform 0.3s ease;

            .modal-backdrop.show & {
              transform: translateX(0);
            }
          }
        }
      }

      /* Responsive design */
      @media (max-width: 768px) {
        .modal-backdrop {
          padding: 0.5rem;
        }

        .modal {
          width: 100% !important;
          max-width: 100% !important;
          margin: 0;

          &.small,
          &.medium,
          &.large {
            width: 100% !important;
          }
        }

        .modal-header,
        .modal-body,
        .modal-footer {
          padding: 1rem;
        }
      }

      @media (max-width: 480px) {
        .modal-backdrop {
          padding: 0.25rem;
        }

        .modal-header {
          .modal-title {
            .modal-title-text {
              font-size: 1.1rem;
            }
          }
        }
      }
    `,
  ],
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

  titleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`;
  contentId = `modal-content-${Math.random().toString(36).substr(2, 9)}`;

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
