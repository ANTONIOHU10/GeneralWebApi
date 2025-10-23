import { Component, EventEmitter, Input, Output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface SearchConfig {
  placeholder?: string;
  debounceTime?: number;
  minLength?: number;
  showClearButton?: boolean;
  showSearchButton?: boolean;
  disabled?: boolean;
}

@Component({
  selector: 'app-base-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './base-search.component.html',
  styleUrls: ['./base-search.component.scss']
})
export class BaseSearchComponent implements OnInit {
  @Input() config: SearchConfig = {
    placeholder: 'Search...',
    debounceTime: 300,
    minLength: 1,
    showClearButton: true,
    showSearchButton: true,
    disabled: false
  };

  @Input() value= '';
  @Input() inputId= 'search-input';

  @Output() searchChange = new EventEmitter<string>();
  @Output() searchSubmit = new EventEmitter<string>();
  @Output() searchClear = new EventEmitter<void>();

  // Internal state
  internalValue = signal('');
  isFocused = signal(false);
  private debounceTimer: number | null = null;

  ngOnInit() {
    this.internalValue.set(this.value);
  }

  onInput(value: string) {
    this.internalValue.set(value);
    this.value = value;

    // Clear existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Set new timer for debounced search
    this.debounceTimer = window.setTimeout(() => {
      if (value.length >= (this.config.minLength || 1)) {
        this.searchChange.emit(value);
      } else if (value.length === 0) {
        this.searchChange.emit('');
      }
    }, this.config.debounceTime || 300);
  }

  onSearch() {
    const value = this.internalValue();
    if (value.length >= (this.config.minLength || 1)) {
      this.searchSubmit.emit(value);
    }
  }

  onClear() {
    this.internalValue.set('');
    this.value = '';
    this.searchClear.emit();
    this.searchChange.emit('');
  }

  onFocus() {
    this.isFocused.set(true);
  }

  onBlur() {
    this.isFocused.set(false);
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.onSearch();
    } else if (event.key === 'Escape') {
      this.onClear();
    }
  }

  get hasValue(): boolean {
    return this.internalValue().length > 0;
  }

  get canSearch(): boolean {
    return this.internalValue().length >= (this.config.minLength || 1);
  }
}

