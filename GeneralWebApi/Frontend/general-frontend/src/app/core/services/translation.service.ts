// Path: GeneralWebApi/Frontend/general-frontend/src/app/core/services/translation.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { LocaleService } from './locale.service';

export type TranslationKey = string;
export type TranslationParams = Record<string, string | number>;

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private http = inject(HttpClient);
  private localeService = inject(LocaleService);

  private translations: Record<string, any> = {};
  private currentLanguage$ = new BehaviorSubject<string>('en');
  private translationsLoaded$ = new BehaviorSubject<boolean>(false);

  constructor() {
    // Subscribe to language changes
    this.localeService.getCurrentLanguage$().subscribe((lang) => {
      if (lang !== this.currentLanguage$.value) {
        this.loadTranslations(lang);
      }
    });

    // Listen to languagechange event (triggered by LocaleService)
    if (typeof window !== 'undefined') {
      window.addEventListener('languagechange', () => {
        const currentLang = this.localeService.getCurrentLanguage();
        if (currentLang !== this.currentLanguage$.value) {
          this.loadTranslations(currentLang);
        }
      });
    }

    // Load initial translations
    this.loadTranslations(this.localeService.getCurrentLanguage());
  }

  /**
   * Load translations for a specific language
   */
  private loadTranslations(language: string): void {
    this.currentLanguage$.next(language);
    this.translationsLoaded$.next(false);

    this.http
      .get<any>(`/assets/i18n/${language}.json`)
      .pipe(
        catchError((error) => {
          console.error(`Failed to load translations for ${language}:`, error);
          // Fallback to English if translation file not found
          if (language !== 'en') {
            return this.http.get<any>('/assets/i18n/en.json');
          }
          return of({});
        }),
        shareReplay(1)
      )
      .subscribe({
        next: (translations) => {
          this.translations = translations;
          this.translationsLoaded$.next(true);
        },
        error: (error) => {
          console.error('Error loading translations:', error);
          this.translations = {};
          this.translationsLoaded$.next(true);
        },
      });
  }

  /**
   * Get translation for a key
   * @param key Translation key (e.g., 'common.save', 'auth.login')
   * @param params Optional parameters to replace in translation (e.g., {count: 5})
   * @returns Translated string
   */
  translate(key: TranslationKey, params?: TranslationParams): string {
    if (!key) {
      return '';
    }

    // Wait for translations to load
    if (!this.translationsLoaded$.value) {
      return key; // Return key as fallback while loading
    }

    const translation = this.getNestedValue(this.translations, key);

    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key; // Return key if translation not found
    }

    // Replace parameters in translation
    if (params) {
      return this.replaceParams(translation, params);
    }

    return translation;
  }

  /**
   * Get translation as Observable (for reactive updates)
   */
  translate$(key: TranslationKey, params?: TranslationParams): Observable<string> {
    return this.translationsLoaded$.pipe(
      map(() => this.translate(key, params))
    );
  }

  /**
   * Get nested value from object using dot notation
   * @example getNestedValue({common: {save: 'Save'}}, 'common.save') => 'Save'
   */
  private getNestedValue(obj: any, path: string): string | null {
    return path.split('.').reduce((current, prop) => {
      return current && current[prop] !== undefined ? current[prop] : null;
    }, obj);
  }

  /**
   * Replace parameters in translation string
   * @example replaceParams('Hello {{name}}', {name: 'John'}) => 'Hello John'
   */
  private replaceParams(translation: string, params: TranslationParams): string {
    let result = translation;

    for (const [key, value] of Object.entries(params)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, String(value));
    }

    return result;
  }

  /**
   * Check if translations are loaded
   */
  isLoaded(): boolean {
    return this.translationsLoaded$.value;
  }

  /**
   * Get current language
   */
  getCurrentLanguage(): string {
    return this.currentLanguage$.value;
  }

  /**
   * Get translations loaded state as Observable
   */
  getTranslationsLoaded$(): Observable<boolean> {
    return this.translationsLoaded$.asObservable();
  }
}

