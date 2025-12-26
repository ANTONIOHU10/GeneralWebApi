// Path: GeneralWebApi/Frontend/general-frontend/src/app/Shared/components/header/components/quick-actions/quick-actions.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-quick-actions',
  templateUrl: './quick-actions.component.html',
  styleUrls: ['./quick-actions.component.scss'],
  imports: [CommonModule],
})
export class QuickActionsComponent {
  @Input() isDarkMode = false;
  @Output() settingsClick = new EventEmitter<void>();
  @Output() themeToggle = new EventEmitter<void>();

  onSettingsClick(): void {
    this.settingsClick.emit();
  }

  onThemeToggle(): void {
    this.themeToggle.emit();
  }
}

