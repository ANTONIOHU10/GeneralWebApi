import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type CheckboxSize = 'sm' | 'md' | 'lg';
export type CheckboxVariant = 'default' | 'primary' | 'success' | 'warning' | 'error';

export interface CheckboxConfig {
  size?: CheckboxSize;
  variant?: CheckboxVariant;
  showLabel?: boolean;
  disabled?: boolean;
  required?: boolean;
  indeterminate?: boolean;
}

@Component({
  selector: 'app-base-checkbox',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './base-checkbox.component.html',
  styleUrls: ['./base-checkbox.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BaseCheckboxComponent),
      multi: true
    }
  ]
})
export class BaseCheckboxComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() config: CheckboxConfig = {
    size: 'md',
    variant: 'default',
    showLabel: true,
    disabled: false,
    required: false,
    indeterminate: false
  };

  @Input() size: CheckboxSize = 'md';
  @Input() variant: CheckboxVariant = 'default';
  @Input() showLabel: boolean = true;
  @Input() disabled: boolean = false;
  @Input() required: boolean = false;
  @Input() indeterminate: boolean = false;
  @Input() inputId: string = 'checkbox-input';

  @Output() valueChange = new EventEmitter<boolean>();
  @Output() focus = new EventEmitter<Event>();
  @Output() blur = new EventEmitter<Event>();

  // Internal state
  private _value: boolean = false;
  private _touched: boolean = false;

  // ControlValueAccessor implementation
  private onChange = (value: boolean) => {};
  private onTouched = () => {};

  get value(): boolean {
    return this._value;
  }

  set value(val: boolean) {
    this._value = val;
    this.onChange(val);
    this.valueChange.emit(val);
  }

  get displaySize(): CheckboxSize {
    return this.size || this.config.size || 'md';
  }

  get displayVariant(): CheckboxVariant {
    return this.variant || this.config.variant || 'default';
  }

  get displayShowLabel(): boolean {
    return this.showLabel !== undefined ? this.showLabel : (this.config.showLabel ?? true);
  }

  get displayDisabled(): boolean {
    return this.disabled || this.config.disabled || false;
  }

  get displayRequired(): boolean {
    return this.required || this.config.required || false;
  }

  get displayIndeterminate(): boolean {
    return this.indeterminate || this.config.indeterminate || false;
  }

  get checkboxClass(): string {
    const classes = ['checkbox-wrapper'];
    classes.push(`size-${this.displaySize}`);
    classes.push(`variant-${this.displayVariant}`);
    
    if (this.displayDisabled) {
      classes.push('disabled');
    }
    
    if (this.value) {
      classes.push('checked');
    }
    
    if (this.displayIndeterminate) {
      classes.push('indeterminate');
    }
    
    return classes.join(' ');
  }

  onInputChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.value = target.checked;
    this.markAsTouched();
  }

  onFocus(event: Event) {
    this.focus.emit(event);
  }

  onBlur(event: Event) {
    this.blur.emit(event);
    this.markAsTouched();
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!this.displayDisabled) {
        this.value = !this.value;
        this.markAsTouched();
      }
    }
  }

  private markAsTouched() {
    if (!this._touched) {
      this._touched = true;
      this.onTouched();
    }
  }

  // ControlValueAccessor methods
  writeValue(value: boolean): void {
    this._value = value || false;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
