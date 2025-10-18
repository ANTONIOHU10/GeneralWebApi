// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/base/base-select/base-select.component.ts
import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

export interface SelectOption {
  value: any;
  label: string;
  disabled?: boolean;
  icon?: string;
  group?: string;
}

@Component({
  selector: 'app-base-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="base-select-container" [class]="containerClass">
      <label *ngIf="label" class="select-label" [for]="selectId">
        {{ label }}
        <span *ngIf="required" class="required-asterisk">*</span>
      </label>
      
      <div class="select-wrapper" [class]="wrapperClass" (click)="toggleDropdown()">
        <div class="select-display">
          <span *ngIf="selectedOption?.icon" class="option-icon material-icons">
            {{ selectedOption?.icon }}
          </span>
          <span class="select-text">
            {{ selectedOption?.label || placeholder }}
          </span>
        </div>
        
        <span class="select-arrow material-icons" [class.rotated]="isOpen">
          keyboard_arrow_down
        </span>
      </div>
      
      <div class="select-dropdown" [class]="dropdownClass" *ngIf="isOpen">
        <div class="dropdown-search" *ngIf="searchable">
          <input
            type="text"
            placeholder="Search..."
            [(ngModel)]="searchQuery"
            (input)="onSearchChange()"
            class="search-input"
          />
        </div>
        
        <div class="dropdown-content">
          <div *ngFor="let group of groupedOptions" class="option-group">
            <div *ngIf="group.name" class="group-header">{{ group.name }}</div>
            <div
              *ngFor="let option of group.options"
              class="select-option"
              [class.selected]="isSelected(option)"
              [class.disabled]="option.disabled"
              (click)="selectOption(option)"
            >
              <span *ngIf="option.icon" class="option-icon material-icons">
                {{ option.icon }}
              </span>
              <span class="option-label">{{ option.label }}</span>
              <span *ngIf="isSelected(option)" class="check-icon material-icons">
                check
              </span>
            </div>
          </div>
          
          <div *ngIf="filteredOptions.length === 0" class="no-options">
            No options found
          </div>
        </div>
      </div>
      
      <div *ngIf="hint && !error" class="select-hint">
        {{ hint }}
      </div>
      
      <div *ngIf="error" class="select-error">
        <span class="material-icons">error</span>
        {{ error }}
      </div>
    </div>
  `,
  styles: [
    `
      .base-select-container {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        width: 100%;
      }

      .select-label {
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

      .select-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: var(--input-bg);
        border: 1px solid var(--border-primary);
        border-radius: var(--border-radius-base);
        padding: 0.75rem;
        cursor: pointer;
        transition: all 0.3s ease;
        min-height: 40px;

        &:hover {
          border-color: var(--border-focus);
        }

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

      .select-display {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex: 1;
        color: var(--text-primary);
        font-size: 0.95rem;
      }

      .option-icon {
        font-size: 1.2rem;
        color: var(--text-tertiary);
      }

      .select-text {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .select-arrow {
        font-size: 1.2rem;
        color: var(--text-tertiary);
        transition: transform 0.3s ease;

        &.rotated {
          transform: rotate(180deg);
        }
      }

      .select-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--bg-surface);
        border: 1px solid var(--border-primary);
        border-radius: var(--border-radius-base);
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        max-height: 300px;
        overflow: hidden;
        margin-top: 0.25rem;
      }

      .dropdown-search {
        padding: 0.75rem;
        border-bottom: 1px solid var(--border-primary);

        .search-input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid var(--border-primary);
          border-radius: var(--border-radius-sm);
          background: var(--input-bg);
          color: var(--text-primary);
          font-size: 0.875rem;

          &:focus {
            outline: none;
            border-color: var(--border-focus);
          }
        }
      }

      .dropdown-content {
        max-height: 200px;
        overflow-y: auto;
      }

      .option-group {
        .group-header {
          padding: 0.5rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-primary);
        }
      }

      .select-option {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem;
        cursor: pointer;
        transition: all 0.2s ease;
        color: var(--text-primary);

        &:hover:not(.disabled) {
          background: var(--bg-secondary);
        }

        &.selected {
          background: var(--color-primary-50);
          color: var(--color-primary-700);
          font-weight: 500;
        }

        &.disabled {
          color: var(--text-disabled);
          cursor: not-allowed;
        }

        .option-icon {
          font-size: 1.2rem;
          color: var(--text-tertiary);
        }

        .option-label {
          flex: 1;
        }

        .check-icon {
          font-size: 1rem;
          color: var(--color-primary-500);
        }
      }

      .no-options {
        padding: 1rem;
        text-align: center;
        color: var(--text-tertiary);
        font-size: 0.875rem;
      }

      .select-hint {
        font-size: 0.8rem;
        color: var(--text-tertiary);
        display: flex;
        align-items: center;
        gap: 0.25rem;
        transition: color 0.3s ease;
      }

      .select-error {
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

      /* Select sizes */
      .base-select-container.small {
        .select-wrapper {
          padding: 0.5rem 0.75rem;
          min-height: 32px;
        }

        .select-display {
          font-size: 0.85rem;
        }
      }

      .base-select-container.large {
        .select-wrapper {
          padding: 1rem 1.25rem;
          min-height: 48px;
        }

        .select-display {
          font-size: 1.1rem;
        }
      }

      @media (max-width: 768px) {
        .select-dropdown {
          max-height: 250px;
        }
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BaseSelectComponent),
      multi: true,
    },
  ],
})
export class BaseSelectComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = 'Select an option';
  @Input() options: SelectOption[] = [];
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() disabled = false;
  @Input() required = false;
  @Input() searchable = false;
  @Input() multiple = false;
  @Input() hint = '';
  @Input() error = '';
  @Input() customClass = '';
  @Input() selectId = '';

  @Output() selectionChange = new EventEmitter<SelectOption | SelectOption[]>();
  @Output() dropdownOpen = new EventEmitter<void>();
  @Output() dropdownClose = new EventEmitter<void>();

  isOpen = false;
  selectedOption: SelectOption | null = null;
  searchQuery = '';
  filteredOptions: SelectOption[] = [];
  groupedOptions: { name: string; options: SelectOption[] }[] = [];

  private onChange = (value: any) => {};
  private onTouched = () => {};

  get containerClass(): string {
    const classes = [
      'base-select-container',
      this.size !== 'medium' ? this.size : '',
      this.error ? 'error' : '',
      this.disabled ? 'disabled' : '',
      this.customClass,
    ].filter(Boolean);

    return classes.join(' ');
  }

  get wrapperClass(): string {
    const classes = [
      'select-wrapper',
      this.error ? 'error' : '',
      this.disabled ? 'disabled' : '',
    ].filter(Boolean);

    return classes.join(' ');
  }

  get dropdownClass(): string {
    const classes = [
      'select-dropdown',
      this.isOpen ? 'open' : '',
    ].filter(Boolean);

    return classes.join(' ');
  }

  ngOnInit(): void {
    this.updateFilteredOptions();
  }

  toggleDropdown(): void {
    if (this.disabled) return;

    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.dropdownOpen.emit();
    } else {
      this.dropdownClose.emit();
    }
  }

  selectOption(option: SelectOption): void {
    if (option.disabled) return;

    this.selectedOption = option;
    this.onChange(option.value);
    this.selectionChange.emit(option);
    this.isOpen = false;
    this.dropdownClose.emit();
  }

  isSelected(option: SelectOption): boolean {
    return this.selectedOption?.value === option.value;
  }

  onSearchChange(): void {
    this.updateFilteredOptions();
  }

  private updateFilteredOptions(): void {
    let filtered = this.options;

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = this.options.filter(option =>
        option.label.toLowerCase().includes(query)
      );
    }

    this.filteredOptions = filtered;
    this.groupOptions();
  }

  private groupOptions(): void {
    const groups = new Map<string, SelectOption[]>();

    this.filteredOptions.forEach(option => {
      const groupName = option.group || 'Default';
      if (!groups.has(groupName)) {
        groups.set(groupName, []);
      }
      const group = groups.get(groupName);
      if (group) {
        group.push(option);
      }
    });

    this.groupedOptions = Array.from(groups.entries()).map(([name, options]) => ({
      name: name === 'Default' ? '' : name,
      options,
    }));
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    const option = this.options.find(opt => opt.value === value);
    this.selectedOption = option || null;
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
