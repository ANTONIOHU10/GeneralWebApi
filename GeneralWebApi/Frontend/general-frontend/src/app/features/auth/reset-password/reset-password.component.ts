// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/auth/reset-password/reset-password.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '../../../Shared/services/notification.service';
import { TranslationService } from '@core/services/translation.service';
import {
  BaseInputComponent,
  BaseButtonComponent,
} from '../../../Shared/components/base';
import { TranslatePipe } from '@core/pipes/translate.pipe';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BaseInputComponent,
    BaseButtonComponent,
    TranslatePipe,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notificationService = inject(NotificationService);
  private translationService = inject(TranslationService);

  // Form group
  resetPasswordForm!: FormGroup;

  // Loading state
  loading = signal(false);
  verifyingToken = signal(true);
  tokenValid = signal(false);

  // Token from URL
  token: string = '';

  ngOnInit(): void {
    // Get token from query parameters
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      if (this.token) {
        this.verifyToken();
      } else {
        this.verifyingToken.set(false);
        this.tokenValid.set(false);
        this.notificationService.error(
          this.translationService.translate('auth.resetPassword.error'),
          this.translationService.translate('auth.resetPassword.invalidToken')
        );
      }
    });

    this.initializeForm();
  }

  /**
   * Verify reset token
   */
  private verifyToken(): void {
    this.auth.verifyResetToken({ token: this.token }).subscribe({
      next: (data) => {
        this.verifyingToken.set(false);
        if (data.isValid) {
          this.tokenValid.set(true);
        } else {
          this.tokenValid.set(false);
          this.notificationService.error(
            this.translationService.translate('auth.resetPassword.error'),
            this.translationService.translate('auth.resetPassword.invalidOrExpiredToken')
          );
        }
      },
      error: (err) => {
        console.error('Token verification failed:', err);
        this.verifyingToken.set(false);
        this.tokenValid.set(false);
        this.notificationService.error(
          this.translationService.translate('auth.resetPassword.error'),
          this.translationService.translate('auth.resetPassword.invalidOrExpiredToken')
        );
      },
    });
  }

  /**
   * Initialize reset password form with validators
   */
  private initializeForm(): void {
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    }, {
      validators: this.passwordMatchValidator,
    });
  }

  /**
   * Custom validator to check if passwords match
   */
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (!newPassword || !confirmPassword) {
      return null;
    }

    return newPassword.value === confirmPassword.value
      ? null
      : { passwordMismatch: true };
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.resetPasswordForm.invalid) {
      Object.keys(this.resetPasswordForm.controls).forEach(key => {
        this.resetPasswordForm.get(key)?.markAsTouched();
      });
      this.notificationService.error(
        this.translationService.translate('auth.resetPassword.validationError'),
        this.translationService.translate('auth.resetPassword.pleaseFillAllFields')
      );
      return;
    }

    const newPassword = (this.resetPasswordForm.value.newPassword as string)?.trim() || '';

    if (!newPassword || newPassword.length < 6) {
      this.notificationService.error(
        this.translationService.translate('auth.resetPassword.error'),
        this.translationService.translate('auth.resetPassword.passwordTooShort')
      );
      return;
    }

    this.loading.set(true);

    this.auth.resetPassword({ token: this.token, newPassword }).subscribe({
      next: (data) => {
        console.log('✅ Password reset successful!', data);
        this.notificationService.success(
          this.translationService.translate('auth.resetPassword.success'),
          data.message || this.translationService.translate('auth.resetPassword.passwordResetSuccess')
        );
        this.loading.set(false);
        // Redirect to login after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err: unknown) => {
        console.error('❌ Password reset failed:', err);
        const errorMessage = err instanceof Error
          ? err.message
          : this.translationService.translate('auth.resetPassword.resetFailed');
        this.notificationService.error(
          this.translationService.translate('auth.resetPassword.error'),
          errorMessage
        );
        this.loading.set(false);
      },
    });
  }

  /**
   * Get error message for a form field
   */
  getFieldError(fieldName: string): string {
    const field = this.resetPasswordForm.get(fieldName);
    if (field?.hasError('required') && field?.touched) {
      return this.translationService.translate('auth.resetPassword.fieldRequired');
    }
    if (field?.hasError('minlength') && field?.touched) {
      return this.translationService.translate('auth.resetPassword.passwordTooShort');
    }
    if (this.resetPasswordForm.hasError('passwordMismatch') && field?.touched) {
      return this.translationService.translate('auth.resetPassword.passwordsDoNotMatch');
    }
    return '';
  }

  /**
   * Check if field has error
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.resetPasswordForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  /**
   * Navigate to login
   */
  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}

