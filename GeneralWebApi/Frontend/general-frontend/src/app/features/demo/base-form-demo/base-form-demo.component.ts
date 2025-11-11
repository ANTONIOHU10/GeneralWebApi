// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/demo/base-form-demo/base-form-demo.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  BaseFormComponent,
  BaseContainerComponent,
  BasePageHeaderComponent,
  BaseCardComponent,
  FormConfig,
  SelectOption,
  RadioOption,
} from '../../../Shared/components/base';

@Component({
  selector: 'app-base-form-demo',
  standalone: true,
  imports: [
    CommonModule,
    BaseFormComponent,
    BaseContainerComponent,
    BasePageHeaderComponent,
    BaseCardComponent,
  ],
  templateUrl: './base-form-demo.component.html',
  styleUrls: ['./base-form-demo.component.scss'],
})
export class BaseFormDemoComponent {
  formData: Record<string, unknown> = {};
  isFormValid = false;

  // Example form configuration - Employee form similar to add-employee
  employeeFormConfig: FormConfig = {
    sections: [
      {
        title: 'Personal Information',
        description: 'Enter the employee\'s personal details',
        order: 0,
      },
      {
        title: 'Work Information',
        description: 'Enter employment details',
        order: 1,
      },
      {
        title: 'Address Information',
        description: 'Optional address details',
        order: 2,
        collapsible: true,
        collapsed: false,
      },
      {
        title: 'Emergency Contact',
        description: 'Optional emergency contact information',
        order: 3,
        collapsible: true,
        collapsed: true,
      },
    ],
    layout: {
      columns: 2,
      gap: '1.5rem',
      sectionGap: '2rem',
      labelPosition: 'top',
      showSectionDividers: true,
    },
    fields: [
      // Personal Information Section
      {
        key: 'firstName',
        type: 'input',
        label: 'First Name',
        placeholder: 'Enter first name',
        required: true,
        section: 'Personal Information',
        order: 0,
        colSpan: 1,
      },
      {
        key: 'lastName',
        type: 'input',
        label: 'Last Name',
        placeholder: 'Enter last name',
        required: true,
        section: 'Personal Information',
        order: 1,
        colSpan: 1,
      },
      {
        key: 'email',
        type: 'input',
        label: 'Email',
        placeholder: 'Enter email address',
        required: true,
        inputType: 'email',
        section: 'Personal Information',
        order: 2,
        colSpan: 1,
        validator: (value) => {
          if (!value) return null;
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value as string) ? null : 'Invalid email format';
        },
      },
      {
        key: 'phoneNumber',
        type: 'input',
        label: 'Phone Number',
        placeholder: 'Enter phone number (optional)',
        inputType: 'tel',
        section: 'Personal Information',
        order: 3,
        colSpan: 1,
      },
      {
        key: 'employeeNumber',
        type: 'input',
        label: 'Employee Number',
        placeholder: 'Leave empty to auto-generate (optional)',
        section: 'Personal Information',
        order: 4,
        colSpan: 1,
      },
      {
        key: 'taxCode',
        type: 'input',
        label: 'Tax Code',
        placeholder: 'Enter tax code / fiscal code',
        required: true,
        section: 'Personal Information',
        order: 5,
        colSpan: 1,
      },
      // Work Information Section
      {
        key: 'employmentStatus',
        type: 'select',
        label: 'Employment Status',
        placeholder: 'Select employment status',
        required: true,
        section: 'Work Information',
        order: 0,
        colSpan: 1,
        options: [
          { value: 'Active', label: 'Active' },
          { value: 'Inactive', label: 'Inactive' },
          { value: 'Terminated', label: 'Terminated' },
          { value: 'OnLeave', label: 'On Leave' },
        ] as SelectOption[],
      },
      {
        key: 'employmentType',
        type: 'select',
        label: 'Employment Type',
        placeholder: 'Select employment type',
        required: true,
        section: 'Work Information',
        order: 1,
        colSpan: 1,
        options: [
          { value: 'FullTime', label: 'Full Time' },
          { value: 'PartTime', label: 'Part Time' },
          { value: 'Contract', label: 'Contract' },
          { value: 'Intern', label: 'Intern' },
        ] as SelectOption[],
      },
      {
        key: 'hireDate',
        type: 'datepicker',
        label: 'Hire Date',
        placeholder: 'Select hire date',
        required: true,
        section: 'Work Information',
        order: 2,
        colSpan: 1,
      },
      {
        key: 'departmentId',
        type: 'select',
        label: 'Department',
        placeholder: 'Select department (optional)',
        section: 'Work Information',
        order: 3,
        colSpan: 1,
        searchable: true,
        options: [
          { value: 1, label: 'Human Resources' },
          { value: 2, label: 'Information Technology' },
          { value: 3, label: 'Finance' },
          { value: 4, label: 'Marketing' },
          { value: 5, label: 'Sales' },
        ] as SelectOption[],
      },
      {
        key: 'positionId',
        type: 'select',
        label: 'Position',
        placeholder: 'Select position (optional)',
        section: 'Work Information',
        order: 4,
        colSpan: 1,
        options: [
          { value: 1, label: 'Manager' },
          { value: 2, label: 'Developer' },
          { value: 3, label: 'Analyst' },
          { value: 4, label: 'Designer' },
          { value: 5, label: 'Coordinator' },
        ] as SelectOption[],
      },
      {
        key: 'currentSalary',
        type: 'number',
        label: 'Current Salary',
        placeholder: 'Enter salary amount (optional)',
        section: 'Work Information',
        order: 5,
        colSpan: 1,
        step: 0.01,
        min: 0,
      },
      {
        key: 'salaryCurrency',
        type: 'input',
        label: 'Salary Currency',
        placeholder: 'e.g., USD, EUR (optional)',
        section: 'Work Information',
        order: 6,
        colSpan: 1,
      },
      // Address Information Section
      {
        key: 'address',
        type: 'input',
        label: 'Address',
        placeholder: 'Enter street address (optional)',
        section: 'Address Information',
        order: 0,
        colSpan: 1,
      },
      {
        key: 'city',
        type: 'input',
        label: 'City',
        placeholder: 'Enter city (optional)',
        section: 'Address Information',
        order: 1,
        colSpan: 1,
      },
      {
        key: 'postalCode',
        type: 'input',
        label: 'Postal Code',
        placeholder: 'Enter postal code (optional)',
        section: 'Address Information',
        order: 2,
        colSpan: 1,
      },
      {
        key: 'country',
        type: 'input',
        label: 'Country',
        placeholder: 'Enter country (optional)',
        section: 'Address Information',
        order: 3,
        colSpan: 1,
      },
      // Emergency Contact Section
      {
        key: 'emergencyContactName',
        type: 'input',
        label: 'Contact Name',
        placeholder: 'Enter emergency contact name (optional)',
        section: 'Emergency Contact',
        order: 0,
        colSpan: 1,
      },
      {
        key: 'emergencyContactPhone',
        type: 'input',
        label: 'Contact Phone',
        placeholder: 'Enter emergency contact phone (optional)',
        inputType: 'tel',
        section: 'Emergency Contact',
        order: 1,
        colSpan: 1,
      },
      {
        key: 'emergencyContactRelation',
        type: 'input',
        label: 'Contact Relation',
        placeholder: 'e.g., Spouse, Parent (optional)',
        section: 'Emergency Contact',
        order: 2,
        colSpan: 1,
      },
    ],
    submitButtonText: 'Create Employee',
    cancelButtonText: 'Cancel',
    submitButtonVariant: 'primary',
    cancelButtonVariant: 'secondary',
  };

  // Simple form configuration example
  simpleFormConfig: FormConfig = {
    layout: {
      columns: 1,
      gap: '1rem',
    },
    fields: [
      {
        key: 'name',
        type: 'input',
        label: 'Name',
        placeholder: 'Enter your name',
        required: true,
        order: 0,
      },
      {
        key: 'email',
        type: 'input',
        label: 'Email',
        placeholder: 'Enter your email',
        required: true,
        inputType: 'email',
        order: 1,
      },
      {
        key: 'message',
        type: 'textarea',
        label: 'Message',
        placeholder: 'Enter your message',
        required: true,
        rows: 5,
        order: 2,
      },
      {
        key: 'newsletter',
        type: 'checkbox',
        label: 'Subscribe to newsletter',
        order: 3,
      },
    ],
  };

  // Form with different field types
  mixedFormConfig: FormConfig = {
    sections: [
      {
        title: 'Basic Information',
        order: 0,
      },
      {
        title: 'Preferences',
        order: 1,
      },
    ],
    layout: {
      columns: 2,
      gap: '1.5rem',
    },
    fields: [
      {
        key: 'username',
        type: 'input',
        label: 'Username',
        placeholder: 'Enter username',
        required: true,
        section: 'Basic Information',
        order: 0,
        prefixIcon: 'person',
      },
      {
        key: 'password',
        type: 'input',
        label: 'Password',
        placeholder: 'Enter password',
        required: true,
        inputType: 'password',
        section: 'Basic Information',
        order: 1,
        validator: (value) => {
          if (!value) return null;
          const str = value as string;
          return str.length >= 8 ? null : 'Password must be at least 8 characters';
        },
      },
      {
        key: 'gender',
        type: 'radio',
        label: 'Gender',
        required: true,
        section: 'Basic Information',
        order: 2,
        colSpan: 2,
        radioOptions: [
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
          { value: 'other', label: 'Other' },
        ] as RadioOption[],
      },
      {
        key: 'notifications',
        type: 'switch',
        label: 'Enable Notifications',
        section: 'Preferences',
        order: 0,
      },
      {
        key: 'theme',
        type: 'select',
        label: 'Theme',
        placeholder: 'Select theme',
        section: 'Preferences',
        order: 1,
        options: [
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
          { value: 'auto', label: 'Auto' },
        ] as SelectOption[],
      },
    ],
  };

  currentFormConfig: FormConfig = this.employeeFormConfig;
  currentFormType: 'employee' | 'simple' | 'mixed' = 'employee';

  onFormSubmit(data: Record<string, unknown>): void {
    console.log('Form submitted with data:', data);
    alert('Form submitted! Check console for data.');
  }

  onFormCancel(): void {
    console.log('Form cancelled');
    this.formData = {};
  }

  onFieldChange(event: { key: string; value: unknown }): void {
    console.log('Field changed:', event);
  }

  onFormValidChange(isValid: boolean): void {
    this.isFormValid = isValid;
    console.log('Form validity changed:', isValid);
  }

  switchFormType(type: 'employee' | 'simple' | 'mixed'): void {
    this.currentFormType = type;
    switch (type) {
      case 'employee':
        this.currentFormConfig = this.employeeFormConfig;
        break;
      case 'simple':
        this.currentFormConfig = this.simpleFormConfig;
        break;
      case 'mixed':
        this.currentFormConfig = this.mixedFormConfig;
        break;
    }
    this.formData = {};
  }
}

