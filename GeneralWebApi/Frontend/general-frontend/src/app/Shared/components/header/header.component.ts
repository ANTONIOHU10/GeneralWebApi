// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/header/header.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [CommonModule, RouterLink],
})
export class HeaderComponent {
  @Input() isDarkMode = false;
  @Input() showSidebarToggle = false;
  @Input() brandTitle = 'GeneralWebApi';
  @Input() showLoginButton = false;
  
  @Output() themeToggle = new EventEmitter<void>();
  @Output() sidebarToggle = new EventEmitter<void>();
  @Output() notificationClick = new EventEmitter<void>();
  @Output() profileClick = new EventEmitter<void>();
  @Output() settingsClick = new EventEmitter<void>();

  // Mock data for demonstration
  notificationCount = 3;
  userProfile = {
    name: 'John Doe',
    role: 'Administrator'
  };

  /**
   * Handle theme toggle button click
   */
  onThemeToggle(): void {
    this.themeToggle.emit();
  }

  /**
   * Handle sidebar toggle button click
   */
  onSidebarToggle(): void {
    this.sidebarToggle.emit();
  }

  /**
   * Handle notification button click
   */
  onNotificationClick(): void {
    this.notificationClick.emit();
  }

  /**
   * Handle profile button click
   */
  onProfileClick(): void {
    this.profileClick.emit();
  }

  /**
   * Handle settings button click
   */
  onSettingsClick(): void {
    this.settingsClick.emit();
  }
}
