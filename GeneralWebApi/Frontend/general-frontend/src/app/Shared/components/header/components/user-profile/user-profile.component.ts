// Path: GeneralWebApi/Frontend/general-frontend/src/app/Shared/components/header/components/user-profile/user-profile.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@core/pipes/translate.pipe';

@Component({
  standalone: true,
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  imports: [CommonModule, TranslatePipe],
})
export class UserProfileComponent {
  @Input() userName = 'Guest';
  @Input() userRole = 'User';
  @Output() profileClick = new EventEmitter<void>();

  onProfileClick(): void {
    this.profileClick.emit();
  }
}

