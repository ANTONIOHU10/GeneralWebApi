// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/base/base-switch/base-switch.component.ts
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
} from '@angular/forms';

@Component({
  selector: 'app-base-switch',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './base-switch.component.html',
  styleUrls: ['./base-switch.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BaseSwitchComponent),
      multi: true,
    },
  ],
})
export class BaseSwitchComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() inlineLabel = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled = false;
  @Input() required = false;
  @Input() hint = '';
  @Input() error = '';
  @Input() customClass = '';
  @Input() switchId = `switch-${Math.random().toString(36).substr(2, 9)}`;

  @Output() valueChange = new EventEmitter<boolean>();

  value = false;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onChange = (_value: boolean) => {
    // ControlValueAccessor implementation
  };
  private onTouched = () => {
    // ControlValueAccessor implementation
  };

  get switchWrapperClass(): string {
    const classes = [
      'switch-wrapper',
      this.disabled ? 'disabled' : '',
    ].filter(Boolean);
    return classes.join(' ');
  }

  get containerClass(): string {
    return `size-${this.size}`;
  }

  onToggle(event: Event): void {
    if (this.disabled) return;

    const target = event.target as HTMLInputElement;
    this.value = target.checked;
    this.onChange(this.value);
    this.onTouched();
    this.valueChange.emit(this.value);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onFocus(_event: Event): void {
    // Handle focus event if needed
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onBlur(_event: Event): void {
    this.onTouched();
  }

  // ControlValueAccessor implementation
  writeValue(value: boolean): void {
    this.value = value || false;
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

