// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/base/base-input/base-input.component.ts
import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-base-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="base-input-container" [class]="containerClass">
      <label *ngIf="label" class="input-label" [for]="inputId">
        {{ label }}
        <span *ngIf="required" class="required-asterisk">*</span>
      </label>
      
      <div class="input-wrapper" [class]="wrapperClass">
        <span *ngIf="prefixIcon" class="input-icon prefix-icon material-icons">
          {{ prefixIcon }}
        </span>
        
        <input
          [id]="inputId"
          [type]="type"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [ngModel]="value"
          [class]="inputClass"
          (ngModelChange)="onInput($event)"
          (blur)="onBlur()"
          (focus)="onFocus()"
          (keydown)="onKeydown($event)"
        />
        
        <span *ngIf="suffixIcon" class="input-icon suffix-icon material-icons">
          {{ suffixIcon }}
        </span>
        
        <button 
          *ngIf="clearable && value" 
          type="button" 
          class="clear-button"
          (click)="onClear()"
          [attr.aria-label]="'Clear input'"
        >
          <span class="material-icons">close</span>
        </button>
      </div>
      
      <div *ngIf="hint && !error" class="input-hint">
        {{ hint }}
      </div>
      
      <div *ngIf="error" class="input-error">
        <span class="material-icons">error</span>
        {{ error }}
      </div>
    </div>
  `,
  styles: [
    `
      .base-input-container {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        width: 100%;
      }

      .input-label {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--text-primary);
        display: flex;
        align-items: center;
        gap: 0.25rem;
        transition: color 0.3s ease;
      }

      .required-asterisk {
        color: var(--color-error);
        font-weight: 600;
      }

      .input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        background: var(--input-bg);
        border: 1px solid var(--border-primary);
        border-radius: var(--border-radius-base);
        transition: all 0.3s ease;
        overflow: hidden;

        &:focus-within {
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3px rgba(var(--color-primary-500), 0.1);
        }

        &.error {
          border-color: var(--border-error);
          box-shadow: 0 0 0 3px rgba(var(--color-error), 0.1);
        }

        &.disabled {
          background: var(--bg-tertiary);
          border-color: var(--border-secondary);
          cursor: not-allowed;
        }
      }

      .input-icon {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        font-size: 1.2rem;
        color: var(--text-tertiary);
        transition: color 0.3s ease;
        z-index: 1;

        &.prefix-icon {
          left: 0.75rem;
        }

        &.suffix-icon {
          right: 0.75rem;
        }
      }

      input {
        flex: 1;
        border: none;
        outline: none;
        background: transparent;
        padding: 0.75rem;
        font-size: 0.95rem;
        color: var(--text-primary);
        transition: all 0.3s ease;
        width: 100%;

        &::placeholder {
          color: var(--text-tertiary);
        }

        &:disabled {
          color: var(--text-disabled);
          cursor: not-allowed;
        }

        &:read-only {
          cursor: default;
        }
      }

      .clear-button {
        position: absolute;
        right: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-tertiary);
        transition: all 0.2s ease;
        z-index: 1;

        &:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .material-icons {
          font-size: 1rem;
        }
      }

      .input-hint {
        font-size: 0.8rem;
        color: var(--text-tertiary);
        display: flex;
        align-items: center;
        gap: 0.25rem;
        transition: color 0.3s ease;
      }

      .input-error {
        font-size: 0.8rem;
        color: var(--color-error);
        display: flex;
        align-items: center;
        gap: 0.25rem;
        transition: color 0.3s ease;

        .material-icons {
          font-size: 1rem;
        }
      }

      /* Input sizes */
      .base-input-container.small {
        .input-wrapper {
          input {
            padding: 0.5rem 0.75rem;
            font-size: 0.85rem;
          }

          .input-icon {
            font-size: 1rem;
          }
        }
      }

      .base-input-container.large {
        .input-wrapper {
          input {
            padding: 1rem 1.25rem;
            font-size: 1.1rem;
          }

          .input-icon {
            font-size: 1.4rem;
          }
        }
      }

      /* Input variants */
      .base-input-container.outlined .input-wrapper {
        background: transparent;
        border: 2px solid var(--border-primary);
      }

      .base-input-container.filled .input-wrapper {
        background: var(--bg-secondary);
        border: 1px solid transparent;
      }

      .base-input-container.underlined .input-wrapper {
        background: transparent;
        border: none;
        border-bottom: 2px solid var(--border-primary);
        border-radius: 0;
      }

      @media (max-width: 768px) {
        .input-wrapper {
          input {
            padding: 0.75rem;
            font-size: 0.9rem;
          }
        }
      }
    `,
  ],
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
  @Input() type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' = 'text';
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
  @Input() inputId = '';

  @Output() inputChange = new EventEmitter<string>();
  @Output() inputFocus = new EventEmitter<FocusEvent>();
  @Output() inputBlur = new EventEmitter<FocusEvent>();
  @Output() inputKeydown = new EventEmitter<KeyboardEvent>();
  @Output() inputClear = new EventEmitter<void>();

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
      this.suffixIcon || this.clearable ? 'with-suffix' : '',
    ].filter(Boolean);

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

  onClear(): void {
    this.value = '';
    this.onChange(this.value);
    this.inputClear.emit();
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

