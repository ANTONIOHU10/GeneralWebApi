// src/app/features/employees/employee-list/employee-list.component.ts
import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, from, Observable } from 'rxjs';
import { takeUntil, filter, take, switchMap, concatMap, delay } from 'rxjs/operators';
import { EmployeeCardComponent } from '../employee-card/employee-card.component';
import { AddEmployeeComponent } from '../add-employee/add-employee.component';
import { EmployeeReportsComponent } from '../employee-reports/employee-reports.component';
import { EmployeeSettingsComponent } from '../employee-settings/employee-settings.component';
import { SearchEmployeeComponent } from '../search-employee/search-employee.component';
import { EmployeeDetailComponent } from '../employee-detail/employee-detail.component';
import {
  BasePrivatePageContainerComponent,
  BaseSearchComponent,
  BaseAsyncStateComponent,
  TabItem,
} from '../../../Shared/components/base';
import { EmployeeFacade } from '@store/employee/employee.facade';
import { Employee } from 'app/contracts/employees/employee.model';
import {
  DialogService,
  NotificationService,
  LoadingService,
  OperationNotificationService,
} from '../../../Shared/services';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    EmployeeCardComponent,
    AddEmployeeComponent,
    EmployeeReportsComponent,
    EmployeeSettingsComponent,
    SearchEmployeeComponent,
    EmployeeDetailComponent,
    BasePrivatePageContainerComponent,
    BaseSearchComponent,
    BaseAsyncStateComponent,
  ],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss'],
})
export class EmployeeListComponent implements OnInit, OnDestroy {
  private employeeFacade = inject(EmployeeFacade);
  private dialogService = inject(DialogService);
  private notificationService = inject(NotificationService);
  private loadingService = inject(LoadingService);
  private operationNotification = inject(OperationNotificationService);
  private destroy$ = new Subject<void>();

  // Observable streams from NgRx store
  employees$ = this.employeeFacade.filteredEmployees$;
  loading$ = this.employeeFacade.loading$;
  error$ = this.employeeFacade.error$;
  pagination$ = this.employeeFacade.pagination$;
  filters$ = this.employeeFacade.filters$;
  operationInProgress$ = this.employeeFacade.operationInProgress$;

  // Local state
  activeTab = signal<'list' | 'add' | 'reports' | 'settings' | 'byDepartment'>('list');
  selectedEmployeeForDetail: Employee | null = null;
  isDetailModalOpen = false;
  detailMode: 'edit' | 'view' = 'view'; // Default to view mode

  // Tab configuration
  tabs: TabItem[] = [
    { id: 'list', label: 'Employee List', icon: 'list' },
    { id: 'add', label: 'Add Employee', icon: 'person_add' },
    { id: 'byDepartment', label: 'Search Employee', icon: 'search' },
    { id: 'reports', label: 'Reports', icon: 'assessment' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  ngOnInit() {
    this.loadEmployees();
    this.setupOperationListeners();
  }

  /**
   * Setup listeners for employee operations to show notifications
   * Uses OperationNotificationService for unified operation monitoring
   * 
   * All operations now go through NgRx Store, so autoShowLoading is enabled
   * to automatically show/hide loading indicators based on Store state.
   */
  private setupOperationListeners(): void {
    this.operationNotification.setup({
      error$: this.employeeFacade.error$,
      operationInProgress$: this.employeeFacade.operationInProgress$,
      destroy$: this.destroy$,
      autoShowLoading: true, // NgRx manages loading state through Store
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEmployees() {
    console.log('🔄 Loading employees...');
    this.employeeFacade.loadEmployees();
  }

  /**
   * Handle edit employee action
   * Opens employee detail modal in edit mode
   */
  onEditEmployee(employee: Employee) {
    this.employeeFacade.selectEmployee(employee);
    this.selectedEmployeeForDetail = employee;
    this.detailMode = 'edit';
    this.isDetailModalOpen = true;
  }

  /**
   * Handle delete employee action with confirmation
   * Uses NgRx architecture: Dialog → Facade → Effect → Store → Notification
   */
  onDeleteEmployee(employee: Employee) {
    const employeeName = `${employee.firstName} ${employee.lastName}`;
    
    // Show confirmation dialog first
    const confirm$: Observable<boolean> = this.dialogService.confirm({
      title: 'Confirm Delete',
      message: `Are you sure you want to delete ${employeeName}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmVariant: 'danger',
      icon: 'warning',
    });
    
    confirm$.pipe(
      take(1),
      takeUntil(this.destroy$),
      filter((confirmed: boolean) => confirmed)
    ).subscribe(() => {
      // Track operation for success notification
      this.operationNotification.trackOperation({
        type: 'delete',
        employeeName,
      });

      // Dispatch action through Facade (NgRx architecture)
      // Effect will handle HTTP call, Reducer will update Store,
      // OperationNotificationService will show notifications
      this.employeeFacade.deleteEmployee(employee.id);
    });
  }

  /**
   * Handle view employee action
   * Opens employee detail modal in view mode (read-only)
   */
  onViewEmployee(employee: Employee) {
    this.employeeFacade.selectEmployee(employee);
    this.selectedEmployeeForDetail = employee;
    this.detailMode = 'view';
    this.isDetailModalOpen = true;
  }

  /**
   * Handle close employee detail modal
   */
  onCloseDetailModal() {
    this.isDetailModalOpen = false;
    this.selectedEmployeeForDetail = null;
    this.detailMode = 'view'; // Reset to default
  }

  /**
   * Handle employee updated event
   * Reload employees to reflect changes
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onEmployeeUpdated(employee: Employee) {
    // Reload employees to get updated data
    this.loadEmployees();
  }

  /**
   * Handle bulk delete action with confirmation
   * Uses Observable pattern for dialog confirmation
   */
  onBulkDelete(selectedEmployees: Employee[]) {
    if (selectedEmployees.length === 0) {
      this.notificationService.warning('No Selection', 'Please select employees to delete.');
      return;
    }

    const employeeNames = selectedEmployees
      .map(e => `${e.firstName} ${e.lastName}`)
      .join(', ');

    const confirm$: Observable<boolean> = this.dialogService.confirm({
      title: 'Bulk Delete',
      message: `Are you sure you want to delete ${selectedEmployees.length} employee(s)?\n\n${employeeNames}\n\nThis action cannot be undone.`,
      confirmText: 'Delete All',
      cancelText: 'Cancel',
      confirmVariant: 'danger',
      icon: 'warning',
    });
    
    confirm$.pipe(
        take(1),
        takeUntil(this.destroy$),
      filter((confirmed: boolean) => confirmed),
        switchMap(() => {
          // Track operation for success notification
          this.operationNotification.trackOperation({
            type: 'delete',
            employeeName: `${selectedEmployees.length} employee(s)`,
          });

          // Delete all selected employees sequentially
          // Using RxJS from() to convert array to Observable for better control
          return from(selectedEmployees).pipe(
            concatMap((employee, index) => {
              this.employeeFacade.deleteEmployee(employee.id);
              // Add delay between deletions to avoid overwhelming the server
              return index < selectedEmployees.length - 1 
                ? from([true]).pipe(delay(100))
                : from([true]);
            })
          );
        })
      )
      .subscribe({
        complete: () => {
          // Success notification will be shown by setupOperationListeners
        }
      });
  }

  /**
   * Handle status change with confirmation
   * Uses Observable pattern for dialog confirmation
   */
  onChangeStatus(employee: Employee, newStatus: string) {
    const statusMessages: Record<string, string> = {
      terminated: `Are you sure you want to terminate ${employee.firstName} ${employee.lastName}? This action will deactivate their account.`,
      inactive: `Are you sure you want to deactivate ${employee.firstName} ${employee.lastName}?`,
      active: `Are you sure you want to activate ${employee.firstName} ${employee.lastName}?`,
    };

    const message = statusMessages[newStatus.toLowerCase()] || `Change status to ${newStatus}?`;

    const confirm$: Observable<boolean> = this.dialogService.confirm({
      title: 'Change Employee Status',
      message,
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      confirmVariant: newStatus.toLowerCase() === 'terminated' ? 'danger' : 'primary',
      icon: 'info',
    });
    
    confirm$.pipe(
        take(1),
        takeUntil(this.destroy$),
      filter((confirmed: boolean) => confirmed)
      )
      .subscribe(() => {
        // TODO: Implement status change
        this.notificationService.success(
          'Status Updated',
          `${employee.firstName} ${employee.lastName}'s status has been changed to ${newStatus}.`
        );
      });
  }

  onAddEmployee() {
    this.setActiveTab('add');
  }

  /**
   * Handle employee created event from AddEmployeeComponent
   * Don't reload or switch tabs - let the store handle state updates automatically
   */
  onEmployeeCreated() {
    // Don't reload - the store automatically adds the new employee to the list
    // No need for extra GET request
  }

  /**
   * 设置活动标签页
   */
  setActiveTab(tab: 'list' | 'add' | 'reports' | 'settings' | 'byDepartment'): void {
    this.activeTab.set(tab);
  }

  /**
   * Handle tab change
   * Clear error state when switching to list tab (unless there's an active operation)
   */
  onTabChange(tabId: string): void {
    const newTab = tabId as 'list' | 'add' | 'reports' | 'settings' | 'byDepartment';
    this.setActiveTab(newTab);
    
    // Clear error when switching to list tab
    // This prevents showing errors from other tabs (e.g., create employee errors)
    if (newTab === 'list') {
      // Check if there's an active operation before clearing error
      this.operationInProgress$.pipe(take(1)).subscribe(operation => {
        // Only clear error if no operation is in progress
        // If loading, the error might be from the load operation itself
        if (!operation.loading) {
          this.clearError();
        }
      });
    }
  }

  // 过滤和搜索方法
  onSearchChange(searchTerm: string) {
    this.employeeFacade.setFilters({ searchTerm });
  }

  onDepartmentFilterChange(department: string) {
    this.employeeFacade.setFilters({ department });
  }

  onStatusFilterChange(status: string) {
    this.employeeFacade.setFilters({ employmentStatus: status });
  }

  onSortChange(sortBy: string, sortDirection: 'asc' | 'desc') {
    this.employeeFacade.setFilters({ 
      sortBy, 
      sortDescending: sortDirection === 'desc' 
    });
  }

  onPageChange(page: number) {
    this.employeeFacade.setPagination({ currentPage: page });
  }

  onPageSizeChange(pageSize: number) {
    this.employeeFacade.setPagination({ pageSize, currentPage: 1 });
  }

  clearFilters() {
    this.employeeFacade.clearFilters();
  }

  clearError() {
    this.employeeFacade.clearError();
  }

  /**
   * Handler for retry action in async state component
   */
  onRetryLoad = () => {
    this.loadEmployees();
  };

  /**
   * Handler for empty state action
   */
  onEmptyActionClick = () => {
    this.setActiveTab('add');
  };
}
