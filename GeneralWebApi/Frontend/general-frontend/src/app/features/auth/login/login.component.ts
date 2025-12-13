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
import { AuthService } from '@core/services/auth.service';
import {
  BaseInputComponent,
  BaseButtonComponent,
  BaseCheckboxComponent,
  BaseErrorComponent,
} from '../../../Shared/components/base';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BaseInputComponent,
    BaseButtonComponent,
    BaseCheckboxComponent,
    BaseErrorComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  // Form group
  loginForm!: FormGroup;

  // Loading and error states
  loading = signal(false);
  error = signal<string | null>(null);

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
      this.error.set('Please enter both username and password');
      return;
    }

    const formValue = this.loginForm.value;
    const username = (formValue.username as string)?.trim() || '';
    const password = (formValue.password as string)?.trim() || '';

    if (!username || !password) {
      this.error.set('Please enter both username and password');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

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
              this.error.set('Navigation failed - please refresh the page');
            }
          })
          .catch(err => {
            console.error('❌ Navigation error:', err);
            this.error.set('Navigation error: ' + err.message);
          });

        this.loading.set(false);
      },
      error: err => {
        console.error('❌ Login failed:', err);
        this.error.set(
          err.message || 'Login failed. Please check your credentials.'
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
   * Get error message for a form field
   */
  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.hasError('required') && field?.touched) {
      return `${fieldName === 'username' ? 'Username' : 'Password'} is required`;
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
