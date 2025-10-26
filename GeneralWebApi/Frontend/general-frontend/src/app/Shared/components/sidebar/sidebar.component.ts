// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/sidebar/sidebar.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
  expandable?: boolean;
  expanded?: boolean;
}

@Component({
  standalone: true,
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
})
export class SidebarComponent implements OnInit {
  @Input() isOpen = false;
  searchQuery = '';
  filteredSections: NavSection[] = [];

  @Input() navSections: NavSection[] = [
    {
      title: 'Workspace',
      items: [
        { label: 'Dashboard', icon: 'dashboard', route: '/private/dashboard' },
        { label: 'Tasks', icon: 'task_alt', route: '/private/tasks' },
        {
          label: 'My Approvals',
          icon: 'approval',
          route: '/private/approvals',
        },
        {
          label: 'Notifications',
          icon: 'notifications',
          route: '/private/notifications',
        },
      ],
      expandable: true,
      expanded: false,
    },
    {
      title: 'HR Management',
      items: [
        { label: 'Employee List', icon: 'people', route: '/private/employees' },
        {
          label: 'Departments',
          icon: 'business',
          route: '/private/departments',
        },
        { label: 'Positions', icon: 'work', route: '/private/positions' },
        {
          label: 'Onboarding',
          icon: 'person_add',
          route: '/private/onboarding',
        },
      ],
      expandable: true,
      expanded: false,
    },
    {
      title: 'Contract Management',
      items: [
        {
          label: 'Contracts',
          icon: 'description',
          route: '/private/contracts',
        },
        {
          label: 'Contract Approvals',
          icon: 'check_circle',
          route: '/private/contract-approvals',
        },
        {
          label: 'Contract Templates',
          icon: 'content_copy',
          route: '/private/contract-templates',
        },
        {
          label: 'Expiry Reminders',
          icon: 'schedule',
          route: '/private/contract-reminders',
        },
      ],
      expandable: true,
      expanded: false,
    },
    {
      title: 'Document Center',
      items: [
        {
          label: 'Identity Documents',
          icon: 'badge',
          route: '/private/identity-documents',
        },
        { label: 'Education', icon: 'school', route: '/private/education' },
        {
          label: 'Certifications',
          icon: 'emoji_events',
          route: '/private/certifications',
        },
        {
          label: 'Company Documents',
          icon: 'folder',
          route: '/private/company-documents',
        },
      ],
      expandable: true,
      expanded: false,
    },
    {
      title: 'System Management',
      items: [
        { label: 'Users', icon: 'person', route: '/private/users' },
        { label: 'Roles', icon: 'key', route: '/private/roles' },
        {
          label: 'Permissions',
          icon: 'security',
          route: '/private/permissions',
        },
        { label: 'Settings', icon: 'settings', route: '/private/settings' },
      ],
      expandable: true,
      expanded: false,
    },
    {
      title: 'Monitoring & Audit',
      items: [
        { label: 'Audit Logs', icon: 'history', route: '/private/audit-logs' },
        {
          label: 'System Monitor',
          icon: 'monitor',
          route: '/private/system-monitor',
        },
        {
          label: 'Security Audit',
          icon: 'shield',
          route: '/private/security-audit',
        },
        {
          label: 'Backup & Recovery',
          icon: 'backup',
          route: '/private/backup',
        },
      ],
      expandable: true,
      expanded: false,
    },
    {
      title: 'Development & Testing',
      items: [
        {
          label: 'Notification Demo',
          icon: 'notifications',
          route: '/private/notification-demo',
        },
        {
          label: 'Base Components Demo',
          icon: 'widgets',
          route: '/private/base-components-demo',
        },
      ],
      expandable: true,
      expanded: false,
    },
  ];

  @Output() closeSidebar = new EventEmitter<void>();

  constructor() {
    this.filteredSections = [];
  }

  ngOnInit(): void {
    this.filteredSections = [...this.navSections];
  }

  /**
   * Handle sidebar close
   */
  onCloseSidebar(): void {
    this.closeSidebar.emit();
  }

  /**
   * Toggle section expansion
   */
  toggleSection(section: NavSection): void {
    if (section.expandable) {
      section.expanded = !section.expanded;
    }
  }

  /**
   * Handle search input change
   */
  onSearchChange(): void {
    if (!this.searchQuery.trim()) {
      this.filteredSections = [...this.navSections];
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredSections = this.navSections
      .map(section => {
        const filteredItems = section.items.filter(item =>
          item.label.toLowerCase().includes(query)
        );

        if (filteredItems.length > 0) {
          return { ...section, items: filteredItems, expanded: true };
        }
        return null;
      })
      .filter(section => section !== null) as NavSection[];
  }
}
