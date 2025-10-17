// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/breadcrumb/breadcrumb.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, ActivatedRoute, RouterModule } from '@angular/router';
import { filter, map } from 'rxjs/operators';

export interface BreadcrumbItem {
  label: string;
  route?: string;
  icon?: string;
}

@Component({
  standalone: true,
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
  imports: [CommonModule, RouterModule]
})
export class BreadcrumbComponent implements OnInit {
  @Input() customBreadcrumbs: BreadcrumbItem[] = [];
  
  breadcrumbs: BreadcrumbItem[] = [];
  
  // Route to breadcrumb mapping
  private routeMap: { [key: string]: BreadcrumbItem[] } = {
    '/private/dashboard': [
      { label: 'Dashboard', icon: 'dashboard' }
    ],
    '/private/tasks': [
      { label: 'Tasks', icon: 'task_alt' }
    ],
    '/private/approvals': [
      { label: 'My Approvals', icon: 'approval' }
    ],
    '/private/notifications': [
      { label: 'Notifications', icon: 'notifications' }
    ],
    '/private/employees': [
      { label: 'HR Management', icon: 'people' },
      { label: 'Employee List', icon: 'people' }
    ],
    '/private/departments': [
      { label: 'HR Management', icon: 'people' },
      { label: 'Departments', icon: 'business' }
    ],
    '/private/positions': [
      { label: 'HR Management', icon: 'people' },
      { label: 'Positions', icon: 'work' }
    ],
    '/private/onboarding': [
      { label: 'HR Management', icon: 'people' },
      { label: 'Onboarding', icon: 'person_add' }
    ],
    '/private/contracts': [
      { label: 'Contract Management', icon: 'description' },
      { label: 'Contracts', icon: 'description' }
    ],
    '/private/contract-approvals': [
      { label: 'Contract Management', icon: 'description' },
      { label: 'Contract Approvals', icon: 'check_circle' }
    ],
    '/private/contract-templates': [
      { label: 'Contract Management', icon: 'description' },
      { label: 'Contract Templates', icon: 'content_copy' }
    ],
    '/private/contract-reminders': [
      { label: 'Contract Management', icon: 'description' },
      { label: 'Expiry Reminders', icon: 'schedule' }
    ],
    '/private/identity-documents': [
      { label: 'Document Center', icon: 'folder' },
      { label: 'Identity Documents', icon: 'badge' }
    ],
    '/private/education': [
      { label: 'Document Center', icon: 'folder' },
      { label: 'Education', icon: 'school' }
    ],
    '/private/certifications': [
      { label: 'Document Center', icon: 'folder' },
      { label: 'Certifications', icon: 'emoji_events' }
    ],
    '/private/company-documents': [
      { label: 'Document Center', icon: 'folder' },
      { label: 'Company Documents', icon: 'folder' }
    ],
    '/private/users': [
      { label: 'System Management', icon: 'settings' },
      { label: 'Users', icon: 'person' }
    ],
    '/private/roles': [
      { label: 'System Management', icon: 'settings' },
      { label: 'Roles', icon: 'key' }
    ],
    '/private/permissions': [
      { label: 'System Management', icon: 'settings' },
      { label: 'Permissions', icon: 'security' }
    ],
    '/private/settings': [
      { label: 'System Management', icon: 'settings' },
      { label: 'Settings', icon: 'settings' }
    ],
    '/private/audit-logs': [
      { label: 'Monitoring & Audit', icon: 'monitor' },
      { label: 'Audit Logs', icon: 'history' }
    ],
    '/private/system-monitor': [
      { label: 'Monitoring & Audit', icon: 'monitor' },
      { label: 'System Monitor', icon: 'monitor' }
    ],
    '/private/security-audit': [
      { label: 'Monitoring & Audit', icon: 'monitor' },
      { label: 'Security Audit', icon: 'shield' }
    ],
    '/private/backup': [
      { label: 'Monitoring & Audit', icon: 'monitor' },
      { label: 'Backup & Recovery', icon: 'backup' }
    ]
  };

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Listen to route changes
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.activatedRoute)
      )
      .subscribe(() => {
        this.updateBreadcrumbs();
      });

    // Initial breadcrumb update
    this.updateBreadcrumbs();
  }

  private updateBreadcrumbs(): void {
    if (this.customBreadcrumbs.length > 0) {
      this.breadcrumbs = [...this.customBreadcrumbs];
      return;
    }

    const url = this.router.url;
    this.breadcrumbs = this.routeMap[url] || [
      { label: 'Dashboard', icon: 'dashboard' }
    ];
  }

  /**
   * Navigate to breadcrumb route
   */
  navigateTo(item: BreadcrumbItem): void {
    if (item.route) {
      this.router.navigate([item.route]);
    }
  }

  /**
   * Check if breadcrumb item is clickable
   */
  isClickable(item: BreadcrumbItem): boolean {
    return !!item.route;
  }
}
