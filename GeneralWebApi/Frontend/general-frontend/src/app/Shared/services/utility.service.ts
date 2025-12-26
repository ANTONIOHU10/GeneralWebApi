// Path: GeneralWebApi/Frontend/general-frontend/src/app/Shared/services/utility.service.ts
import { Injectable, inject } from '@angular/core';
import { LocaleService } from '@core/services/locale.service';

/**
 * UtilityService - Common utility functions service
 * 
 * Purpose: Provides reusable utility functions for common operations
 * - Formatting utilities (date, number, currency, file size)
 * - String manipulation (truncate, capitalize, case conversion)
 * - Validation functions (email, URL)
 * - Functional utilities (debounce, throttle, deep clone)
 * - Browser utilities (download, clipboard)
 * 
 * Note: These are pure functions, but provided as Injectable service
 * for dependency injection and consistent API across the application
 * 
 * Usage:
 * - Format data: formatDate(), formatNumber(), formatCurrency()
 * - Validate: isValidEmail(), isValidUrl()
 * - Utilities: debounce(), throttle(), deepClone()
 * - Browser: downloadFile(), copyToClipboard()
 * 
 * @example
 * ```typescript
 * // Formatting
 * const date = this.utility.formatDate(new Date(), 'YYYY-MM-DD');
 * const currency = this.utility.formatCurrency(1234.56, 'USD');
 * 
 * // Validation
 * if (this.utility.isValidEmail(email)) { ... }
 * 
 * // Functional
 * const debouncedSearch = this.utility.debounce(this.search, 300);
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class UtilityService {
  private localeService = inject(LocaleService);
  /**
   * Format date to string
   */
  formatDate(
    date: Date | string | number,
    format: 'short' | 'medium' | 'long' | 'full' | string = 'medium'
  ): string {
    const dateObj = typeof date === 'string' || typeof date === 'number'
      ? new Date(date)
      : date;

    if (isNaN(dateObj.getTime())) {
      return '';
    }

    // Use LocaleService for dynamic locale and timezone
    const locale = this.localeService.getLocaleCode();
    const timezone = this.localeService.getCurrentTimezone();
    const formatMap: Record<string, Intl.DateTimeFormatOptions> = {
      short: { dateStyle: 'short' },
      medium: { dateStyle: 'medium' },
      long: { dateStyle: 'long' },
      full: { dateStyle: 'full' },
    };
    const formatOptions: Intl.DateTimeFormatOptions = formatMap[format] || {};

    // Custom format support
    if (!formatOptions.dateStyle) {
      return this.formatCustomDate(dateObj, format);
    }

    return new Intl.DateTimeFormat(locale, {
      ...formatOptions,
      timeZone: timezone,
    }).format(dateObj);
  }

  /**
   * Format custom date string
   */
  private formatCustomDate(date: Date, format: string): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  }

  /**
   * Format number with thousand separators
   */
  formatNumber(
    value: number,
    decimals: number = 2,
    locale: string = 'en-US'
  ): string {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }

  /**
   * Format currency
   */
  formatCurrency(
    value: number,
    currency: string = 'USD',
    locale: string = 'en-US'
  ): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(value);
  }

  /**
   * Format file size
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  /**
   * Debounce function
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return function executedFunction(...args: Parameters<T>) {
      const later = () => {
        timeout = null;
        func(...args);
      };
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Throttle function
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;

    return function executedFunction(...args: Parameters<T>) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * Deep clone object
   */
  deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime()) as unknown as T;
    }

    if (obj instanceof Array) {
      return obj.map(item => this.deepClone(item)) as unknown as T;
    }

    if (typeof obj === 'object') {
      const clonedObj = {} as T;
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = this.deepClone(obj[key]);
        }
      }
      return clonedObj;
    }

    return obj;
  }

  /**
   * Check if value is empty (null, undefined, empty string, empty array, empty object)
   */
  isEmpty(value: any): boolean {
    if (value === null || value === undefined) {
      return true;
    }

    if (typeof value === 'string' && value.trim() === '') {
      return true;
    }

    if (Array.isArray(value) && value.length === 0) {
      return true;
    }

    if (typeof value === 'object' && Object.keys(value).length === 0) {
      return true;
    }

    return false;
  }

  /**
   * Generate unique ID
   */
  generateId(prefix: string = 'id'): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Validate email
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate URL
   */
  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Truncate string
   */
  truncate(str: string, length: number, suffix: string = '...'): string {
    if (str.length <= length) {
      return str;
    }
    return str.substring(0, length) + suffix;
  }

  /**
   * Capitalize first letter
   */
  capitalize(str: string): string {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Convert camelCase to kebab-case
   */
  camelToKebab(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }

  /**
   * Convert kebab-case to camelCase
   */
  kebabToCamel(str: string): string {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }

  /**
   * Get random number between min and max
   */
  random(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Sleep/delay function
   */
  sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Download file
   */
  downloadFile(data: Blob | string, filename: string, mimeType?: string): void {
    const blob = typeof data === 'string' 
      ? new Blob([data], { type: mimeType || 'text/plain' })
      : data;

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Copy text to clipboard
   */
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      }
    } catch (error) {
      console.error('Failed to copy text to clipboard', error);
      return false;
    }
  }
}

