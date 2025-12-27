// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/breadcrumb/breadcrumb.component.ts
import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  NavigationEnd,
  ActivatedRoute,
  RouterModule,
} from '@angular/router';
import { filter, map, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { TranslationService } from '@core/services/translation.service';

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
  imports: [CommonModule, RouterModule],
})
export class BreadcrumbComponent implements OnInit, OnDestroy {
  @Input() customBreadcrumbs: BreadcrumbItem[] = [];

  breadcrumbs: BreadcrumbItem[] = [];

  // Inject services using inject() function
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private translationService = inject(TranslationService);
  private destroy$ = new Subject<void>();

  // Route to breadcrumb mapping (using translation keys)
  private getRouteMap(): Record<string, Array<{ labelKey: string; icon: string }>> {
    return {
      '/private/dashboard': [{ labelKey: 'breadcrumb.dashboard', icon: 'dashboard' }],
      '/private/tasks': [{ labelKey: 'breadcrumb.tasks', icon: 'task_alt' }],
      '/private/approvals': [{ labelKey: 'breadcrumb.myApprovals', icon: 'approval' }],
      '/private/notifications': [
        { labelKey: 'breadcrumb.notifications', icon: 'notifications' },
      ],
      '/private/employees': [
        { labelKey: 'breadcrumb.hrManagement', icon: 'people' },
        { labelKey: 'breadcrumb.employeeList', icon: 'people' },
      ],
      '/private/departments': [
        { labelKey: 'breadcrumb.hrManagement', icon: 'people' },
        { labelKey: 'breadcrumb.departments', icon: 'business' },
      ],
      '/private/positions': [
        { labelKey: 'breadcrumb.hrManagement', icon: 'people' },
        { labelKey: 'breadcrumb.positions', icon: 'work' },
      ],
      '/private/onboarding': [
        { labelKey: 'breadcrumb.hrManagement', icon: 'people' },
        { labelKey: 'breadcrumb.onboarding', icon: 'person_add' },
      ],
      '/private/contracts': [
        { labelKey: 'breadcrumb.contractManagement', icon: 'description' },
        { labelKey: 'breadcrumb.contracts', icon: 'description' },
      ],
      '/private/contract-approvals': [
        { labelKey: 'breadcrumb.contractManagement', icon: 'description' },
        { labelKey: 'breadcrumb.contractApprovals', icon: 'check_circle' },
      ],
      '/private/contract-templates': [
        { labelKey: 'breadcrumb.contractManagement', icon: 'description' },
        { labelKey: 'breadcrumb.contractTemplates', icon: 'content_copy' },
      ],
      '/private/contract-reminders': [
        { labelKey: 'breadcrumb.contractManagement', icon: 'description' },
        { labelKey: 'breadcrumb.expiryReminders', icon: 'schedule' },
      ],
      '/private/identity-documents': [
        { labelKey: 'breadcrumb.documentCenter', icon: 'folder' },
        { labelKey: 'breadcrumb.identityDocuments', icon: 'badge' },
      ],
      '/private/education': [
        { labelKey: 'breadcrumb.documentCenter', icon: 'folder' },
        { labelKey: 'breadcrumb.education', icon: 'school' },
      ],
      '/private/certifications': [
        { labelKey: 'breadcrumb.documentCenter', icon: 'folder' },
        { labelKey: 'breadcrumb.certifications', icon: 'emoji_events' },
      ],
      '/private/company-documents': [
        { labelKey: 'breadcrumb.documentCenter', icon: 'folder' },
        { labelKey: 'breadcrumb.companyDocuments', icon: 'folder' },
      ],
      '/private/users': [
        { labelKey: 'breadcrumb.systemManagement', icon: 'settings' },
        { labelKey: 'breadcrumb.users', icon: 'person' },
      ],
      '/private/roles': [
        { labelKey: 'breadcrumb.systemManagement', icon: 'settings' },
        { labelKey: 'breadcrumb.roles', icon: 'key' },
      ],
      '/private/permissions': [
        { labelKey: 'breadcrumb.systemManagement', icon: 'settings' },
        { labelKey: 'breadcrumb.permissions', icon: 'security' },
      ],
      '/private/settings': [
        { labelKey: 'breadcrumb.systemManagement', icon: 'settings' },
        { labelKey: 'breadcrumb.settings', icon: 'settings' },
      ],
      '/private/audit-logs': [
        { labelKey: 'breadcrumb.monitoringAudit', icon: 'monitor' },
        { labelKey: 'breadcrumb.auditLogs', icon: 'history' },
      ],
      '/private/system-monitor': [
        { labelKey: 'breadcrumb.monitoringAudit', icon: 'monitor' },
        { labelKey: 'breadcrumb.systemMonitor', icon: 'monitor' },
      ],
      '/private/security-audit': [
        { labelKey: 'breadcrumb.monitoringAudit', icon: 'monitor' },
        { labelKey: 'breadcrumb.securityAudit', icon: 'shield' },
      ],
      '/private/backup': [
        { labelKey: 'breadcrumb.monitoringAudit', icon: 'monitor' },
        { labelKey: 'breadcrumb.backupRecovery', icon: 'backup' },
      ],
    };
  }

  ngOnInit(): void {
    // Wait for translations to load before initializing breadcrumbs
    this.translationService.getTranslationsLoaded$().pipe(
      distinctUntilChanged(),
      filter(loaded => loaded),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      // Listen to route changes
      this.router.events
        .pipe(
          filter(event => event instanceof NavigationEnd),
          map(() => this.activatedRoute),
          takeUntil(this.destroy$)
        )
        .subscribe(() => {
          this.updateBreadcrumbs();
        });

      // Initial breadcrumb update
      this.updateBreadcrumbs();
    });
  }

  private updateBreadcrumbs(): void {
    if (this.customBreadcrumbs.length > 0) {
      // Translate custom breadcrumbs if they contain translation keys
      this.breadcrumbs = this.customBreadcrumbs.map(item => ({
        ...item,
        label: this.translationService.translate(item.label) || item.label
      }));
      return;
    }

    const url = this.router.url;
    const routeMap = this.getRouteMap();
    const routeConfig = routeMap[url] || [
      { labelKey: 'breadcrumb.dashboard', icon: 'dashboard' },
    ];

    // Translate breadcrumb labels
    this.breadcrumbs = routeConfig.map(config => ({
      label: this.translationService.translate(config.labelKey),
      icon: config.icon,
      route: this.getRouteForBreadcrumb(config.labelKey)
    }));
  }

  /**
   * Get route path for breadcrumb item based on translation key
   */
  private getRouteForBreadcrumb(labelKey: string): string | undefined {
    const routeMap: Record<string, string> = {
      'breadcrumb.dashboard': '/private/dashboard',
      'breadcrumb.tasks': '/private/tasks',
      'breadcrumb.myApprovals': '/private/approvals',
      'breadcrumb.notifications': '/private/notifications',
      'breadcrumb.hrManagement': '/private/employees',
      'breadcrumb.employeeList': '/private/employees',
      'breadcrumb.departments': '/private/departments',
      'breadcrumb.positions': '/private/positions',
      'breadcrumb.onboarding': '/private/onboarding',
      'breadcrumb.contractManagement': '/private/contracts',
      'breadcrumb.contracts': '/private/contracts',
      'breadcrumb.contractApprovals': '/private/contract-approvals',
      'breadcrumb.contractTemplates': '/private/contract-templates',
      'breadcrumb.expiryReminders': '/private/contract-reminders',
      'breadcrumb.documentCenter': '/private/identity-documents',
      'breadcrumb.identityDocuments': '/private/identity-documents',
      'breadcrumb.education': '/private/education',
      'breadcrumb.certifications': '/private/certifications',
      'breadcrumb.companyDocuments': '/private/company-documents',
      'breadcrumb.systemManagement': '/private/users',
      'breadcrumb.users': '/private/users',
      'breadcrumb.roles': '/private/roles',
      'breadcrumb.permissions': '/private/permissions',
      'breadcrumb.settings': '/private/settings',
      'breadcrumb.monitoringAudit': '/private/audit-logs',
      'breadcrumb.auditLogs': '/private/audit-logs',
      'breadcrumb.systemMonitor': '/private/system-monitor',
      'breadcrumb.securityAudit': '/private/security-audit',
      'breadcrumb.backupRecovery': '/private/backup',
    };
    return routeMap[labelKey];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
