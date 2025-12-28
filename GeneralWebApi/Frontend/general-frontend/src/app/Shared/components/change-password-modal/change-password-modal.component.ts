// Path: GeneralWebApi/Frontend/general-frontend/src/app/Shared/components/change-password-modal/change-password-modal.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil, finalize, distinctUntilChanged, filter } from 'rxjs/operators';
import { BaseModalComponent } from '../base/base-modal/base-modal.component';
import { BaseFormComponent, FormConfig } from '../base/base-form/base-form.component';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { TranslationService } from '@core/services/translation.service';
import { TranslatePipe } from '@core/pipes/translate.pipe';
import { UpdatePasswordRequest } from 'app/contracts/auth/auth.models';
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-change-password-modal',
  standalone: true,
  imports: [
    CommonModule,
    BaseModalComponent,
    BaseFormComponent,
    TranslatePipe,
  ],
  templateUrl: './change-password-modal.component.html',
  styleUrls: ['./change-password-modal.component.scss'],
})
export class ChangePasswordModalComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private translationService = inject(TranslationService);
  private destroy$ = new Subject<void>();

  @Input() isOpen = false;
  @Input() username = '';
  @Output() closeEvent = new EventEmitter<void>();
  @Output() passwordChanged = new EventEmitter<void>();

  loading = signal(false);
  formData: Record<string, unknown> = {};
  formConfig: FormConfig = {
    fields: [],
    submitButtonText: '',
    cancelButtonText: '',
  };
  
  // Error message signal - simplified approach
  errorMessage = signal<string>('');
  
  // Computed signal for error display
  showError = computed(() => {
    const msg = this.errorMessage();
    return !!msg && msg.trim().length > 0;
  });

  ngOnInit(): void {
    // Wait for translations to load before initializing form config
    this.translationService.getTranslationsLoaded$().pipe(
      distinctUntilChanged(),
      filter(loaded => loaded),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.initializeFormConfig();
    });

    this.resetForm();
  }

  /**
   * Initialize form config with translations
   */
  private initializeFormConfig(): void {
    const t = (key: string) => this.translationService.translate(key);
    const passwordSection = t('auth.changePassword.sections.passwordInformation');
    
    this.formConfig = {
      sections: [
        {
          title: passwordSection,
          description: t('auth.changePassword.sections.passwordInformationDescription'),
          order: 0,
        },
      ],
      layout: {
        columns: 1,
        gap: '1.5rem',
        sectionGap: '2rem',
        labelPosition: 'top',
        showSectionDividers: true,
      },
      fields: [
        {
          key: 'oldPassword',
          type: 'input',
          label: t('auth.changePassword.fields.oldPassword'),
          placeholder: t('auth.changePassword.fields.oldPasswordPlaceholder'),
          required: true,
          section: passwordSection,
          order: 0,
          colSpan: 1,
          inputType: 'password',
          prefixIcon: 'lock',
        },
        {
          key: 'newPassword',
          type: 'input',
          label: t('auth.changePassword.fields.newPassword'),
          placeholder: t('auth.changePassword.fields.newPasswordPlaceholder'),
          required: true,
          section: passwordSection,
          order: 1,
          colSpan: 1,
          inputType: 'password',
          prefixIcon: 'lock',
          validators: [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/[A-Z]/), // At least one uppercase letter
            Validators.pattern(/[a-z]/), // At least one lowercase letter
            Validators.pattern(/[0-9]/), // At least one number
            Validators.pattern(/[@$!%*?&]/), // At least one special symbol
          ],
          hint: t('auth.changePassword.fields.newPasswordHint'),
        },
        {
          key: 'confirmPassword',
          type: 'input',
          label: t('auth.changePassword.fields.confirmPassword'),
          placeholder: t('auth.changePassword.fields.confirmPasswordPlaceholder'),
          required: true,
          section: passwordSection,
          order: 2,
          colSpan: 1,
          inputType: 'password',
          prefixIcon: 'lock',
        },
      ],
      submitButtonText: t('auth.changePassword.buttons.submit'),
      cancelButtonText: t('auth.changePassword.buttons.cancel'),
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Reset form data
   */
  resetForm(): void {
    this.formData = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
    this.errorMessage.set('');
  }

  /**
   * Set error message - simplified helper method
   */
  private setError(message: string): void {
    if (!message || message.trim() === '') {
      return;
    }
    console.log('🔴 Setting error message:', message);
    this.errorMessage.set(message);
    console.log('🔴 Error message after set:', this.errorMessage());
    console.log('🔴 Show error computed:', this.showError());
  }

  /**
   * Clear error message
   */
  private clearError(): void {
    this.errorMessage.set('');
  }

  /**
   * Validate password strength
   */
  private validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const t = (key: string) => this.translationService.translate(key);

    if (!password) {
      errors.push(t('auth.changePassword.validation.required'));
      return { valid: false, errors };
    }

    if (password.length < 8) {
      errors.push(t('auth.changePassword.validation.minLength'));
    }

    if (!/[A-Z]/.test(password)) {
      errors.push(t('auth.changePassword.validation.uppercase'));
    }

    if (!/[a-z]/.test(password)) {
      errors.push(t('auth.changePassword.validation.lowercase'));
    }

    if (!/[0-9]/.test(password)) {
      errors.push(t('auth.changePassword.validation.number'));
    }

    if (!/[@$!%*?&]/.test(password)) {
      errors.push(t('auth.changePassword.validation.special'));
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Check if new password has at least 4 characters different from old password
   */
  private checkPasswordDifference(oldPassword: string, newPassword: string): boolean {
    if (!oldPassword || !newPassword) {
      return false;
    }

    const minLength = Math.min(oldPassword.length, newPassword.length);
    let differentChars = 0;

    for (let i = 0; i < minLength; i++) {
      if (oldPassword[i] !== newPassword[i]) {
        differentChars++;
      }
    }

    // Also count extra characters in the longer password
    differentChars += Math.abs(oldPassword.length - newPassword.length);

    return differentChars >= 4;
  }

  /**
   * Extract and translate error message from backend response
   */
  private extractErrorMessage(error: unknown): string {
    let errorMessage = '';

    // Handle HttpErrorResponse
    if (error instanceof HttpErrorResponse) {
      const apiError = error.error;
      if (apiError?.message) {
        errorMessage = apiError.message;
      } else if (apiError?.errors && typeof apiError.errors === 'object') {
        const validationErrors = Object.values(apiError.errors).flat() as string[];
        errorMessage = validationErrors.join(', ');
      } else if (apiError?.error) {
        errorMessage = apiError.error;
      }
    } 
    // Handle Error object (after interceptor processing)
    else if (error instanceof Error) {
      errorMessage = error.message;
    }
    // Handle generic object
    else if (error && typeof error === 'object') {
      if ('error' in error) {
        const apiError = (error as { error: unknown }).error;
        if (apiError && typeof apiError === 'object' && 'message' in apiError) {
          errorMessage = String((apiError as { message: unknown }).message);
        }
      }
      if ((!errorMessage || errorMessage.trim() === '') && 'message' in error) {
        errorMessage = String((error as { message: unknown }).message);
      }
    }

    // Fallback to default message
    if (!errorMessage || errorMessage.trim() === '') {
      errorMessage = this.translationService.translate('auth.changePassword.errors.updateFailedMessage');
    }

    return errorMessage;
  }

  /**
   * Translate error message to user-friendly message
   */
  private translateErrorMessage(errorMessage: string): string {
    const errorMessageLower = errorMessage.toLowerCase();

    // Old password incorrect
    if ((errorMessageLower.includes('current password') && errorMessageLower.includes('incorrect')) ||
        (errorMessageLower.includes('old password') && errorMessageLower.includes('incorrect'))) {
      return this.translationService.translate('auth.changePassword.errors.oldPasswordIncorrect');
    } 
    // User not found
    if (errorMessageLower.includes('user') && errorMessageLower.includes('not found')) {
      return this.translationService.translate('auth.changePassword.errors.userNotFound');
    } 
    // Password too similar - must have at least 4 characters different
    if (errorMessageLower.includes('4 different') ||
        errorMessageLower.includes('4 character') ||
        (errorMessageLower.includes('must have at least') && errorMessageLower.includes('different'))) {
      return this.translationService.translate('auth.changePassword.errors.insufficientDifferenceMessage');
    }
    // Password validation failed (from FluentValidation)
    if (errorMessageLower.includes('validation') ||
        errorMessageLower.includes('does not meet') ||
        errorMessageLower.includes('security requirements') ||
        errorMessageLower.includes('must contain')) {
      // Extract specific validation message if it's a general validation error
      if (errorMessageLower.includes('one or more validation errors occurred')) {
        const colonIndex = errorMessage.indexOf(':');
        if (colonIndex > -1 && colonIndex < errorMessage.length - 1) {
          const specificError = errorMessage.substring(colonIndex + 1).trim();
          const specificErrorLower = specificError.toLowerCase();
          
          // Check if it's the 4 different characters error
          if (specificErrorLower.includes('4 different') || 
              specificErrorLower.includes('4 character') ||
              (specificErrorLower.includes('must have at least') && specificErrorLower.includes('different'))) {
            return this.translationService.translate('auth.changePassword.errors.insufficientDifferenceMessage');
          }
          return specificError;
        }
        return this.translationService.translate('auth.changePassword.errors.passwordValidationFailed');
      }
    }

    return errorMessage;
  }

  /**
   * Handle form submission
   */
  onFormSubmit(formData: Record<string, unknown>): void {
    const oldPassword = String(formData['oldPassword'] || '').trim();
    const newPassword = String(formData['newPassword'] || '').trim();
    const confirmPassword = String(formData['confirmPassword'] || '').trim();

    // Clear previous error first
    this.clearError();

    // Validate old password is provided
    if (!oldPassword) {
      this.setError(this.translationService.translate('auth.changePassword.errors.oldPasswordRequiredMessage'));
      return;
    }

    // Validate new password strength
    const strengthValidation = this.validatePasswordStrength(newPassword);
    if (!strengthValidation.valid) {
      this.setError(strengthValidation.errors.join(', '));
      return;
    }

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      this.setError(this.translationService.translate('auth.changePassword.errors.passwordMismatchMessage'));
      return;
    }

    // Validate new password is different from old password
    if (oldPassword === newPassword) {
      this.setError(this.translationService.translate('auth.changePassword.errors.samePasswordMessage'));
      return;
    }

    // Validate new password has at least 4 characters different from old password
    if (!this.checkPasswordDifference(oldPassword, newPassword)) {
      this.setError(this.translationService.translate('auth.changePassword.errors.insufficientDifferenceMessage'));
      return;
    }

    if (!this.username) {
      this.setError(this.translationService.translate('auth.changePassword.errors.usernameRequiredMessage'));
      return;
    }

    // All validations passed, proceed with API call
    const request: UpdatePasswordRequest = {
      username: this.username,
      oldPassword,
      newPassword,
    };

    this.loading.set(true);
    this.clearError();

    this.authService.updatePassword(request).pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.loading.set(false);
      })
    ).subscribe({
      next: () => {
        // Show success notification
        this.notificationService.success(
          this.translationService.translate('auth.changePassword.success.title'),
          this.translationService.translate('auth.changePassword.success.message'),
          { duration: 3000, autoClose: true }
        );
        this.resetForm();
        this.passwordChanged.emit();
        this.onClose();
      },
      error: (error: unknown) => {
        // Extract and translate error message
        const rawErrorMessage = this.extractErrorMessage(error);
        const translatedErrorMessage = this.translateErrorMessage(rawErrorMessage);
        
        // Set error message - signal will automatically trigger change detection
        this.setError(translatedErrorMessage);
      },
    });
  }

  /**
   * Handle field change - don't auto-clear error message
   * Error will be cleared on next form submission
   */
  onFieldChange(event: { key: string; value: unknown }): void {
    // Don't clear error automatically - let it persist until next submission
    // This ensures error message is visible to user
    // Error will be cleared in onFormSubmit when validation starts
  }

  /**
   * Handle form cancel
   */
  onFormCancel(): void {
    this.resetForm();
    this.onClose();
  }

  /**
   * Handle modal close
   */
  onClose(): void {
    this.resetForm();
    this.closeEvent.emit();
  }

  /**
   * Handle backdrop click
   */
  onBackdropClick(): void {
    if (this.formConfig && Object.keys(this.formData).some(key => this.formData[key])) {
      // If form has data, show confirmation before closing
      // For now, just close
      this.onClose();
    } else {
      this.onClose();
    }
  }
}
