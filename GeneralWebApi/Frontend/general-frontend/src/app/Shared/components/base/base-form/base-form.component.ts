// Path: GeneralWebApi/Frontend/general-frontend/src/app/Shared/components/base/base-form/base-form.component.ts
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  BaseInputComponent,
  BaseSelectComponent,
  BaseTextareaComponent,
  BaseCheckboxComponent,
  BaseRadioComponent,
  BaseDatepickerComponent,
  BaseButtonComponent,
  BaseSwitchComponent,
  SelectOption,
  RadioOption,
} from '../index';
// Direct import to avoid circular dependency issues
import { BaseLoadingComponent } from '../base-loading/base-loading.component';

/**
 * Form field type definitions
 */
export type FormFieldType =
  | 'input'
  | 'select'
  | 'textarea'
  | 'checkbox'
  | 'radio'
  | 'datepicker'
  | 'switch'
  | 'number';

/**
 * Form field configuration interface
 */
export interface FormField {
  // Field identification
  key: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  hint?: string;
  error?: string;

  // Field properties
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  hidden?: boolean;

  // Layout properties
  colSpan?: number; // Grid column span (1-12)
  section?: string; // Section/group name
  order?: number; // Display order within section

  // Type-specific properties
  // For input/textarea
  inputType?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number';
  min?: number;
  max?: number;
  step?: number;
  maxLength?: number;
  prefixIcon?: string;
  suffixIcon?: string;
  clearable?: boolean;

  // For select
  options?: SelectOption[];
  searchable?: boolean;
  multiple?: boolean;

  // For radio
  radioOptions?: RadioOption[];

  // For textarea
  rows?: number;

  // Custom validation
  validator?: (value: unknown) => string | null; // Returns error message or null (for backward compatibility)
  validators?: ValidatorFn[]; // Angular validators (preferred)
  customClass?: string;
}

/**
 * Form section configuration
 */
export interface FormSection {
  title: string;
  description?: string;
  collapsible?: boolean;
  collapsed?: boolean;
  order?: number;
}

/**
 * Form layout configuration
 */
export interface FormLayoutConfig {
  columns?: number; // Number of columns in grid (default: 2)
  gap?: string; // Gap between fields (default: '1.5rem')
  sectionGap?: string; // Gap between sections (default: '2rem')
  labelPosition?: 'top' | 'left'; // Label position (default: 'top')
  showSectionDividers?: boolean; // Show dividers between sections (default: true)
}

/**
 * Form button configuration
 */
export interface FormButton {
  label: string;
  type: 'submit' | 'button' | 'reset';
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline' | 'ghost';
  icon?: string;
  disabled?: boolean;
  customClass?: string;
}

/**
 * Complete form configuration
 */
export interface FormConfig {
  fields: FormField[];
  sections?: FormSection[];
  layout?: FormLayoutConfig;
  buttons?: FormButton[];
  showButtons?: boolean; // Show default submit/cancel buttons if no custom buttons
  submitButtonText?: string;
  cancelButtonText?: string;
  submitButtonVariant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  cancelButtonVariant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline' | 'ghost';
}

@Component({
  selector: 'app-base-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BaseInputComponent,
    BaseSelectComponent,
    BaseTextareaComponent,
    BaseCheckboxComponent,
    BaseRadioComponent,
    BaseDatepickerComponent,
    BaseButtonComponent,
    BaseSwitchComponent,
    BaseLoadingComponent,
  ],
  templateUrl: './base-form.component.html',
  styleUrls: ['./base-form.component.scss'],
})
export class BaseFormComponent implements OnInit, OnChanges, OnDestroy {
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  @Input() config!: FormConfig;
  @Input() formData: Record<string, unknown> = {};
  @Input() loading = false;
  @Input() fieldLoading: Record<string, boolean> = {}; // Field-specific loading states

  @Output() formSubmit = new EventEmitter<Record<string, unknown>>();
  @Output() formCancel = new EventEmitter<void>();
  @Output() fieldChange = new EventEmitter<{ key: string; value: unknown }>();
  @Output() formValid = new EventEmitter<boolean>();
  @Output() fieldDropdownOpen = new EventEmitter<{ key: string }>();

  // Reactive Form
  form!: FormGroup;
  
  // Internal state
  sections: FormSection[] = [];
  fieldsBySection: Record<string, FormField[]> = {};

  // Layout configuration
  layout: FormLayoutConfig = {
    columns: 2,
    gap: '1.5rem',
    sectionGap: '2rem',
    labelPosition: 'top',
    showSectionDividers: true,
  };

  ngOnInit(): void {
    this.initializeForm();
  }

  // 这个钩子 初始化第一次接受父组件传递的配置，然后当父组件传递的配置发生变化时，重新初始化表单
  ngOnChanges(changes: SimpleChanges): void {
    // Only reinitialize if config reference changes (not if fields are updated)
    // This prevents reinitialization when options are dynamically updated
    if (changes['config'] && this.config && changes['config'].firstChange) {
      this.initializeForm();
    } else if (changes['formData'] && this.form && this.formData) {
      // Update form values when formData changes
      this.updateFormValues(this.formData);
    }
    
    // Update disabled state when loading or config changes
    if ((changes['loading'] || changes['config']) && this.form) {
      this.updateDisabledState();
    }
  }

  /**
   * Update disabled state of form controls based on loading state
   */
  private updateDisabledState(): void {
    if (!this.form || !this.config) return;

    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      const field = this.config.fields.find(f => f.key === key);
      
      if (control && field) {
        const shouldDisable = field.disabled || this.loading;
        if (shouldDisable && !control.disabled) {
          control.disable();
        } else if (!shouldDisable && control.disabled && !field.readonly) {
          control.enable();
        }
      }
    });
  }

  /**
   * Update form values from external formData
   */
  private updateFormValues(data: Record<string, unknown>): void {
    Object.keys(data).forEach(key => {
      const control = this.form.get(key);
      if (control && control.value !== data[key]) {
        control.setValue(data[key], { emitEvent: false });
      }
    });
  }

  /**
   * Initialize form with configuration
   */
  private initializeForm(): void {
    if (!this.config) return;

    // Merge layout config
    this.layout = { ...this.layout, ...this.config.layout };

    // Build FormGroup from config
    this.buildFormGroup();

    // Initialize sections
    this.initializeSections();

    // Group fields by section
    this.groupFieldsBySection();

    // Subscribe to form value changes
    this.subscribeToFormChanges();
  }

  /**
   * Build FormGroup from field configuration
   */
  private buildFormGroup(): void {
    const formControls: Record<string, FormControl> = {};

    this.config.fields.forEach(field => {
      if (field.hidden) return;

      // Get initial value from formData or field default
      const initialValue = this.formData[field.key] ?? this.getDefaultValue(field);

      // Build validators array
      const validators: ValidatorFn[] = [];

      // Add required validator
      if (field.required) {
        validators.push(Validators.required);
      }

      // Add Angular validators if provided
      if (field.validators && field.validators.length > 0) {
        validators.push(...field.validators);
      }

      // Convert custom validator function to ValidatorFn if provided
      if (field.validator) {
        validators.push(this.createValidatorFromFunction(field.validator));
      }

      // Add type-specific validators
      if (field.inputType === 'email') {
        validators.push(Validators.email);
      }

      if (field.maxLength) {
        validators.push(Validators.maxLength(field.maxLength));
      }

      if (field.min !== undefined) {
        validators.push(Validators.min(field.min));
      }

      if (field.max !== undefined) {
        validators.push(Validators.max(field.max));
      }

      // Create FormControl
      // Note: readonly fields should not be disabled in Reactive Forms
      // Instead, we'll handle readonly state in the template
      const control = new FormControl(
        {
          value: initialValue,
          disabled: field.disabled || false,
        },
        validators.length > 0 ? validators : null
      );

      formControls[field.key] = control;
    });

    // Create FormGroup
    this.form = this.fb.group(formControls);
  }

  /**
   * Get default value for a field based on its type
   */
  private getDefaultValue(field: FormField): unknown {
    switch (field.type) {
      case 'checkbox':
      case 'switch':
        return false;
      case 'number':
        return null;
      case 'select':
        return field.multiple ? [] : null;
      default:
        return '';
    }
  }

  /**
   * Convert custom validator function to Angular ValidatorFn
   */
  private createValidatorFromFunction(
    validatorFn: (value: unknown) => string | null
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const error = validatorFn(control.value);
      return error ? { custom: { message: error } } : null;
    };
  }

  /**
   * Subscribe to form value changes and validity changes
   */
  private subscribeToFormChanges(): void {
    if (!this.form) return;

    // Subscribe to form value changes, it will emit the value of the form when it changes
    // every field will be emitted, not only the changed field
    this.form.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        // Emit field change for each changed field
        Object.keys(value).forEach(key => {
          this.fieldChange.emit({ key, value: value[key] });
        });
      });

    // Subscribe to form status changes
    this.form.statusChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.formValid.emit(this.form.valid);
      });

    // Initial validity check
    this.formValid.emit(this.form.valid);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize sections from config
   */
  private initializeSections(): void {
    if (this.config.sections && this.config.sections.length > 0) {
      this.sections = [...this.config.sections].sort((a, b) => (a.order || 0) - (b.order || 0));
    } else {
      // Auto-create sections from fields
      const sectionNames = new Set<string>();
      this.config.fields.forEach(field => {
        if (field.section) {
          sectionNames.add(field.section);
        }
      });

      this.sections = Array.from(sectionNames).map((name, index) => ({
        title: name,
        order: index,
      }));
    }
  }

  /**
   * Group fields by section
   */
  private groupFieldsBySection(): void {
    this.fieldsBySection = {};

    // Add fields to sections
    this.config.fields.forEach(field => {
      if (field.hidden) return;

      const sectionName = field.section || 'default';

      // if the section is not created, create it (init)
      if (!this.fieldsBySection[sectionName]) {
        this.fieldsBySection[sectionName] = [];
      }
      // add the field to the section
      this.fieldsBySection[sectionName].push(field);
    });

    // Sort fields within each section
    Object.keys(this.fieldsBySection).forEach(sectionName => {
      this.fieldsBySection[sectionName].sort((a, b) => (a.order || 0) - (b.order || 0));
    });
  }

  /**
   * Get fields for a specific section
   */
  getFieldsForSection(sectionName: string): FormField[] {
    return this.fieldsBySection[sectionName] || [];
  }

  /**
   * Get all fields (for default section)
   */
  getDefaultFields(): FormField[] {
    return this.getFieldsForSection('default');
  }

  /**
   * Handle field value change (for backward compatibility)
   * Note: With Reactive Forms, changes are handled automatically via form.valueChanges
   */
  onFieldChange(key: string, value: unknown): void {
    // Update form control value if needed
    const control = this.form.get(key);
    if (control && control.value !== value) {
      control.setValue(value, { emitEvent: false });
    }
  }

  /**
   * Handle select field change - extract value from SelectOption
   */
  onSelectChange(key: string, option: SelectOption | SelectOption[]): void {
    let value: unknown;
    if (Array.isArray(option)) {
      value = option.map(opt => opt.value);
    } else {
      value = option.value;
    }
    this.onFieldChange(key, value);
  }

  /**
   * Handle dropdown open event from select field
   */
  onFieldDropdownOpen(key: string): void {
    console.log('📤 BaseFormComponent: dropdown opened for field:', key);
    this.fieldDropdownOpen.emit({ key });
  }

  /**
   * Validate form (using Reactive Forms validation)
   */
  private validateForm(): boolean {
    // Mark all fields as touched to show errors
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control) {
        control.markAsTouched();
      }
    });

    return this.form.valid;
  }

  /**
   * Handle form submit
   * @param event Optional event to prevent default behavior when called from button click
   */
  onSubmit(event?: Event): void {
    // Prevent default form submission if event is provided (from button click)
    // This prevents duplicate submissions when button type is 'submit'
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // use the validator of every control, touched, format ecc.

    // if 
    // all fields are filled and valid, then the form is valid
    if (this.form.valid) {
      // Get form value (including disabled fields)
      const formValue = this.form.getRawValue();
      this.formSubmit.emit(formValue);
    } else {
      // Mark all fields as touched to show validation errors
      this.validateForm();
    }
  }

  /**
   * Handle form cancel
   */
  onCancel(): void {
    this.formCancel.emit();
  }

  /**
   * Get field error message from Reactive Forms
   */
  getFieldError(key: string): string {
    const control = this.form.get(key);
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    const errors = control.errors;

    // Check for custom validator error
    if (errors['custom'] && errors['custom'].message) {
      return errors['custom'].message;
    }

    // Check for standard Angular validators
    if (errors['required']) {
      const field = this.config.fields.find(f => f.key === key);
      return `${field?.label || key} is required`;
    }

    if (errors['email']) {
      return 'Invalid email format';
    }

    if (errors['minlength']) {
      return `Minimum length is ${errors['minlength'].requiredLength}`;
    }

    if (errors['maxlength']) {
      return `Maximum length is ${errors['maxlength'].requiredLength}`;
    }

    if (errors['min']) {
      return `Minimum value is ${errors['min'].min}`;
    }

    if (errors['max']) {
      return `Maximum value is ${errors['max'].max}`;
    }

    // Return first error message if available
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      return `Invalid ${key}`;
    }

    return '';
  }

  /**
   * Get FormControl for a field key
   */
  getFormControl(key: string): FormControl | null {
    return this.form.get(key) as FormControl | null;
  }

  /**
   * Toggle section collapse
   */
  toggleSection(section: FormSection): void {
    if (section.collapsible) {
      section.collapsed = !section.collapsed;
    }
  }

  /**
   * Get grid column class
   */
  getGridColumnClass(field: FormField): string {
    const colSpan = field.colSpan || 1;
    return `col-span-${colSpan}`;
  }

  /**
   * Get default buttons if not configured
   */
  getDefaultButtons(): FormButton[] {
    if (this.config.buttons && this.config.buttons.length > 0) {
      return this.config.buttons;
    }

    if (this.config.showButtons === false) {
      return [];
    }

    return [
      {
        label: this.config.cancelButtonText || 'Cancel',
        type: 'reset', // Use 'reset' type to trigger onCancel() when clicked
        variant: this.config.cancelButtonVariant || 'secondary',
      },
      {
        label: this.config.submitButtonText || 'Submit',
        type: 'submit',
        variant: this.config.submitButtonVariant || 'primary',
      },
    ];
  }
}

