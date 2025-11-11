// Path: GeneralWebApi/Frontend/general-frontend/src/app/Shared/components/base/base-form/base-form.component.ts
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  validator?: (value: unknown) => string | null; // Returns error message or null
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
    FormsModule,
    BaseInputComponent,
    BaseSelectComponent,
    BaseTextareaComponent,
    BaseCheckboxComponent,
    BaseRadioComponent,
    BaseDatepickerComponent,
    BaseButtonComponent,
    BaseSwitchComponent,
  ],
  templateUrl: './base-form.component.html',
  styleUrls: ['./base-form.component.scss'],
})
export class BaseFormComponent implements OnInit, OnChanges {
  @Input() config!: FormConfig;
  @Input() formData: Record<string, unknown> = {};
  @Input() loading = false;

  @Output() formSubmit = new EventEmitter<Record<string, unknown>>();
  @Output() formCancel = new EventEmitter<void>();
  @Output() fieldChange = new EventEmitter<{ key: string; value: unknown }>();
  @Output() formValid = new EventEmitter<boolean>();

  // Internal form data
  internalFormData: Record<string, unknown> = {};
  fieldErrors: Record<string, string> = {};
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] || changes['formData']) {
      this.initializeForm();
    }
  }

  /**
   * Initialize form with configuration
   */
  private initializeForm(): void {
    if (!this.config) return;

    // Merge layout config
    this.layout = { ...this.layout, ...this.config.layout };

    // Initialize form data
    this.internalFormData = { ...this.formData };

    // Initialize sections
    this.initializeSections();

    // Group fields by section
    this.groupFieldsBySection();

    // Initialize field errors
    this.fieldErrors = {};
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
      if (!this.fieldsBySection[sectionName]) {
        this.fieldsBySection[sectionName] = [];
      }
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
   * Handle field value change
   */
  onFieldChange(key: string, value: unknown): void {
    this.internalFormData[key] = value;
    this.fieldErrors[key] = '';

    // Run custom validator if exists
    const field = this.config.fields.find(f => f.key === key);
    if (field?.validator) {
      const error = field.validator(value);
      if (error) {
        this.fieldErrors[key] = error;
      }
    }

    // Emit field change event
    this.fieldChange.emit({ key, value });

    // Check form validity
    this.checkFormValidity();
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
   * Validate form
   */
  private validateForm(): boolean {
    let isValid = true;
    this.fieldErrors = {};

    this.config.fields.forEach(field => {
      if (field.hidden) return;

      const value = this.internalFormData[field.key];

      // Check required fields
      if (field.required && (value === null || value === undefined || value === '')) {
        this.fieldErrors[field.key] = `${field.label} is required`;
        isValid = false;
        return;
      }

      // Run custom validator
      if (field.validator) {
        const error = field.validator(value);
        if (error) {
          this.fieldErrors[field.key] = error;
          isValid = false;
        }
      }
    });

    return isValid;
  }

  /**
   * Check form validity and emit event
   */
  private checkFormValidity(): void {
    const isValid = this.validateForm();
    this.formValid.emit(isValid);
  }

  /**
   * Handle form submit
   */
  onSubmit(): void {
    if (this.validateForm()) {
      this.formSubmit.emit({ ...this.internalFormData });
    }
  }

  /**
   * Handle form cancel
   */
  onCancel(): void {
    this.formCancel.emit();
  }

  /**
   * Get field error message
   */
  getFieldError(key: string): string {
    return this.fieldErrors[key] || '';
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
    const totalColumns = this.layout.columns || 2;
    const percentage = (colSpan / totalColumns) * 100;
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
        type: 'button',
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

