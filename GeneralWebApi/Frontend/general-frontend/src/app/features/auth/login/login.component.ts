import { Component, inject, signal } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  rememberMe = false;
  loading = signal(false);
  error = signal<string | null>(null);

  onSubmit() {
    // Basic validation
    if (!this.username.trim() || !this.password.trim()) {
      this.error.set('Please enter both username and password');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    console.log('🚀 Starting login...');

    this.auth
      .login({ username: this.username, password: this.password })
      .subscribe({
        next: data => {
          console.log('✅ Login successful!', data);
          console.log('🔑 Token saved:', localStorage.getItem('access_token'));

          // Save remember me preference
          if (this.rememberMe) {
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

  // Handle forgot password
  onForgotPassword() {
    console.log('Forgot password clicked');
    // TODO: Implement forgot password functionality
  }

  // Handle contact administrator
  onContactAdmin() {
    console.log('Contact administrator clicked');
    // TODO: Implement contact administrator functionality
  }
}
