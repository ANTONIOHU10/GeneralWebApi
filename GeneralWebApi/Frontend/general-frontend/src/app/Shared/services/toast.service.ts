// Path: GeneralWebApi/Frontend/general-frontend/src/app/Shared/services/toast.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { ToastData, ToastConfig } from '../components/base/base-toast/base-toast.component';

/**
 * ToastService - Toast notification management service
 * 
 * Purpose: Centralized toast notification system with reactive state management
 * - Manages toast queue with automatic removal using RxJS timers
 * - Provides reactive Observable streams for components
 * - Supports multiple toast types (success, error, warning, info)
 * - Automatic cleanup and memory management
 * - Configurable position, duration, and behavior
 * 
 * Usage:
 * - Quick methods: success(), error(), warning(), info()
 * - Custom toast: show() with full configuration
 * - Reactive subscription: toasts$ Observable for components
 * 
 * @example
 * ```typescript
 * // Quick usage
 * this.toastService.success('Success', 'Operation completed');
 * 
 * // In component template
 * this.toastService.toasts$.subscribe(toasts => {
 *   this.toasts = toasts;
 * });
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class ToastService {
  // Private Subject to prevent external modifications
  private readonly toastsSubject = new BehaviorSubject<ToastData[]>([]);
  
  // Public readonly Observable - Angular best practice
  public readonly toasts$: Observable<ToastData[]> = this.toastsSubject.asObservable();

  // Track active timers for cleanup
  private readonly activeTimers = new Map<string, Subscription>();

  private toastId = 0;
  private readonly defaultConfig: ToastConfig = {
    position: 'top-right',
    duration: 5000,
    closable: true,
    pauseOnHover: true,
    showProgress: true,
    maxToasts: 5,
    animation: true,
  };

  private config: ToastConfig = { ...this.defaultConfig };

  /**
   * Set global toast configuration
   */
  setConfig(config: Partial<ToastConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current toast configuration
   */
  getConfig(): ToastConfig {
    return { ...this.config };
  }

  /**
   * Show a toast notification
   * Uses RxJS timer for automatic removal (more Angular-friendly than setTimeout)
   * 
   * @param toast Toast data
   * @returns Toast ID for manual removal if needed
   */
  show(toast: Omit<ToastData, 'id'>): string {
    const id = this.generateId();
    const toastData: ToastData = {
      ...toast,
      id,
      duration: toast.duration ?? this.config.duration,
      closable: toast.closable ?? this.config.closable,
    };

    const currentToasts = this.toastsSubject.value;

    // Remove oldest toast if max limit reached
    const maxToasts = this.config.maxToasts || 5;
    if (currentToasts.length >= maxToasts) {
      this.remove(currentToasts[0].id);
    }

    // Add new toast
    this.toastsSubject.next([...currentToasts, toastData]);

    // Auto-remove after duration using RxJS timer (more Angular-friendly)
    if (toastData.duration && toastData.duration > 0) {
      const timerSubscription = timer(toastData.duration)
        .pipe(take(1))
        .subscribe(() => {
          this.remove(id);
        });
      
      this.activeTimers.set(id, timerSubscription);
    }

    return id;
  }

  /**
   * Show success toast
   */
  success(
    title: string,
    message: string,
    options?: Partial<ToastData>
  ): string {
    return this.show({
      title,
      message,
      type: 'success',
      icon: 'check_circle',
      ...options,
    });
  }

  /**
   * Show error toast
   */
  error(title: string, message: string, options?: Partial<ToastData>): string {
    return this.show({
      title,
      message,
      type: 'error',
      icon: 'error',
      ...options,
    });
  }

  /**
   * Show warning toast
   */
  warning(
    title: string,
    message: string,
    options?: Partial<ToastData>
  ): string {
    return this.show({
      title,
      message,
      type: 'warning',
      icon: 'warning',
      ...options,
    });
  }

  /**
   * Show info toast
   */
  info(title: string, message: string, options?: Partial<ToastData>): string {
    return this.show({
      title,
      message,
      type: 'info',
      icon: 'info',
      ...options,
    });
  }

  /**
   * Remove a toast by ID
   * Cleans up associated timer subscription
   */
  remove(id: string): void {
    // Cancel timer if exists
    const timerSubscription = this.activeTimers.get(id);
    if (timerSubscription) {
      timerSubscription.unsubscribe();
      this.activeTimers.delete(id);
    }

    // Remove from toasts array
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next(currentToasts.filter(toast => toast.id !== id));
  }

  /**
   * Clear all toasts
   * Cleans up all active timers
   */
  clearAll(): void {
    // Unsubscribe all timers
    this.activeTimers.forEach(timer => timer.unsubscribe());
    this.activeTimers.clear();

    // Clear toasts
    this.toastsSubject.next([]);
  }

  /**
   * Clear toasts by type
   */
  clearByType(type: ToastData['type']): void {
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next(currentToasts.filter(toast => toast.type !== type));
  }

  /**
   * Get current toasts
   */
  getToasts(): ToastData[] {
    return this.toastsSubject.value;
  }

  private generateId(): string {
    return `toast-${++this.toastId}`;
  }
}

