// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/dashboard/dashboard.component.ts
import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin, catchError, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  BasePrivatePageContainerComponent,
  BaseCardComponent,
  BaseButtonComponent,
} from '../../Shared/components/base';
import { TranslatePipe } from '@core/pipes/translate.pipe';
import { EmployeeService } from '@core/services/employee.service';
import { ContractService } from '@core/services/contract.service';
import { DepartmentService } from '@core/services/department.service';
import { ContractApprovalService } from '@core/services/contract-approval.service';
import { AuditLogService } from '@core/services/audit-log.service';
import { ApiResponse } from 'app/contracts/common/api-response';

interface Activity {
  icon: string;
  text: string;
  time: string;
}

// Extended ApiResponse with pagination support
interface ApiResponseWithPagination<T> extends ApiResponse<T> {
  pagination?: {
    totalItems: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
  };
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    BasePrivatePageContainerComponent,
    BaseCardComponent,
    BaseButtonComponent,
    TranslatePipe,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  private contractService = inject(ContractService);
  private departmentService = inject(DepartmentService);
  private approvalService = inject(ContractApprovalService);
  private auditLogService = inject(AuditLogService);
  private router = inject(Router);

  // Statistics signals
  totalEmployees = signal<number>(0);
  activeContracts = signal<number>(0);
  totalDepartments = signal<number>(0);
  pendingApprovals = signal<number>(0);
  recentActivities = signal<Activity[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  /**
   * Load all dashboard data from services
   */
  loadDashboardData(): void {
    this.isLoading.set(true);

    // Load statistics in parallel
    forkJoin({
      employees: this.employeeService
        .getEmployees({ pageNumber: 1, pageSize: 1 })
        .pipe(
          map((response) => (response as ApiResponseWithPagination<unknown>).pagination?.totalItems || 0),
          catchError(() => of(0))
        ),
      activeContracts: this.contractService
        .getContractsByStatus('Active')
        .pipe(
          map((contracts) => contracts.length),
          catchError(() => of(0))
        ),
      departments: this.departmentService
        .getDepartments({ pageNumber: 1, pageSize: 1 })
        .pipe(
          map((response) => (response as ApiResponseWithPagination<unknown>).pagination?.totalItems || 0),
          catchError(() => of(0))
        ),
      pendingApprovals: this.approvalService
        .getPendingApprovals({ pageNumber: 1, pageSize: 1 })
        .pipe(
          map((response) => (response as ApiResponseWithPagination<unknown>).pagination?.totalItems || 0),
          catchError(() => of(0))
        ),
      auditLogs: this.auditLogService
        .getAuditLogs({ pageNumber: 1, pageSize: 10 })
        .pipe(
          map((result) => result.items || []),
          catchError(() => of([]))
        ),
    }).subscribe({
      next: (data) => {
        this.totalEmployees.set(data.employees);
        this.activeContracts.set(data.activeContracts);
        this.totalDepartments.set(data.departments);
        this.pendingApprovals.set(data.pendingApprovals);
        this.recentActivities.set(
          this.transformAuditLogsToActivities(data.auditLogs)
        );
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load dashboard data:', error);
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Transform audit logs to activity format
   */
  private transformAuditLogsToActivities(
    auditLogs: any[]
  ): Activity[] {
    return auditLogs.map((log) => {
      const icon = this.getActivityIcon(log.action, log.entityType);
      const text = this.getActivityText(log);
      const time = this.formatTimeAgo(log.createdAt);
      return { icon, text, time };
    });
  }

  /**
   * Get appropriate icon for activity based on action and entity type
   */
  private getActivityIcon(action: string, entityType: string): string {
    const actionLower = action.toLowerCase();
    const entityLower = entityType.toLowerCase();

    if (entityLower.includes('employee')) {
      return 'person';
    } else if (entityLower.includes('contract')) {
      return 'description';
    } else if (entityLower.includes('department')) {
      return 'business';
    } else if (entityLower.includes('position')) {
      return 'work';
    } else if (actionLower.includes('login') || actionLower.includes('auth')) {
      return 'security';
    } else if (actionLower.includes('permission') || actionLower.includes('role')) {
      return 'key';
    }
    return 'history';
  }

  /**
   * Generate activity text from audit log
   */
  private getActivityText(log: any): string {
    const action = log.action || 'Action';
    const entityName = log.entityName || log.entityType || 'item';
    const userName = log.userName || 'User';

    // Format based on action type
    if (action.toLowerCase().includes('create') || action.toLowerCase().includes('add')) {
      return `${action} ${entityName} by ${userName}`;
    } else if (action.toLowerCase().includes('update') || action.toLowerCase().includes('modify')) {
      return `${action} ${entityName} by ${userName}`;
    } else if (action.toLowerCase().includes('delete') || action.toLowerCase().includes('remove')) {
      return `${action} ${entityName} by ${userName}`;
    }
    return `${action} on ${entityName} by ${userName}`;
  }

  /**
   * Format timestamp to relative time (e.g., "2 hours ago")
   */
  private formatTimeAgo(timestamp: string): string {
    if (!timestamp) return 'Unknown time';
    
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    // Format as date if older than a week
    return time.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: time.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }

  /**
   * Navigation methods
   */
  navigateToEmployees(): void {
    this.router.navigate(['/private/employees']);
  }

  navigateToContracts(): void {
    this.router.navigate(['/private/contracts']);
  }

  navigateToDepartments(): void {
    this.router.navigate(['/private/departments']);
  }

  navigateToApprovals(): void {
    this.router.navigate(['/private/contract-approvals']);
  }

  navigateToAuditLogs(): void {
    this.router.navigate(['/private/audit-logs']);
  }
}
