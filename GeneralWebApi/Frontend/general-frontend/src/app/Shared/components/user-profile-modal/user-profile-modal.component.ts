// Path: GeneralWebApi/Frontend/general-frontend/src/app/Shared/components/user-profile-modal/user-profile-modal.component.ts
import { Component, Input, Output, EventEmitter, signal, computed, OnInit, ViewChild, TemplateRef, AfterViewInit, OnChanges, SimpleChanges, inject } from '@angular/core';
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
import { catchError, of, take } from 'rxjs';

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
  ],
  templateUrl: './user-profile-modal.component.html',
  styleUrls: ['./user-profile-modal.component.scss'],
})
export class UserProfileModalComponent implements OnInit, AfterViewInit, OnChanges {
  // Services
  private authService = inject(AuthService);
  private tokenService = inject(TokenService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private dialogService = inject(DialogService);

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
    this.updateSections();
  }

  ngAfterViewInit(): void {
    // Sections are already updated in ngOnInit
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Update sections when employee or user data changes
    if (changes['employee'] || changes['user']) {
      this.updateSections();
    }
  }

  /**
   * Update detail sections based on current data
   */
  private updateSections(): void {
    const sections: DetailSection[] = [];

    // User Information section (only if user data is available)
    if (this.user) {
      sections.push({
        title: 'User Information',
        fields: [
          { label: 'Username', value: this.user.userName || 'N/A', type: 'text' },
          { label: 'Email', value: this.user.email || 'N/A', type: 'text' },
          { label: 'Phone', value: this.user.phoneNumber || 'N/A', type: 'text' },
          { 
            label: 'Role', 
            value: this.user.roles && this.user.roles.length > 0 ? this.user.roles[0] : 'User', 
            type: 'badge', 
            badgeVariant: this.getRoleVariant() 
          },
          { label: 'Account Created', value: this.user.createdAt || null, type: 'date' },
          { label: 'Last Login', value: this.user.lastLoginAt || null, type: 'date' },
        ],
      });
    }

    // Employee Information sections (only if employee data is available)
    if (this.employee) {
      sections.push({
        title: 'Basic Information',
        fields: [
          { label: 'Full Name', value: this.getFullName(), type: 'text' },
          { label: 'Employee Number', value: this.employee.employeeNumber || 'N/A', type: 'text' },
          { label: 'Position', value: this.employee.position || 'N/A', type: 'text' },
          { label: 'Department', value: this.employee.department || 'N/A', type: 'text' },
          { label: 'Manager', value: this.employee.managerName || 'N/A', type: 'text' },
          { label: 'Hire Date', value: this.employee.hireDate || null, type: 'date' },
          { label: 'Employment Type', value: this.employee.employmentType || 'N/A', type: 'text' },
          { 
            label: 'Status', 
            value: this.employee.status || 'N/A', 
            type: 'badge', 
            badgeVariant: this.getStatusVariant() 
          },
          { 
            label: 'Working Hours/Week', 
            value: this.employee.workingHoursPerWeek ? `${this.employee.workingHoursPerWeek} hours` : 'N/A', 
            type: 'text' 
          },
        ],
      });

      sections.push({
        title: 'Contact Information',
        fields: [
          { label: 'Work Email', value: this.employee.email || 'N/A', type: 'text' },
          { label: 'Phone', value: this.employee.phone || 'N/A', type: 'text' },
          { label: 'Address', value: this.getFormattedAddress(), type: 'text' },
        ],
      });

      if (this.employee.salary) {
        sections.push({
          title: 'Compensation',
          fields: [
            { 
              label: 'Salary', 
              value: this.formatCurrency(this.employee.salary || 0, this.employee.salaryCurrency || 'USD'), 
              type: 'text' 
            },
          ],
        });
      }

      if (this.employee.emergencyContact?.name) {
        sections.push({
          title: 'Emergency Contact',
          fields: [
            { label: 'Name', value: this.employee.emergencyContact.name, type: 'text' },
            { label: 'Phone', value: this.employee.emergencyContact.phone || 'N/A', type: 'text' },
            { label: 'Relation', value: this.employee.emergencyContact.relation || 'N/A', type: 'text' },
          ],
        });
      }

      if (this.employee.taxCode) {
        sections.push({
          title: 'Additional Information',
          fields: [
            { label: 'Tax Code', value: this.employee.taxCode, type: 'text' },
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
  formatCurrency(amount: number, currency: string = 'USD'): string {
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
      title: 'Confirm Logout',
      message: 'Are you sure you want to logout?',
      confirmText: 'Logout',
      cancelText: 'Cancel',
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
   */
  private performLocalLogout(): void {
    // Prevent duplicate calls
    if (!this.isLoggingOut) {
      return;
    }

    // Clear all tokens
    this.tokenService.clearAllTokens();

    // Clear any other user-related data
    localStorage.removeItem('remember_me');

    // Show success notification
    this.notificationService.success(
      'Logout Successful',
      'You have been logged out successfully'
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
}

