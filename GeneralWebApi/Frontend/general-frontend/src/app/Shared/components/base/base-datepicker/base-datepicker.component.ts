// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/base/base-datepicker/base-datepicker.component.ts
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
  selector: 'app-base-datepicker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './base-datepicker.component.html',
  styleUrls: ['./base-datepicker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BaseDatepickerComponent),
      multi: true,
    },
  ],
})
export class BaseDatepickerComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = 'Select date';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() variant: 'outlined' | 'filled' | 'underlined' = 'outlined';
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() required = false;
  @Input() prefixIcon = '';
  @Input() minDate = '';
  @Input() maxDate = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() customClass = '';
  @Input() datepickerId = `datepicker-${Math.random().toString(36).slice(2, 11)}`;

  @Output() inputChange = new EventEmitter<string>();
  @Output() inputFocus = new EventEmitter<FocusEvent>();
  @Output() inputBlur = new EventEmitter<FocusEvent>();
  @Output() inputKeydown = new EventEmitter<KeyboardEvent>();

  value = '';
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onChange = (_value: string) => {
    // ControlValueAccessor implementation
  };
  private onTouched = () => {
    // ControlValueAccessor implementation
  };

  get containerClass(): string {
    const classes = [
      'base-datepicker-container',
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
      'datepicker-wrapper',
      this.error ? 'error' : '',
      this.disabled ? 'disabled' : '',
    ].filter(Boolean);

    return classes.join(' ');
  }

  get inputClass(): string {
    const classes = ['base-datepicker'];
    return classes.join(' ');
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

