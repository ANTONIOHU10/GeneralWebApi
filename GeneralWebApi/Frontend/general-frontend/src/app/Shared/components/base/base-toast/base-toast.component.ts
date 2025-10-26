// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/base/base-toast/base-toast.component.ts
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ToastConfig {
  position?:
    | 'top-right'
    | 'top-left'
    | 'top-center'
    | 'bottom-right'
    | 'bottom-left'
    | 'bottom-center';
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
  templateUrl: './base-toast.component.html',
  styleUrls: ['./base-toast.component.scss'],
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
  private timers = new Map<string, ReturnType<typeof setTimeout>>();

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
    const classes = ['toast', toast.type].filter(Boolean);

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
    const classes = ['toast-action', action.variant || 'secondary'].filter(
      Boolean
    );

    return classes.join(' ');
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Convenience methods for different toast types
  success(
    title: string,
    message: string,
    options?: Partial<ToastData>
  ): string {
    return this.addToast({ title, message, type: 'success', ...options });
  }

  error(title: string, message: string, options?: Partial<ToastData>): string {
    return this.addToast({ title, message, type: 'error', ...options });
  }

  warning(
    title: string,
    message: string,
    options?: Partial<ToastData>
  ): string {
    return this.addToast({ title, message, type: 'warning', ...options });
  }

  info(title: string, message: string, options?: Partial<ToastData>): string {
    return this.addToast({ title, message, type: 'info', ...options });
  }
}
