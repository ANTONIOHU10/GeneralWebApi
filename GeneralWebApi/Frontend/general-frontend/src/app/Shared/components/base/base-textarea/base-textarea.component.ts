// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/base/base-textarea/base-textarea.component.ts
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
  selector: 'app-base-textarea',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './base-textarea.component.html',
  styleUrls: ['./base-textarea.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BaseTextareaComponent),
      multi: true,
    },
  ],
})
export class BaseTextareaComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() rows = 4;
  @Input() maxLength: number | null = null;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() variant: 'outlined' | 'filled' | 'underlined' = 'outlined';
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() required = false;
  @Input() showCounter = false;
  @Input() hint = '';
  @Input() error = '';
  @Input() customClass = '';
  @Input() textareaId = `textarea-${Math.random().toString(36).slice(2, 11)}`;

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
      'base-textarea-container',
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
      'textarea-wrapper',
      this.error ? 'error' : '',
      this.disabled ? 'disabled' : '',
    ].filter(Boolean);

    return classes.join(' ');
  }

  readonly textareaClass = 'base-textarea';

  onInput(value: string): void {
    if (this.maxLength && value.length > this.maxLength) {
      return;
    }

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

