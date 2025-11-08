// Path: GeneralWebApi/Frontend/general-frontend/src/app/Shared/services/storage.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

type StorageType = 'localStorage' | 'sessionStorage';

export interface StorageChangeEvent<T = unknown> {
  key: string;
  oldValue: T | null;
  newValue: T | null;
  storageType: StorageType;
}

/**
 * StorageService - Centralized storage management service
 * 
 * Purpose: Provides type-safe, reactive storage operations for localStorage and sessionStorage
 * - Type-safe storage operations with automatic JSON serialization/deserialization
 * - Reactive Observable streams for storage changes (Angular best practice)
 * - Support for expiration-based storage
 * - Comprehensive error handling
 * - Unified API for both localStorage and sessionStorage
 * 
 * Usage:
 * - Basic operations: getItem<T>(), setItem<T>(), removeItem()
 * - Reactive watching: watchItem<T>(key) returns Observable that emits on changes
 * - Expiration support: setItemWithExpiration(), getItemWithExpiration()
 * - Session storage: getSessionItem<T>(), setSessionItem<T>()
 */
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  // Storage change events stream
  private readonly storageChangeSubject = new BehaviorSubject<StorageChangeEvent | null>(null);
  public readonly storageChange$: Observable<StorageChangeEvent> = this.storageChangeSubject.asObservable().pipe(
    map(event => event!),
    distinctUntilChanged()
  );

  // Track watched keys for reactive updates
  private readonly watchedKeys = new Map<string, BehaviorSubject<unknown>>();

  constructor() {
    // Listen to storage events from other tabs/windows
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event: StorageEvent) => {
        this.handleStorageEvent(event);
      });
    }
  }
  /**
   * Get item from localStorage with type safety
   * @param key Storage key
   * @returns Parsed value or null if not found/error
   */
  getItem<T = unknown>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return null;
      }
      const parsed = JSON.parse(item) as T;
      
      // Notify watchers
      this.notifyWatchers(key, parsed, 'localStorage');
      
      return parsed;
    } catch (error) {
      console.error(`Error getting item from localStorage: ${key}`, error);
      return null;
    }
  }

  /**
   * Set item to localStorage with type safety
   * @param key Storage key
   * @param value Value to store (will be JSON stringified)
   * @returns true if successful, false otherwise
   */
  setItem<T = unknown>(key: string, value: T): boolean {
    try {
      const oldValue = this.getItem(key);
      localStorage.setItem(key, JSON.stringify(value));
      
      // Emit storage change event
      this.emitStorageChange(key, oldValue, value, 'localStorage');
      
      // Notify watchers
      this.notifyWatchers(key, value, 'localStorage');
      
      return true;
    } catch (error) {
      console.error(`Error setting item to localStorage: ${key}`, error);
      return false;
    }
  }

  /**
   * Remove item from localStorage
   * @param key Storage key to remove
   */
  removeItem(key: string): void {
    try {
      const oldValue = this.getItem(key);
      localStorage.removeItem(key);
      
      // Emit storage change event
      this.emitStorageChange(key, oldValue, null, 'localStorage');
      
      // Notify watchers
      this.notifyWatchers(key, null, 'localStorage');
    } catch (error) {
      console.error(`Error removing item from localStorage: ${key}`, error);
    }
  }

  /**
   * Clear all items from localStorage
   */
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage', error);
    }
  }

  /**
   * Check if key exists in localStorage
   */
  hasItem(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  /**
   * Get all keys from localStorage
   */
  getKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        keys.push(key);
      }
    }
    return keys;
  }

  /**
   * Get item from sessionStorage
   */
  getSessionItem<T = any>(key: string): T | null {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting item from sessionStorage: ${key}`, error);
      return null;
    }
  }

  /**
   * Set item to sessionStorage
   */
  setSessionItem<T = any>(key: string, value: T): boolean {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting item to sessionStorage: ${key}`, error);
      return false;
    }
  }

  /**
   * Remove item from sessionStorage
   */
  removeSessionItem(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item from sessionStorage: ${key}`, error);
    }
  }

  /**
   * Clear all items from sessionStorage
   */
  clearSession(): void {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('Error clearing sessionStorage', error);
    }
  }

  /**
   * Check if key exists in sessionStorage
   */
  hasSessionItem(key: string): boolean {
    return sessionStorage.getItem(key) !== null;
  }

  /**
   * Generic method to get item from specified storage
   */
  private getItemFromStorage<T = any>(
    key: string,
    storageType: StorageType
  ): T | null {
    try {
      const storage =
        storageType === 'localStorage' ? localStorage : sessionStorage;
      const item = storage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting item from ${storageType}: ${key}`, error);
      return null;
    }
  }

  /**
   * Generic method to set item to specified storage
   */
  private setItemToStorage<T = any>(
    key: string,
    value: T,
    storageType: StorageType
  ): boolean {
    try {
      const storage =
        storageType === 'localStorage' ? localStorage : sessionStorage;
      storage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting item to ${storageType}: ${key}`, error);
      return false;
    }
  }

  /**
   * Get item with expiration check
   * @param key Storage key
   * @param expirationKey Key for expiration timestamp (default: `${key}_expires`)
   */
  getItemWithExpiration<T = any>(
    key: string,
    expirationKey?: string
  ): T | null {
    const expKey = expirationKey || `${key}_expires`;
    const expiration = this.getItem<number>(expKey);

    if (expiration && Date.now() > expiration) {
      // Item expired, remove it
      this.removeItem(key);
      this.removeItem(expKey);
      return null;
    }

    return this.getItem<T>(key);
  }

  /**
   * Set item with expiration
   * @param key Storage key
   * @param value Value to store
   * @param expirationMs Expiration time in milliseconds
   * @returns true if successful, false otherwise
   */
  setItemWithExpiration<T = unknown>(
    key: string,
    value: T,
    expirationMs: number
  ): boolean {
    const expiration = Date.now() + expirationMs;
    const expirationKey = `${key}_expires`;

    const success = this.setItem(key, value);
    if (success) {
      this.setItem(expirationKey, expiration);
    }

    return success;
  }

  /**
   * Watch a storage key for changes (reactive)
   * Returns an Observable that emits whenever the key's value changes
   * 
   * @param key Storage key to watch
   * @param storageType Type of storage to watch
   * @returns Observable that emits the current value and updates on changes
   * 
   * @example
   * ```typescript
   * // In component
   * this.storageService.watchItem<User>('currentUser')
   *   .pipe(takeUntil(this.destroy$))
   *   .subscribe(user => {
   *     this.currentUser = user;
   *   });
   * ```
   */
  watchItem<T = unknown>(key: string, storageType: StorageType = 'localStorage'): Observable<T | null> {
    if (!this.watchedKeys.has(key)) {
      const initialValue = storageType === 'localStorage' 
        ? this.getItem<T>(key)
        : this.getSessionItem<T>(key);
      
      const subject = new BehaviorSubject<T | null>(initialValue);
      this.watchedKeys.set(key, subject as BehaviorSubject<unknown>);
    }

    return (this.watchedKeys.get(key)! as BehaviorSubject<T | null>).asObservable().pipe(
      distinctUntilChanged()
    );
  }

  /**
   * Handle storage events from other tabs/windows
   */
  private handleStorageEvent(event: StorageEvent): void {
    if (!event.key) return;

    const oldValue = event.oldValue ? JSON.parse(event.oldValue) : null;
    const newValue = event.newValue ? JSON.parse(event.newValue) : null;
    const storageType = event.storageArea === localStorage ? 'localStorage' : 'sessionStorage';

    this.emitStorageChange(event.key, oldValue, newValue, storageType);
    this.notifyWatchers(event.key, newValue, storageType);
  }

  /**
   * Emit storage change event
   */
  private emitStorageChange<T = unknown>(
    key: string,
    oldValue: T | null,
    newValue: T | null,
    storageType: StorageType
  ): void {
    this.storageChangeSubject.next({
      key,
      oldValue,
      newValue,
      storageType,
    });
  }

  /**
   * Notify watchers of a key change
   */
  private notifyWatchers<T = unknown>(key: string, value: T | null, storageType: StorageType): void {
    const watcher = this.watchedKeys.get(key);
    if (watcher) {
      watcher.next(value);
    }
  }

  /**
   * Stop watching a key (cleanup)
   */
  unwatchItem(key: string): void {
    const watcher = this.watchedKeys.get(key);
    if (watcher) {
      watcher.complete();
      this.watchedKeys.delete(key);
    }
  }
}

