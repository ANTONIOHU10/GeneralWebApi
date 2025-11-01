// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/base/base-radio/base-radio.component.ts
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

export interface RadioOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  id?: string;
}

export interface RadioConfig {
  size?: 'sm' | 'md' | 'lg';
  layout?: 'vertical' | 'horizontal';
  showLabel?: boolean;
}

@Component({
  selector: 'app-base-radio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './base-radio.component.html',
  styleUrls: ['./base-radio.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BaseRadioComponent),
      multi: true,
    },
  ],
})
export class BaseRadioComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() name = 'radio-group';
  @Input() options: RadioOption[] = [];
  @Input() config: RadioConfig = {
    size: 'md',
    layout: 'vertical',
    showLabel: true,
  };
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() layout: 'vertical' | 'horizontal' = 'vertical';
  @Input() showLabel = true;
  @Input() disabled = false;
  @Input() hint = '';
  @Input() error = '';
  @Input() customClass = '';

  @Output() selectionChange = new EventEmitter<string | number>();

  value: string | number | null = null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onChange = (_value: string | number) => {
    // ControlValueAccessor implementation
  };
  private onTouched = () => {
    // ControlValueAccessor implementation
  };

  get radioGroupClass(): string {
    const classes = ['radio-group', this.customClass].filter(Boolean);
    return classes.join(' ');
  }

  get displayShowLabel(): boolean {
    return this.showLabel !== undefined
      ? this.showLabel
      : (this.config.showLabel ?? true);
  }

  getRadioClass(option: RadioOption): string {
    const classes = [
      'radio-wrapper',
      `size-${this.size || this.config.size || 'md'}`,
      `layout-${this.layout || this.config.layout || 'vertical'}`,
      option.disabled ? 'disabled' : '',
    ].filter(Boolean);
    return classes.join(' ');
  }

  onRadioChange(option: RadioOption): void {
    if (option.disabled) return;

    this.value = option.value;
    this.onChange(this.value!);
    this.onTouched();
    this.selectionChange.emit(this.value);
  }

  // ControlValueAccessor implementation
  writeValue(value: string | number | null): void {
    this.value = value;
  }

  registerOnChange(fn: (value: string | number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}

