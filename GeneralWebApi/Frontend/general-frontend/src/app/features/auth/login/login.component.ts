import { Component, inject, signal } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);

  onSubmit() {
    this.loading.set(true);
    this.error.set(null);

    console.log('🚀 Starting login...');

    this.auth
      .login({ username: this.username, password: this.password })
      .subscribe({
        next: data => {
          console.log('✅ Login successful!', data);
          console.log('🔑 Token saved:', localStorage.getItem('access_token'));

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
          this.error.set(err.message || 'Login failed');
          this.loading.set(false);
        },
      });
  }
}
