// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/sidebar/sidebar.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

@Component({
  standalone: true,
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [CommonModule, RouterLink, RouterLinkActive],
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Input() navSections: NavSection[] = [
    {
      title: 'Main',
      items: [
        { label: 'Dashboard', icon: '📊', route: '/dashboard' },
        { label: 'Employees', icon: '👥', route: '/employees' },
        { label: 'Contracts', icon: '📋', route: '/contracts' }
      ]
    },
    {
      title: 'Settings',
      items: [
        { label: 'Profile', icon: '👤', route: '/profile' },
        { label: 'Settings', icon: '⚙️', route: '/settings' }
      ]
    }
  ];

  @Output() closeSidebar = new EventEmitter<void>();

  /**
   * Handle sidebar close
   */
  onCloseSidebar(): void {
    this.closeSidebar.emit();
  }

}


