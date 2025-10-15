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
}
