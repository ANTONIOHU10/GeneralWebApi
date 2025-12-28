// Path: GeneralWebApi/Frontend/general-frontend/src/app/shared/components/sidebar/sidebar.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslationService } from '@core/services/translation.service';
import { TranslatePipe } from '@core/pipes/translate.pipe';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
}

export interface NavSection {
  title: string; // Translation key, not translated text
  items: NavItem[];
  expandable?: boolean;
  expanded?: boolean;
}

@Component({
  standalone: true,
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule, TranslatePipe],
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  searchQuery = '';
  filteredSections: NavSection[] = [];
  
  private translationService = inject(TranslationService);
  private destroy$ = new Subject<void>();

  @Input() navSections: NavSection[] = [
    {
      title: 'sidebar.workspace',
      items: [
        { label: 'sidebar.dashboard', icon: 'dashboard', route: '/private/dashboard' },
        { label: 'sidebar.tasks', icon: 'task_alt', route: '/private/tasks' },
        {
          label: 'sidebar.myApprovals',
          icon: 'approval',
          route: '/private/approvals',
        },
        {
          label: 'sidebar.notifications',
          icon: 'notifications',
          route: '/private/notifications',
        },
      ],
      expandable: true,
      expanded: false,
    },
    {
      title: 'sidebar.hrManagement',
      items: [
        { label: 'sidebar.employees', icon: 'people', route: '/private/employees' },
        {
          label: 'sidebar.departments',
          icon: 'business',
          route: '/private/departments',
        },
        { label: 'sidebar.positions', icon: 'work', route: '/private/positions' },
      ],
      expandable: true,
      expanded: false,
    },
    {
      title: 'sidebar.contractManagement',
      items: [
        {
          label: 'sidebar.contracts',
          icon: 'description',
          route: '/private/contracts',
        },
        {
          label: 'sidebar.contractApprovals',
          icon: 'check_circle',
          route: '/private/contract-approvals',
        },
        {
          label: 'sidebar.contractTemplates',
          icon: 'content_copy',
          route: '/private/contract-templates',
        },
        {
          label: 'sidebar.contractReminders',
          icon: 'schedule',
          route: '/private/contract-reminders',
        },
      ],
      expandable: true,
      expanded: false,
    },
    {
      title: 'sidebar.systemManagement',
      items: [
        { label: 'sidebar.users', icon: 'person', route: '/private/users' },
        { label: 'sidebar.roles', icon: 'key', route: '/private/roles' },
        {
          label: 'sidebar.permissions',
          icon: 'security',
          route: '/private/permissions',
        },
      ],
      expandable: true,
      expanded: false,
    },
    {
      title: 'sidebar.monitoringAudit',
      items: [
        { label: 'sidebar.auditLogs', icon: 'history', route: '/private/audit-logs' },
        {
          label: 'sidebar.systemMonitor',
          icon: 'monitor',
          route: '/private/system-monitor',
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
    this.applyTranslations();
    
    // Listen to language changes
    this.translationService.getTranslationsLoaded$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.applyTranslations();
      });
  }

  /**
   * Apply translations to navigation sections
   * Note: We keep the original translation keys and let the template handle translation
   * This prevents issues when translations reload
   */
  private applyTranslations(): void {
    if (!this.translationService.isLoaded()) {
      // Wait a bit for translations to load
      setTimeout(() => this.applyTranslations(), 100);
      return;
    }

    // Keep original translation keys, don't replace them
    // The template will handle translation via translate pipe
    this.filteredSections = [...this.navSections];

    // Update search if there's a query
    if (this.searchQuery.trim()) {
      this.onSearchChange();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Get search placeholder text
   */
  getSearchPlaceholder(): string {
    return this.translationService.translate('common.search') + '...';
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
      this.applyTranslations();
      return;
    }

    const query = this.searchQuery.toLowerCase();
    // Translate for search comparison only, but keep original keys in the result
    this.filteredSections = this.navSections
      .map(section => {
        const translatedTitle = this.translationService.translate(section.title);
        const filteredItems = section.items.filter(item => {
          const translatedLabel = this.translationService.translate(item.label);
          return (
            translatedLabel.toLowerCase().includes(query) ||
            translatedTitle.toLowerCase().includes(query)
          );
        });

        if (filteredItems.length > 0) {
          // Keep original translation keys, not translated text
          return { ...section, items: filteredItems, expanded: true };
        }
        return null;
      })
      .filter(section => section !== null) as NavSection[];
  }
}
