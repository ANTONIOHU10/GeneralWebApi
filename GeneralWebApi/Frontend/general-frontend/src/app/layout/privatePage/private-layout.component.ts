// Path: GeneralWebApi/Frontend/general-frontend/src/app/layout/private-layout.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../Shared/components/header/header.component';
import { FooterComponent } from '../../Shared/components/footer/footer.component';
import { SidebarComponent } from '../../Shared/components/sidebar/sidebar.component';

@Component({
  standalone: true,
  selector: 'app-private-layout',
  templateUrl: './private-layout.component.html',
  styleUrls: ['./private-layout.component.scss'],
  imports: [RouterOutlet, HeaderComponent, FooterComponent, SidebarComponent],
})
export class PrivateLayoutComponent {
  isDarkMode = false;
  isSidebarOpen = this.getInitialSidebarState(); // 根据屏幕尺寸设置初始状态

  constructor() {
    // Initialize theme from localStorage or system preference
    this.initializeTheme();
  }

  /**
   * Get initial sidebar state based on screen size
   */
  private getInitialSidebarState(): boolean {
    // 桌面端默认打开，移动端默认关闭
    return window.innerWidth > 768;
  }

  /**
   * Initialize theme based on user preference or system setting
   */
  private initializeTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
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
   * Toggle sidebar visibility (mobile)
   */
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  /**
   * Close sidebar (mobile)
   */
  closeSidebar(): void {
    this.isSidebarOpen = false;
  }
}
