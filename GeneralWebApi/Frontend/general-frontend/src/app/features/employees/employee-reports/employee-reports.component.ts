// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/employees/employee-reports/employee-reports.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, catchError, of } from 'rxjs';
import { BaseButtonComponent } from '../../../Shared/components/base/base-button/base-button.component';
import { BaseCardComponent } from '../../../Shared/components/base/base-card/base-card.component';
import { BaseTableComponent } from '../../../Shared/components/base/base-table/base-table.component';
import { BaseAsyncStateComponent } from '../../../Shared/components/base/base-async-state/base-async-state.component';
import { EmployeeService } from '@core/services/employee.service';
import { NotificationService } from '../../../Shared/services/notification.service';
import { Employee } from 'app/contracts/employees/employee.model';
import { TableColumn, TableAction } from '../../../Shared/components/base';

@Component({
  selector: 'app-employee-reports',
  standalone: true,
  imports: [
    CommonModule,
    BaseTableComponent,
    BaseAsyncStateComponent,
  ],
  templateUrl: './employee-reports.component.html',
  styleUrls: ['./employee-reports.component.scss'],
})
export class EmployeeReportsComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  private notificationService = inject(NotificationService);

  // Employee data state - using BehaviorSubject for Observable compatibility
  employees$ = new BehaviorSubject<Employee[]>([]);
  loading$ = new BehaviorSubject<boolean>(false);
  error$ = new BehaviorSubject<string | null>(null);
  

  // Table columns for employee data
  employeeColumns: TableColumn[] = [
    { key: 'firstName', label: 'First Name', sortable: true },
    { key: 'lastName', label: 'Last Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'employeeNumber', label: 'Employee Number', sortable: true },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'position', label: 'Position', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
  ];

  // Table actions
  employeeActions: TableAction[] = [
    {
      label: 'View',
      icon: 'visibility',
      variant: 'ghost',
      showLabel: false,
      onClick: (item: unknown) => this.viewEmployee(item as Employee),
    },
  ];

  ngOnInit(): void {
    this.loadEmployees();
  }

  /**
   * Load employees from backend
   */
  loadEmployees(): void {
    this.loading$.next(true);
    this.error$.next(null);

    this.employeeService.getEmployees({
      pageNumber: 1,
      pageSize: 100, // Load first 100 employees for testing
    }).pipe(
      catchError(err => {
        const errorMessage = err.message || 'Failed to load employees';
        this.error$.next(errorMessage);
        this.loading$.next(false);
        
        this.notificationService.error(
          'Load Failed',
          errorMessage,
          {
            duration: 5000,
            persistent: false,
            autoClose: true,
          }
        );
        
        return of(null);
      })
    ).subscribe({
      next: (response) => {
        if (response?.data) {
          this.employees$.next(response.data);
          this.notificationService.success(
            'Data Loaded',
            `Successfully loaded ${response.data.length} employee(s)`,
            {
              duration: 3000,
              autoClose: true,
            }
          );
        }
        this.loading$.next(false);
      }
    });
  }

  /**
   * View employee details
   */
  viewEmployee(employee: Employee): void {
    this.notificationService.info(
      'View Employee',
      `Viewing ${employee.firstName} ${employee.lastName}`,
      {
        duration: 3000,
        autoClose: true,
      }
    );
  }

  /**
   * Generate report (reload data)
   */
  generateReport(reportType: string): void {
    this.loadEmployees();
    this.notificationService.info(
      'Report Generated',
      `${reportType} report has been generated successfully.`,
      {
        duration: 3000,
        autoClose: true,
      }
    );
  }

  /**
   * Retry loading employees
   */
  onRetryLoad = (): void => {
    this.loadEmployees();
  };
}
