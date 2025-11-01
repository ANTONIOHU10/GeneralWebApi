// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/base/base-select/base-select.component.ts
import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormsModule,
} from '@angular/forms';

export interface SelectOption {
  value: unknown;
  label: string;
  disabled?: boolean;
  icon?: string;
  group?: string;
}

@Component({
  selector: 'app-base-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './base-select.component.html',
  styleUrls: ['./base-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BaseSelectComponent),
      multi: true,
    },
  ],
})
export class BaseSelectComponent implements ControlValueAccessor, OnInit {
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
  @Input() selectId = `select-liquid-${Math.random().toString(36).slice(2, 11)}`;

  @Output() selectionChange = new EventEmitter<SelectOption | SelectOption[]>();
  @Output() dropdownOpen = new EventEmitter<void>();
  @Output() dropdownClose = new EventEmitter<void>();

  isOpen = false;
  selectedOption: SelectOption | null = null;
  searchQuery = '';
  filteredOptions: SelectOption[] = [];
  groupedOptions: { name: string; options: SelectOption[] }[] = [];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onChange = (_value: unknown) => {
    // ControlValueAccessor implementation
  };
  private onTouched = () => {
    // ControlValueAccessor implementation
  };

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
    const classes = ['select-dropdown', this.isOpen ? 'open' : ''].filter(
      Boolean
    );

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
    this.onTouched();
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

    this.groupedOptions = Array.from(groups.entries()).map(
      ([name, options]) => ({
        name: name === 'Default' ? '' : name,
        options,
      })
    );
  }

  // ControlValueAccessor implementation
  writeValue(value: unknown): void {
    const option = this.options.find(opt => opt.value === value);
    this.selectedOption = option || null;
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
