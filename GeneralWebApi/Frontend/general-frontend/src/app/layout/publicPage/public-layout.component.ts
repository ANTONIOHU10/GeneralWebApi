// Path: GeneralWebApi/Frontend/general-frontend/src/app/layout/public-layout.component.ts
import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from '../../Shared/components/header/header.component';
import { FooterComponent } from '../../Shared/components/footer/footer.component';

@Component({
  standalone: true,
  selector: 'app-public-layout',
  templateUrl: './public-layout.component.html',
  styleUrls: ['./public-layout.component.scss'],
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
})
export class PublicLayoutComponent {
  private router = inject(Router);
  isDarkMode = false;
  showHeader = true;
  showFooter = true;

  constructor() {
    // Initialize theme from localStorage or system preference
    this.initializeTheme();
    
    // Check current route and listen for route changes
    this.checkRoute();
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkRoute();
      });
  }

  /**
   * Check current route and hide header/footer on login, forgot password, reset password, and contact admin pages
   */
  private checkRoute(): void {
    const url = this.router.url;
    const isAuthPage = url === '/login' || 
                       url === '/' || 
                       url === '' ||
                       url.startsWith('/forgot-password') ||
                       url.startsWith('/reset-password') ||
                       url.startsWith('/contact-admin');
    
    this.showHeader = !isAuthPage;
    this.showFooter = !isAuthPage;
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
}
