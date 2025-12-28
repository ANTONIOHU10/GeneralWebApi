// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/base/base-input/base-input.component.ts
import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-base-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './base-input.component.html',
  styleUrls: ['./base-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BaseInputComponent),
      multi: true,
    },
  ],
})
export class BaseInputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() type:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'tel'
    | 'url'
    | 'date'
    | 'datetime-local'
    | 'time' = 'text';
  @Input() step: string | number = '';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() variant: 'outlined' | 'filled' | 'underlined' = 'outlined';
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() required = false;
  @Input() clearable = false;
  @Input() prefixIcon = '';
  @Input() suffixIcon = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() customClass = '';
  @Input() inputId = `input-${Math.random().toString(36).slice(2, 11)}`;
  @Input() autocomplete = '';

  @Output() inputChange = new EventEmitter<string>();
  @Output() inputFocus = new EventEmitter<FocusEvent>();
  @Output() inputBlur = new EventEmitter<FocusEvent>();
  @Output() inputKeydown = new EventEmitter<KeyboardEvent>();
  @Output() inputClear = new EventEmitter<void>();

  value = '';
  showPassword = false; // Track password visibility state
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onChange = (_value: string) => {
    // ControlValueAccessor implementation
  };
  private onTouched = () => {
    // ControlValueAccessor implementation
  };

  get containerClass(): string {
    const classes = [
      'base-input-container',
      this.size !== 'medium' ? this.size : '',
      this.variant,
      this.error ? 'error' : '',
      this.disabled ? 'disabled' : '',
      this.customClass,
    ].filter(Boolean);

    return classes.join(' ');
  }

  get wrapperClass(): string {
    const classes = [
      'input-wrapper',
      this.error ? 'error' : '',
      this.disabled ? 'disabled' : '',
    ].filter(Boolean);

    return classes.join(' ');
  }

  get inputClass(): string {
    const classes = [
      'base-input',
      this.prefixIcon ? 'with-prefix' : '',
      this.suffixIcon || (this.clearable && !this.isPasswordType) || this.isPasswordType ? 'with-suffix' : '',
    ].filter(Boolean);

    return classes.join(' ');
  }

  get isPasswordType(): boolean {
    return this.type === 'password';
  }

  get actualInputType(): string {
    // If it's a password field and showPassword is true, show as text
    if (this.isPasswordType && this.showPassword) {
      return 'text';
    }
    return this.type;
  }

  get passwordToggleIcon(): string {
    return this.showPassword ? 'visibility_off' : 'visibility';
  }

  get autocompleteValue(): string {
    if (this.autocomplete) return this.autocomplete;
    
    // Default autocomplete based on type
    switch (this.type) {
      case 'password':
        return 'current-password';
      case 'email':
        return 'email';
      case 'tel':
        return 'tel';
      case 'url':
        return 'url';
      default:
        return 'off';
    }
  }

  onInput(value: string): void {
    this.value = value;
    this.onChange(this.value);
    this.inputChange.emit(this.value);
  }

  onFocus(event?: FocusEvent): void {
    this.inputFocus.emit(event);
  }

  onBlur(event?: FocusEvent): void {
    this.onTouched();
    this.inputBlur.emit(event);
  }

  onKeydown(event: KeyboardEvent): void {
    this.inputKeydown.emit(event);
  }

  onClear(): void {
    this.value = '';
    this.onChange(this.value);
    this.inputClear.emit();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
