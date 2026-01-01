// Path: GeneralWebApi/Frontend/general-frontend/src/app/Shared/components/user-profile-modal/user-profile-modal.component.ts
import { Component, Input, Output, EventEmitter, signal, computed, OnInit, ViewChild, TemplateRef, AfterViewInit, OnChanges, SimpleChanges, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  BaseDetailComponent,
  BaseCardComponent,
  BaseAvatarComponent,
  BaseBadgeComponent,
  BaseButtonComponent,
  DetailSection,
  DetailField,
  BadgeVariant,
} from '../base';
import { Employee } from 'app/contracts/employees/employee.model';
import { User } from 'app/users/user.model';
import { AuthService } from '@core/services/auth.service';
import { TokenService } from '@core/services/token.service';
import { NotificationService } from '../../services/notification.service';
import { DialogService } from '../../services/dialog.service';
import { TranslationService } from '@core/services/translation.service';
import { TranslatePipe } from '@core/pipes/translate.pipe';
import { catchError, of, take, Subject } from 'rxjs';
import { distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';

/**
 * User Profile Modal Component
 * Displays user information and associated employee information in read-only detail format
 */
@Component({
  selector: 'app-user-profile-modal',
  standalone: true,
  imports: [
    CommonModule,
    BaseDetailComponent,
    BaseCardComponent,
    BaseAvatarComponent,
    BaseBadgeComponent,
    BaseButtonComponent,
    TranslatePipe,
  ],
  templateUrl: './user-profile-modal.component.html',
  styleUrls: ['./user-profile-modal.component.scss'],
})
export class UserProfileModalComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  // Services
  private authService = inject(AuthService);
  private tokenService = inject(TokenService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private dialogService = inject(DialogService);
  private translationService = inject(TranslationService);
  private destroy$ = new Subject<void>();

  @Input() employee: Employee | null = null;
  @Input() user: User | null = null;
  @Input() isOpen = false;
  @Output() closeEvent = new EventEmitter<void>();

  @ViewChild('customViewTemplate', { static: false }) customViewTemplate!: TemplateRef<any>;

  // Detail sections for BaseDetailComponent
  sections = signal<DetailSection[]>([]);

  // Loading state for logout
  logoutLoading = signal(false);
  
  // Flag to prevent duplicate logout calls
  private isLoggingOut = false;

  // Computed properties for safe template access
  userRole = computed(() => {
    if (this.user === null || this.user.roles === undefined || this.user.roles.length === 0) {
      return null;
    }
    return this.user.roles[0];
  });

  employeePosition = computed(() => {
    return this.employee?.position || null;
  });

  employeeDepartment = computed(() => {
    return this.employee?.department || null;
  });

  employeeStatus = computed(() => {
    return this.employee?.status || null;
  });

  employeeNumber = computed(() => {
    return this.employee?.employeeNumber || null;
  });

  ngOnInit(): void {
    // Wait for translations to load before updating sections
    this.translationService.getTranslationsLoaded$().pipe(
      distinctUntilChanged(),
      filter(loaded => loaded),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.updateSections();
    });
  }

  ngAfterViewInit(): void {
    // Sections are updated after translations load in ngOnInit
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Update sections when employee or user data changes, but only if translations are loaded
    if (changes['employee'] || changes['user']) {
      this.translationService.getTranslationsLoaded$().pipe(
        distinctUntilChanged(),
        filter(loaded => loaded),
        takeUntil(this.destroy$)
      ).subscribe(() => {
        this.updateSections();
      });
    }
  }

  /**
   * Update detail sections based on current data
   */
  private updateSections(): void {
    const sections: DetailSection[] = [];
    const t = (key: string) => this.translationService.translate(key);
    const na = t('common.notAvailable');

    // User Information section (only if user data is available)
    if (this.user) {
      sections.push({
        title: t('profile.sections.userInformation'),
        fields: [
          { label: t('profile.fields.username'), value: this.user.userName || na, type: 'text' },
          { label: t('profile.fields.email'), value: this.user.email || na, type: 'text' },
          { label: t('profile.fields.phone'), value: this.user.phoneNumber || na, type: 'text' },
          { 
            label: t('profile.fields.role'), 
            value: this.user.roles && this.user.roles.length > 0 ? this.user.roles[0] : t('profile.fields.defaultRole'), 
            type: 'badge', 
            badgeVariant: this.getRoleVariant() 
          },
          { label: t('profile.fields.accountCreated'), value: this.user.createdAt || null, type: 'date' },
          { label: t('profile.fields.lastLogin'), value: this.user.lastLoginAt || null, type: 'date' },
        ],
      });
    }

    // Employee Information sections (only if employee data is available)
    if (this.employee) {
      sections.push({
        title: t('profile.sections.basicInformation'),
        fields: [
          { label: t('profile.fields.fullName'), value: this.getFullName(), type: 'text' },
          { label: t('profile.fields.employeeNumber'), value: this.employee.employeeNumber || na, type: 'text' },
          { label: t('profile.fields.position'), value: this.employee.position || na, type: 'text' },
          { label: t('profile.fields.department'), value: this.employee.department || na, type: 'text' },
          { label: t('profile.fields.manager'), value: this.employee.managerName || na, type: 'text' },
          { label: t('profile.fields.hireDate'), value: this.employee.hireDate || null, type: 'date' },
          { label: t('profile.fields.employmentType'), value: this.employee.employmentType || na, type: 'text' },
          { 
            label: t('profile.fields.status'), 
            value: this.employee.status || na, 
            type: 'badge', 
            badgeVariant: this.getStatusVariant() 
          },
          { 
            label: t('profile.fields.workingHours'), 
            value: this.employee.workingHoursPerWeek ? `${this.employee.workingHoursPerWeek} ${t('profile.fields.hours')}` : na, 
            type: 'text' 
          },
        ],
      });

      sections.push({
        title: t('profile.sections.contactInformation'),
        fields: [
          { label: t('profile.fields.workEmail'), value: this.employee.email || na, type: 'text' },
          { label: t('profile.fields.phone'), value: this.employee.phone || na, type: 'text' },
          { label: t('profile.fields.address'), value: this.getFormattedAddress(), type: 'text' },
        ],
      });

      if (this.employee.salary) {
        sections.push({
          title: t('profile.sections.compensation'),
          fields: [
            { 
              label: t('profile.fields.salary'), 
              value: this.formatCurrency(this.employee.salary || 0, this.employee.salaryCurrency || 'USD'), 
              type: 'text' 
            },
          ],
        });
      }

      if (this.employee.emergencyContact?.name) {
        sections.push({
          title: t('profile.sections.emergencyContact'),
          fields: [
            { label: t('profile.fields.name'), value: this.employee.emergencyContact.name, type: 'text' },
            { label: t('profile.fields.phone'), value: this.employee.emergencyContact.phone || na, type: 'text' },
            { label: t('profile.fields.relation'), value: this.employee.emergencyContact.relation || na, type: 'text' },
          ],
        });
      }

      if (this.employee.taxCode) {
        sections.push({
          title: t('profile.sections.additionalInformation'),
          fields: [
            { label: t('profile.fields.taxCode'), value: this.employee.taxCode, type: 'text' },
          ],
        });
      }
    }

    this.sections.set(sections);
  }

  /**
   * Get full name from employee info
   */
  getFullName(): string {
    if (!this.employee) {
      // Fallback to user name if employee is not available
      if (this.user) {
        return `${this.user.firstName || ''} ${this.user.lastName || ''}`.trim() || this.user.userName || 'N/A';
      }
      return 'N/A';
    }
    return `${this.employee.firstName || ''} ${this.employee.lastName || ''}`.trim() || 'N/A';
  }

  /**
   * Get initials for avatar
   */
  getInitials(): string {
    if (this.employee) {
      const firstName = this.employee.firstName || '';
      const lastName = this.employee.lastName || '';
      if (firstName && lastName) {
        return `${firstName[0]}${lastName[0]}`.toUpperCase();
      }
    }
    if (this.user) {
      const firstName = this.user.firstName || '';
      const lastName = this.user.lastName || '';
      if (firstName && lastName) {
        return `${firstName[0]}${lastName[0]}`.toUpperCase();
      }
      if (this.user.userName) {
        return this.user.userName.substring(0, 2).toUpperCase();
      }
    }
    return 'NA';
  }

  /**
   * Get formatted address
   */
  getFormattedAddress(): string {
    if (!this.employee || !this.employee.address) {
      return 'N/A';
    }
    const addr = this.employee.address;
    const parts = [
      addr.street,
      addr.city,
      addr.state,
      addr.zipCode,
      addr.country,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'N/A';
  }

  /**
   * Get status variant for badge
   */
  getStatusVariant(): BadgeVariant {
    if (!this.employee || !this.employee.status) {
      return 'secondary';
    }
    switch (this.employee.status) {
      case 'Active':
        return 'success';
      case 'Inactive':
        return 'warning';
      case 'Terminated':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  /**
   * Get role variant for badge
   */
  getRoleVariant(): BadgeVariant {
    if (!this.user || !this.user.roles || this.user.roles.length === 0) {
      return 'secondary';
    }
    const role = this.user.roles[0].toLowerCase();
    switch (role) {
      case 'admin':
        return 'danger';
      case 'manager':
        return 'warning';
      case 'user':
        return 'primary';
      default:
        return 'secondary';
    }
  }

  /**
   * Get user role text for display
   */
  getUserRole(): string {
    if (this.user === null || this.user.roles === undefined || this.user.roles.length === 0) {
      return '';
    }
    return this.user.roles[0];
  }

  /**
   * Get employee position for display
   */
  getEmployeePosition(): string {
    return this.employee?.position || '';
  }

  /**
   * Get employee department for display
   */
  getEmployeeDepartment(): string {
    return this.employee?.department || '';
  }

  /**
   * Get employee status for display
   */
  getEmployeeStatus(): string {
    return this.employee?.status || '';
  }

  /**
   * Get employee number for display
   */
  getEmployeeNumber(): string {
    return this.employee?.employeeNumber || '';
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  /**
   * Get field value for display (used in template)
   */
  getFieldValue(field: DetailField): string {
    if (field.type === 'date') {
      return this.formatDate(field.value as string);
    }
    return field.value?.toString() || 'N/A';
  }

  /**
   * Get badge text (used in template)
   */
  getBadgeText(field: DetailField): string {
    return field.value?.toString() || 'N/A';
  }

  /**
   * Get badge variant (used in template)
   */
  getBadgeVariant(field: DetailField): BadgeVariant {
    return field.badgeVariant || 'secondary';
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string | number | null | undefined): string {
    if (!dateString) return 'N/A';
    if (typeof dateString === 'number') return dateString.toString();
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Handle modal close
   */
  onClose(): void {
    this.closeEvent.emit();
  }

  /**
   * Handle logout
   */
  onLogout(): void {
    // Prevent duplicate calls
    if (this.isLoggingOut) {
      return;
    }

    // Show confirmation dialog using DialogService
    this.dialogService.confirm({
      title: this.translationService.translate('profile.logout.confirmTitle'),
      message: this.translationService.translate('profile.logout.confirmMessage'),
      confirmText: this.translationService.translate('auth.logout'),
      cancelText: this.translationService.translate('common.cancel'),
      confirmVariant: 'danger',
      cancelVariant: 'outline',
      icon: 'logout',
      size: 'medium',
    }).pipe(
      take(1)
    ).subscribe({
      next: (confirmed) => {
        if (!confirmed) {
          // User cancelled
          return;
        }

        // User confirmed, proceed with logout
        this.isLoggingOut = true;
        this.logoutLoading.set(true);

        // Get refresh token
        const refreshToken = this.tokenService.getRefreshToken();

        if (refreshToken) {
          // Call backend logout API
          this.authService.logout({ refreshToken }).pipe(
            catchError((error) => {
              console.error('Logout API error:', error);
              // Return error to be handled in error callback
              return of(null);
            })
          ).subscribe({
            next: (result) => {
              // Only call performLocalLogout if not already called
              if (this.isLoggingOut) {
                console.log('Logout successful');
                this.performLocalLogout();
              }
            },
            error: (error) => {
              console.error('Logout error:', error);
              // Only call performLocalLogout if not already called
              if (this.isLoggingOut) {
                this.performLocalLogout();
              }
            }
          });
        } else {
          // No refresh token, perform local logout only
          console.log('No refresh token found, performing local logout');
          this.performLocalLogout();
        }
      },
      error: (error) => {
        console.error('Dialog error:', error);
      }
    });
  }

  /**
   * Perform local logout (clear tokens and redirect)
   * clearAllTokens() already clears all tokens, remembered username, and remember_me preference
   */
  private performLocalLogout(): void {
    // Prevent duplicate calls
    if (!this.isLoggingOut) {
      return;
    }

    // Clear all tokens, remembered username, and remember_me preference
    // This includes: access_token, refresh_token, remembered_username, remember_me
    this.tokenService.clearAllTokens();

    // Show success notification
    this.notificationService.success(
      this.translationService.translate('profile.logout.successTitle'),
      this.translationService.translate('profile.logout.successMessage')
    );

    // Close modal
    this.onClose();

    // Reset flag before navigation
    this.isLoggingOut = false;

    // Redirect to login page
    this.router.navigate(['/login']).then((success) => {
      if (success) {
        console.log('Redirected to login page');
      } else {
        console.error('Failed to redirect to login page');
      }
      this.logoutLoading.set(false);
    }).catch((error) => {
      console.error('Navigation error:', error);
      this.logoutLoading.set(false);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

