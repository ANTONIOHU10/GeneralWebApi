// Path: GeneralWebApi/Frontend/general-frontend/src/app/core/services/locale.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export interface TimeZone {
  value: string;
  label: string;
  offset: string;
}

@Injectable({
  providedIn: 'root',
})
export class LocaleService {
  private readonly STORAGE_KEY_LANGUAGE = 'app_language';
  private readonly STORAGE_KEY_TIMEZONE = 'app_timezone';

  // Available languages
  readonly languages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano' },
    // { code: 'fr', name: 'French', nativeName: 'Français' },
    // { code: 'de', name: 'German', nativeName: 'Deutsch' },
    // { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  ];

  // Available timezones
  readonly timezones: TimeZone[] = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)', offset: '+00:00' },
    { value: 'Asia/Shanghai', label: 'Asia/Shanghai (CST)', offset: '+08:00' },
    { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)', offset: '+09:00' },
    { value: 'America/New_York', label: 'America/New_York (EST/EDT)', offset: '-05:00/-04:00' },
    { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST/PDT)', offset: '-08:00/-07:00' },
    { value: 'Europe/London', label: 'Europe/London (GMT/BST)', offset: '+00:00/+01:00' },
    { value: 'Europe/Paris', label: 'Europe/Paris (CET/CEST)', offset: '+01:00/+02:00' },
    { value: 'Europe/Berlin', label: 'Europe/Berlin (CET/CEST)', offset: '+01:00/+02:00' },
    { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST/AEDT)', offset: '+10:00/+11:00' },
  ];

  // Current language and timezone
  private currentLanguage$ = new BehaviorSubject<string>(this.getStoredLanguage());
  private currentTimezone$ = new BehaviorSubject<string>(this.getStoredTimezone());

  constructor() {
    // Initialize locale settings
    this.initializeLocale();
  }

  /**
   * Get current language code
   */
  getCurrentLanguage(): string {
    return this.currentLanguage$.value;
  }

  /**
   * Get current language as Observable
   */
  getCurrentLanguage$(): Observable<string> {
    return this.currentLanguage$.asObservable();
  }

  /**
   * Set language
   */
  setLanguage(languageCode: string): void {
    if (this.languages.some(lang => lang.code === languageCode)) {
      this.currentLanguage$.next(languageCode);
      localStorage.setItem(this.STORAGE_KEY_LANGUAGE, languageCode);
      this.applyLanguage(languageCode);
      // Trigger change detection for translation service
      setTimeout(() => {
        window.dispatchEvent(new Event('languagechange'));
      }, 0);
    }
  }

  /**
   * Get current timezone
   */
  getCurrentTimezone(): string {
    return this.currentTimezone$.value;
  }

  /**
   * Get current timezone as Observable
   */
  getCurrentTimezone$(): Observable<string> {
    return this.currentTimezone$.asObservable();
  }

  /**
   * Set timezone
   */
  setTimezone(timezone: string): void {
    if (this.timezones.some(tz => tz.value === timezone)) {
      this.currentTimezone$.next(timezone);
      localStorage.setItem(this.STORAGE_KEY_TIMEZONE, timezone);
    }
  }

  /**
   * Get stored language from localStorage or default
   */
  private getStoredLanguage(): string {
    const stored = localStorage.getItem(this.STORAGE_KEY_LANGUAGE);
    if (stored && this.languages.some(lang => lang.code === stored)) {
      return stored;
    }
    // Default to browser language or English
    const browserLang = navigator.language.split('-')[0];
    return this.languages.some(lang => lang.code === browserLang) ? browserLang : 'en';
  }

  /**
   * Get stored timezone from localStorage or default
   */
  private getStoredTimezone(): string {
    const stored = localStorage.getItem(this.STORAGE_KEY_TIMEZONE);
    if (stored && this.timezones.some(tz => tz.value === stored)) {
      return stored;
    }
    // Default to browser timezone or UTC
    try {
      const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return this.timezones.some(tz => tz.value === browserTz) ? browserTz : 'UTC';
    } catch {
      return 'UTC';
    }
  }

  /**
   * Initialize locale settings
   */
  private initializeLocale(): void {
    const language = this.getStoredLanguage();
    const timezone = this.getStoredTimezone();
    
    this.currentLanguage$.next(language);
    this.currentTimezone$.next(timezone);
    
    this.applyLanguage(language);
  }

  /**
   * Apply language to document
   */
  private applyLanguage(languageCode: string): void {
    document.documentElement.setAttribute('lang', languageCode);
    // You can add more language-specific logic here
    // For example, loading translation files, updating text direction, etc.
  }

  /**
   * Format date with current locale and timezone
   */
  formatDate(date: Date | string | number, format?: string): string {
    const dateObj = typeof date === 'string' || typeof date === 'number'
      ? new Date(date)
      : date;

    if (isNaN(dateObj.getTime())) {
      return '';
    }

    const locale = this.getLocaleCode();
    const timezone = this.getCurrentTimezone();

    try {
      if (format) {
        return new Intl.DateTimeFormat(locale, {
          timeZone: timezone,
          ...this.getFormatOptions(format),
        }).format(dateObj);
      }

      return new Intl.DateTimeFormat(locale, {
        timeZone: timezone,
        dateStyle: 'medium',
      }).format(dateObj);
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateObj.toLocaleString();
    }
  }

  /**
   * Get locale code (e.g., 'en-US', 'zh-CN')
   */
  getLocaleCode(): string {
    const language = this.getCurrentLanguage();
    // Map language codes to full locale codes
    const localeMap: Record<string, string> = {
      'en': 'en-US',
      'zh': 'zh-CN',
      'es': 'es-ES',
      'it': 'it-IT',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'ja': 'ja-JP',
    };
    return localeMap[language] || 'en-US';
  }

  /**
   * Get format options for date formatting
   */
  private getFormatOptions(format: string): Intl.DateTimeFormatOptions {
    const formatMap: Record<string, Intl.DateTimeFormatOptions> = {
      short: { dateStyle: 'short' },
      medium: { dateStyle: 'medium' },
      long: { dateStyle: 'long' },
      full: { dateStyle: 'full' },
    };
    return formatMap[format] || { dateStyle: 'medium' };
  }

  /**
   * Get language options for select component
   */
  getLanguageOptions(): Array<{ value: string; label: string }> {
    return this.languages.map(lang => ({
      value: lang.code,
      label: `${lang.nativeName} (${lang.name})`,
    }));
  }

  /**
   * Get timezone options for select component
   */
  getTimezoneOptions(): Array<{ value: string; label: string }> {
    return this.timezones.map(tz => ({
      value: tz.value,
      label: tz.label,
    }));
  }
}

