// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/auth/login/login.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '../../../Shared/services/notification.service';
import { TranslationService } from '@core/services/translation.service';
import {
  BaseInputComponent,
  BaseButtonComponent,
  BaseCheckboxComponent,
} from '../../../Shared/components/base';
import { TranslatePipe } from '@core/pipes/translate.pipe';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BaseInputComponent,
    BaseButtonComponent,
    BaseCheckboxComponent,
    TranslatePipe,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private translationService = inject(TranslationService);

  // Form group
  loginForm!: FormGroup;

  // Loading state
  loading = signal(false);

  // Theme state
  isDarkMode = false;

  ngOnInit(): void {
    this.initializeForm();
    this.initializeTheme();
  }

  /**
   * Initialize theme based on user preference or system setting
   */
  private initializeTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;

    this.isDarkMode = savedTheme === 'dark' || (!savedTheme && prefersDark);
    this.applyTheme();
  }

  /**
   * Toggle between light and dark theme
   */
  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  /**
   * Apply the current theme to the document
   */
  private applyTheme(): void {
    const theme = this.isDarkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    document.body.className = this.isDarkMode ? 'dark-theme' : 'light-theme';
  }

  /**
   * Initialize login form with validators
   */
  private initializeForm(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      rememberMe: [false],
    });
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    // Mark all fields as touched to show validation errors
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      this.notificationService.error(
        'Validation Error',
        'Please enter both username and password'
      );
      return;
    }

    const formValue = this.loginForm.value;
    const username = (formValue.username as string)?.trim() || '';
    const password = (formValue.password as string)?.trim() || '';

    if (!username || !password) {
      this.notificationService.error(
        this.translationService.translate('auth.loginFailed'),
        this.translationService.translate('auth.errors.validationError')
      );
      return;
    }

    this.loading.set(true);

    console.log('🚀 Starting login...');

    this.auth.login({ username, password }).subscribe({
      next: data => {
        console.log('✅ Login successful!', data);
        console.log('🔑 Token saved:', localStorage.getItem('access_token'));

        // Save remember me preference
        if (formValue.rememberMe) {
          localStorage.setItem('remember_me', 'true');
        } else {
          localStorage.removeItem('remember_me');
        }

        console.log('🧭 Attempting navigation to /private/employees...');
        this.router
          .navigate(['/private/employees'])
          .then(success => {
            console.log('🧭 Navigation result:', success);
            if (success) {
              console.log('🎉 Successfully navigated!');
            } else {
              console.error('❌ Navigation failed!');
              this.notificationService.error(
                this.translationService.translate('auth.loginFailed'),
                this.translationService.translate('auth.errors.navigationError')
              );
            }
          })
          .catch(err => {
            console.error('❌ Navigation error:', err);
            this.notificationService.error(
              this.translationService.translate('auth.loginFailed'),
              this.translationService.translate('auth.errors.navigationError')
            );
          });

        this.loading.set(false);
      },
      error: (err: unknown) => {
        console.error('❌ Login failed:', err);
        const errorMessage = this.translateErrorMessage(err);
        this.notificationService.error(
          this.translationService.translate('auth.loginFailed'),
          errorMessage
        );
        this.loading.set(false);
      },
    });
  }

  /**
   * Handle forgot password click
   */
  onForgotPassword(): void {
    console.log('Forgot password clicked');
    // TODO: Implement forgot password functionality
  }

  /**
   * Handle contact administrator click
   */
  onContactAdmin(): void {
    console.log('Contact administrator clicked');
    // TODO: Implement contact administrator functionality
  }

  /**
   * Translate error message from backend response
   */
  private translateErrorMessage(error: unknown): string {
    let errorMessage = '';

    // Handle HttpErrorResponse
    if (error instanceof HttpErrorResponse) {
      const apiError = error.error;
      if (apiError?.message) {
        errorMessage = apiError.message;
      } else if (apiError?.error) {
        errorMessage = apiError.error;
      }
    } 
    // Handle Error object (after interceptor processing)
    else if (error instanceof Error) {
      errorMessage = error.message;
    }
    // Handle generic object
    else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String((error as { message: unknown }).message);
    }

    // Fallback to default message
    if (!errorMessage || errorMessage.trim() === '') {
      return this.translationService.translate('auth.errors.default');
    }

    // Map backend error messages to translated messages
    const errorMessageLower = errorMessage.toLowerCase();

    // Invalid credentials
    if (errorMessageLower.includes('invalid') && 
        (errorMessageLower.includes('credential') || errorMessageLower.includes('username') || errorMessageLower.includes('password'))) {
      return this.translationService.translate('auth.errors.invalidCredentials');
    }
    // User not found
    if (errorMessageLower.includes('user') && errorMessageLower.includes('not found')) {
      return this.translationService.translate('auth.errors.userNotFound');
    }
    // User locked
    if (errorMessageLower.includes('locked') || errorMessageLower.includes('blocked')) {
      return this.translationService.translate('auth.errors.userLocked');
    }
    // Network error
    if (errorMessageLower.includes('network') || 
        errorMessageLower.includes('connection') ||
        errorMessageLower.includes('timeout') ||
        errorMessageLower.includes('failed to fetch')) {
      return this.translationService.translate('auth.errors.networkError');
    }
    // Server error (5xx)
    if (error instanceof HttpErrorResponse && error.status >= 500) {
      return this.translationService.translate('auth.errors.serverError');
    }

    // Return original message if no translation found
    return errorMessage;
  }

  /**
   * Get error message for a form field
   */
  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.hasError('required') && field?.touched) {
      const fieldLabel = fieldName === 'username' 
        ? this.translationService.translate('auth.username')
        : this.translationService.translate('auth.password');
      // Use simple "is required" message
      return `${fieldLabel} is required`;
    }
    return '';
  }

  /**
   * Check if field has error
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }
}
