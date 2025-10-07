// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/auth/login.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login">
      <h2>Login</h2>
      <form (ngSubmit)="onSubmit()">
        <input type="text" [(ngModel)]="username" name="username" placeholder="Username" required />
        <input type="password" [(ngModel)]="password" name="password" placeholder="Password" required />
        <button type="submit" [disabled]="loading()">Sign in</button>
      </form>
      <p *ngIf="error()">{{ error() }}</p>
    </div>
  `,
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
    this.auth.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        // Login successful, navigate to private area
        this.router.navigate(['/private']);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Login failed');
        this.loading.set(false);
      },
    });
  }
}