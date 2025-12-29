// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/auth/forgot-password/forgot-password.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '../../../Shared/services/notification.service';
import { TranslationService } from '@core/services/translation.service';
import {
  BaseInputComponent,
  BaseButtonComponent,
} from '../../../Shared/components/base';
import { TranslatePipe } from '@core/pipes/translate.pipe';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BaseInputComponent,
    BaseButtonComponent,
    TranslatePipe,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private translationService = inject(TranslationService);

  // Form group
  forgotPasswordForm!: FormGroup;

  // Loading state
  loading = signal(false);

  // Success state
  emailSent = signal(false);

  ngOnInit(): void {
    this.initializeForm();
  }

  /**
   * Initialize forgot password form with validators
   */
  private initializeForm(): void {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      Object.keys(this.forgotPasswordForm.controls).forEach(key => {
        this.forgotPasswordForm.get(key)?.markAsTouched();
      });
      this.notificationService.error(
        this.translationService.translate('auth.forgotPassword.validationError'),
        this.translationService.translate('auth.forgotPassword.pleaseEnterEmail')
      );
      return;
    }

    const email = (this.forgotPasswordForm.value.email as string)?.trim() || '';

    if (!email) {
      this.notificationService.error(
        this.translationService.translate('auth.forgotPassword.error'),
        this.translationService.translate('auth.forgotPassword.pleaseEnterEmail')
      );
      return;
    }

    this.loading.set(true);

    this.auth.forgotPassword({ email }).subscribe({
      next: (data) => {
        console.log('✅ Forgot password request successful!', data);
        this.emailSent.set(true);
        this.notificationService.success(
          this.translationService.translate('auth.forgotPassword.success'),
          data.message || this.translationService.translate('auth.forgotPassword.checkEmail')
        );
        this.loading.set(false);
      },
      error: (err: unknown) => {
        console.error('❌ Forgot password request failed:', err);
        // Still show success message to prevent user enumeration
        this.emailSent.set(true);
        this.notificationService.success(
          this.translationService.translate('auth.forgotPassword.success'),
          this.translationService.translate('auth.forgotPassword.checkEmail')
        );
        this.loading.set(false);
      },
    });
  }

  /**
   * Navigate back to login
   */
  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}

