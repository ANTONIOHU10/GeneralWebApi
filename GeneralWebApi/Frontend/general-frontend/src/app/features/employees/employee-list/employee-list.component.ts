// src/app/features/employees/employee-list/employee-list.component.ts
import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject} from 'rxjs';
import { EmployeeCardComponent } from '../employee-card/employee-card.component';
import { AddEmployeeComponent } from '../add-employee/add-employee.component';
import { EmployeeReportsComponent } from '../employee-reports/employee-reports.component';
import { EmployeeSettingsComponent } from '../employee-settings/employee-settings.component';
import { BaseSearchComponent } from '../../../Shared/components/base/base-search/base-search.component';
import { BaseTabsComponent, TabItem } from '../../../Shared/components/base/base-tabs/base-tabs.component';
import { BaseLoadingComponent } from '../../../Shared/components/base/base-loading/base-loading.component';
import { BaseErrorComponent } from '../../../Shared/components/base/base-error/base-error.component';
import { BaseEmptyComponent } from '../../../Shared/components/base/base-empty/base-empty.component';
import { EmployeeFacade } from '@store/employee/employee.facade';
import { Employee } from 'app/contracts/employees/employee.model';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    EmployeeCardComponent,
    AddEmployeeComponent,
    EmployeeReportsComponent,
    EmployeeSettingsComponent,
    BaseSearchComponent,
    BaseTabsComponent,
    BaseLoadingComponent,
    BaseErrorComponent,
    BaseEmptyComponent,
  ],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss'],
})
export class EmployeeListComponent implements OnInit, OnDestroy {
  private employeeFacade = inject(EmployeeFacade);
  private destroy$ = new Subject<void>();

  // Observable streams from NgRx store
  employees$ = this.employeeFacade.filteredEmployees$;
  loading$ = this.employeeFacade.loading$;
  error$ = this.employeeFacade.error$;
  pagination$ = this.employeeFacade.pagination$;
  filters$ = this.employeeFacade.filters$;
  operationInProgress$ = this.employeeFacade.operationInProgress$;

  // Local state
  activeTab = signal<'list' | 'add' | 'reports' | 'settings'>('list');

  // Tab configuration
  tabs: TabItem[] = [
    { id: 'list', label: 'Employee List', icon: 'list' },
    { id: 'add', label: 'Add Employee', icon: 'person_add' },
    { id: 'reports', label: 'Reports', icon: 'assessment' },
    { id: 'settings', label: 'Settings', icon: 'settings' }
  ];

  ngOnInit() {
    this.loadEmployees();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEmployees() {
    console.log('🔄 Loading employees...');
    this.employeeFacade.loadEmployees();
  }


  onEditEmployee(employee: Employee) {
    console.log('Edit employee:', employee);
    this.employeeFacade.selectEmployee(employee);
    // TODO: 导航到编辑页面或打开编辑模态框
  }

  onDeleteEmployee(employee: Employee) {
    if (
      confirm(
        `Are you sure you want to delete ${employee.firstName} ${employee.lastName}?`
      )
    ) {
      this.employeeFacade.deleteEmployee(employee.id);
    }
  }

  onViewEmployee(employee: Employee) {
    console.log('View employee:', employee);
    this.employeeFacade.selectEmployee(employee);
    // TODO: 导航到员工详情页面
  }

  onAddEmployee() {
    this.setActiveTab('add');
  }

  /**
   * 设置活动标签页
   */
  setActiveTab(tab: 'list' | 'add' | 'reports' | 'settings'): void {
    this.activeTab.set(tab);
  }

  /**
   * 处理标签页切换
   */
  onTabChange(tabId: string): void {
    this.setActiveTab(tabId as 'list' | 'add' | 'reports' | 'settings');
  }

  // 过滤和搜索方法
  onSearchChange(searchTerm: string) {
    this.employeeFacade.setFilters({ searchTerm });
  }

  onDepartmentFilterChange(department: string) {
    this.employeeFacade.setFilters({ department });
  }

  onStatusFilterChange(status: string) {
    this.employeeFacade.setFilters({ status });
  }

  onSortChange(sortBy: string, sortDirection: 'asc' | 'desc') {
    this.employeeFacade.setFilters({ sortBy, sortDirection });
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
}
