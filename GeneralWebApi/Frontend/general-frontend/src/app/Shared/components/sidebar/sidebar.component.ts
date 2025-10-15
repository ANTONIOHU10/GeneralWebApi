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
      title: '🏠 Workspace',
      items: [
        { label: 'Dashboard', icon: '📊', route: '/private/dashboard' },
        { label: 'Tasks', icon: '✅', route: '/private/tasks' },
        { label: 'My Approvals', icon: '📋', route: '/private/approvals' },
        { label: 'Notifications', icon: '🔔', route: '/private/notifications' }
      ]
    },
    {
      title: '👥 HR Management',
      items: [
        { label: 'Employees', icon: '👤', route: '/private/employees' },
        { label: 'Departments', icon: '🏢', route: '/private/departments' },
        { label: 'Positions', icon: '💼', route: '/private/positions' },
        { label: 'Onboarding', icon: '📝', route: '/private/onboarding' }
      ]
    },
    {
      title: '📄 Contract Management',
      items: [
        { label: 'Contracts', icon: '📋', route: '/private/contracts' },
        { label: 'Contract Approvals', icon: '✅', route: '/private/contract-approvals' },
        { label: 'Contract Templates', icon: '📝', route: '/private/contract-templates' },
        { label: 'Expiry Reminders', icon: '⏰', route: '/private/contract-reminders' }
      ]
    },
    {
      title: '📁 Document Center',
      items: [
        { label: 'Identity Documents', icon: '🆔', route: '/private/identity-documents' },
        { label: 'Education', icon: '🎓', route: '/private/education' },
        { label: 'Certifications', icon: '🏆', route: '/private/certifications' },
        { label: 'Company Documents', icon: '📚', route: '/private/company-documents' }
      ]
    },
    {
      title: '⚙️ System Management',
      items: [
        { label: 'Users', icon: '👤', route: '/private/users' },
        { label: 'Roles', icon: '🔑', route: '/private/roles' },
        { label: 'Permissions', icon: '🛡️', route: '/private/permissions' },
        { label: 'Settings', icon: '⚙️', route: '/private/settings' }
      ]
    },
    {
      title: '📊 Monitoring & Audit',
      items: [
        { label: 'Audit Logs', icon: '📝', route: '/private/audit-logs' },
        { label: 'System Monitor', icon: '📊', route: '/private/system-monitor' },
        { label: 'Security Audit', icon: '🔒', route: '/private/security-audit' },
        { label: 'Backup & Recovery', icon: '💾', route: '/private/backup' }
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


