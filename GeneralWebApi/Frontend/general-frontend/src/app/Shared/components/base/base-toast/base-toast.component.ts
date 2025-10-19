// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/base/base-toast/base-toast.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ToastConfig {
  position?: 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center';
  duration?: number;
  closable?: boolean;
  pauseOnHover?: boolean;
  showProgress?: boolean;
  maxToasts?: number;
  animation?: boolean;
}

export interface ToastData {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  icon?: string;
  duration?: number;
  closable?: boolean;
  actions?: ToastAction[];
}

export interface ToastAction {
  label: string;
  action: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
}

@Component({
  selector: 'app-base-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" [class]="containerClass">
      <div
        *ngFor="let toast of toasts; trackBy: trackByToastId"
        class="toast"
        [class]="getToastClass(toast)"
        [@slideInOut]
      >
        <div class="toast-content">
          <div class="toast-icon">
            <span class="material-icons">{{ getToastIcon(toast) }}</span>
          </div>
          
          <div class="toast-body">
            <div class="toast-title" *ngIf="toast.title">{{ toast.title }}</div>
            <div class="toast-message">{{ toast.message }}</div>
            
            <div class="toast-actions" *ngIf="toast.actions?.length">
              <button
                *ngFor="let action of toast.actions"
                class="toast-action"
                [class]="getActionClass(action)"
                (click)="executeAction(action)"
              >
                {{ action.label }}
              </button>
            </div>
          </div>
          
          <div class="toast-close" *ngIf="toast.closable !== false">
            <button
              class="close-btn"
              (click)="removeToast(toast.id)"
              [attr.aria-label]="'Close notification'"
            >
              <span class="material-icons">close</span>
            </button>
          </div>
        </div>
        
        <div
          *ngIf="config.showProgress && toast.duration"
          class="toast-progress"
          [style.animation-duration]="toast.duration + 'ms'"
        ></div>
      </div>
    </div>
  `,
  styles: [
    `
      .toast-container {
        position: fixed;
        z-index: 1100;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        max-width: 400px;
        pointer-events: none;

        &.top-right {
          top: 1rem;
          right: 1rem;
        }

        &.top-left {
          top: 1rem;
          left: 1rem;
        }

        &.top-center {
          top: 1rem;
          left: 50%;
          transform: translateX(-50%);
        }

        &.bottom-right {
          bottom: 1rem;
          right: 1rem;
          flex-direction: column-reverse;
        }

        &.bottom-left {
          bottom: 1rem;
          left: 1rem;
          flex-direction: column-reverse;
        }

        &.bottom-center {
          bottom: 1rem;
          left: 50%;
          transform: translateX(-50%);
          flex-direction: column-reverse;
        }
      }

      .toast {
        background: var(--bg-surface);
        border: 1px solid var(--border-primary);
        border-radius: var(--border-radius-lg);
        box-shadow: var(--shadow-lg);
        overflow: hidden;
        pointer-events: auto;
        position: relative;
        min-width: 300px;
        max-width: 400px;
        transform: translateX(0);
        transition: all 0.3s ease;

        &.success {
          border-left: 4px solid var(--color-success);
        }

        &.error {
          border-left: 4px solid var(--color-error);
        }

        &.warning {
          border-left: 4px solid var(--color-warning);
        }

        &.info {
          border-left: 4px solid var(--color-info);
        }
      }

      .toast-content {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 1rem;
      }

      .toast-icon {
        flex-shrink: 0;
        width: 1.5rem;
        height: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        margin-top: 0.125rem;

        .material-icons {
          font-size: 1.2rem;
        }

        .toast.success & {
          background: var(--color-success-50);
          color: var(--color-success-700);
        }

        .toast.error & {
          background: var(--color-error-50);
          color: var(--color-error-700);
        }

        .toast.warning & {
          background: var(--color-warning-50);
          color: var(--color-warning-700);
        }

        .toast.info & {
          background: var(--color-info-50);
          color: var(--color-info-700);
        }
      }

      .toast-body {
        flex: 1;
        min-width: 0;

        .toast-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
          line-height: 1.4;
        }

        .toast-message {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.4;
          word-wrap: break-word;
        }

        .toast-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.75rem;
          flex-wrap: wrap;

          .toast-action {
            padding: 0.375rem 0.75rem;
            border: 1px solid var(--border-primary);
            border-radius: var(--border-radius-sm);
            background: var(--bg-surface);
            color: var(--text-primary);
            font-size: 0.8rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;

            &:hover {
              background: var(--bg-secondary);
              border-color: var(--border-focus);
            }

            &.primary {
              background: var(--color-primary-500);
              color: var(--color-white);
              border-color: var(--color-primary-500);

              &:hover {
                background: var(--color-primary-600);
                border-color: var(--color-primary-600);
              }
            }

            &.outline {
              background: transparent;
              border-color: var(--color-primary-500);
              color: var(--color-primary-500);

              &:hover {
                background: var(--color-primary-50);
              }
            }
          }
        }
      }

      .toast-close {
        flex-shrink: 0;

        .close-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 1.5rem;
          height: 1.5rem;
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
            font-size: 1rem;
          }
        }
      }

      .toast-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background: var(--color-primary-500);
        animation: progress linear forwards;

        .toast.success & {
          background: var(--color-success);
        }

        .toast.error & {
          background: var(--color-error);
        }

        .toast.warning & {
          background: var(--color-warning);
        }

        .toast.info & {
          background: var(--color-info);
        }
      }

      @keyframes progress {
        from {
          width: 100%;
        }
        to {
          width: 0%;
        }
      }

      @keyframes slideInOut {
        0% {
          transform: translateX(100%);
          opacity: 0;
        }
        100% {
          transform: translateX(0);
          opacity: 1;
        }
      }

      /* Responsive design */
      @media (max-width: 768px) {
        .toast-container {
          left: 1rem !important;
          right: 1rem !important;
          transform: none !important;
          max-width: none;
        }

        .toast {
          min-width: auto;
          max-width: none;
        }
      }

      @media (max-width: 480px) {
        .toast-container {
          top: 0.5rem !important;
          bottom: 0.5rem !important;
          left: 0.5rem !important;
          right: 0.5rem !important;
        }

        .toast-content {
          padding: 0.75rem;
        }

        .toast-body {
          .toast-title {
            font-size: 0.9rem;
          }

          .toast-message {
            font-size: 0.8rem;
          }
        }
      }
    `,
  ],
  animations: [
    // Add Angular animations here if needed
  ],
})
export class BaseToastComponent implements OnInit, OnDestroy {
  @Input() config: ToastConfig = {
    position: 'top-right',
    duration: 5000,
    closable: true,
    pauseOnHover: true,
    showProgress: true,
    maxToasts: 5,
    animation: true,
  };

  @Output() toastAdded = new EventEmitter<ToastData>();
  @Output() toastRemoved = new EventEmitter<string>();

  toasts: ToastData[] = [];
  private timers = new Map<string, number>();

  get containerClass(): string {
    const classes = [
      'toast-container',
      this.config.position || 'top-right',
    ].filter(Boolean);

    return classes.join(' ');
  }

  ngOnInit(): void {
    // Initialize toast service if needed
    this.setupToastService();
  }

  private setupToastService(): void {
    // Toast service initialization logic
  }

  ngOnDestroy(): void {
    // Clear all timers
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
  }

  addToast(toast: Omit<ToastData, 'id'>): string {
    const id = this.generateId();
    const toastData: ToastData = {
      id,
      duration: this.config.duration,
      closable: this.config.closable,
      ...toast,
    };

    // Remove oldest toast if max limit reached
    if (this.toasts.length >= (this.config.maxToasts || 5)) {
      this.removeToast(this.toasts[0].id);
    }

    this.toasts.push(toastData);
    this.toastAdded.emit(toastData);

    // Set auto-remove timer
    if (toastData.duration && toastData.duration > 0) {
      const timer = setTimeout(() => {
        this.removeToast(id);
      }, toastData.duration);

      this.timers.set(id, timer);
    }

    return id;
  }

  removeToast(id: string): void {
    const index = this.toasts.findIndex(toast => toast.id === id);
    if (index > -1) {
      this.toasts.splice(index, 1);
      this.toastRemoved.emit(id);

      // Clear timer
      const timer = this.timers.get(id);
      if (timer) {
        clearTimeout(timer);
        this.timers.delete(id);
      }
    }
  }

  clearAllToasts(): void {
    this.toasts.forEach(toast => {
      const timer = this.timers.get(toast.id);
      if (timer) {
        clearTimeout(timer);
      }
    });
    this.timers.clear();
    this.toasts = [];
  }

  executeAction(action: ToastAction): void {
    action.action();
  }

  trackByToastId(index: number, toast: ToastData): string {
    return toast.id;
  }

  getToastClass(toast: ToastData): string {
    const classes = [
      'toast',
      toast.type,
    ].filter(Boolean);

    return classes.join(' ');
  }

  getToastIcon(toast: ToastData): string {
    if (toast.icon) return toast.icon;

    const iconMap = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info',
    };

    return iconMap[toast.type] || 'info';
  }

  getActionClass(action: ToastAction): string {
    const classes = [
      'toast-action',
      action.variant || 'secondary',
    ].filter(Boolean);

    return classes.join(' ');
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Convenience methods for different toast types
  success(title: string, message: string, options?: Partial<ToastData>): string {
    return this.addToast({ title, message, type: 'success', ...options });
  }

  error(title: string, message: string, options?: Partial<ToastData>): string {
    return this.addToast({ title, message, type: 'error', ...options });
  }

  warning(title: string, message: string, options?: Partial<ToastData>): string {
    return this.addToast({ title, message, type: 'warning', ...options });
  }

  info(title: string, message: string, options?: Partial<ToastData>): string {
    return this.addToast({ title, message, type: 'info', ...options });
  }
}

