// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/employees/employee-reports/employee-reports.component.ts
import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, catchError, of, map } from 'rxjs';
import { BaseCardComponent } from '../../../Shared/components/base/base-card/base-card.component';
import { BaseTableComponent } from '../../../Shared/components/base/base-table/base-table.component';
import { BaseAsyncStateComponent } from '../../../Shared/components/base/base-async-state/base-async-state.component';
import { EmployeeService } from '@core/services/employee.service';
import { NotificationService } from '../../../Shared/services/notification.service';
import { TranslationService } from '@core/services/translation.service';
import { TranslatePipe } from '@core/pipes/translate.pipe';
import { Employee } from 'app/contracts/employees/employee.model';
import { TableColumn, TableAction } from '../../../Shared/components/base';

// Statistics interfaces
interface StatCard {
  title: string;
  value: string | number;
  icon: string;
  trend?: {
    value: number;
    label: string;
    positive: boolean;
  };
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

interface DepartmentStat {
  department: string;
  count: number;
  percentage: number;
  percentageFormatted: string;
}

interface StatusStat {
  status: string;
  count: number;
  percentage: number;
  percentageFormatted: string;
}

interface PositionStat {
  position: string;
  count: number;
  percentage: number;
  percentageFormatted: string;
}

interface SalaryRangeStat {
  range: string;
  count: number;
  percentage: number;
  percentageFormatted: string;
}

interface HiringTrendStat {
  period: string;
  count: number;
  year: number;
  month: number;
}

interface EmploymentTypeStat {
  type: string;
  count: number;
  percentage: number;
  percentageFormatted: string;
}

interface LocationStat {
  location: string;
  count: number;
  percentage: number;
  percentageFormatted: string;
}

interface ContractTypeStat {
  contractType: string;
  count: number;
  percentage: number;
  percentageFormatted: string;
}

interface WorkingHoursStat {
  hoursRange: string;
  count: number;
  percentage: number;
  percentageFormatted: string;
}

interface DepartmentSalaryStat {
  department: string;
  averageSalary: number;
  minSalary: number;
  maxSalary: number;
  employeeCount: number;
  averageSalaryFormatted: string;
  minSalaryFormatted: string;
  maxSalaryFormatted: string;
}

interface RecentHire {
  name: string;
  department: string;
  position: string;
  hireDate: string;
  daysSinceHire: number;
}

@Component({
  selector: 'app-employee-reports',
  standalone: true,
  imports: [
    CommonModule,
    BaseCardComponent,
    BaseTableComponent,
    BaseAsyncStateComponent,
    TranslatePipe,
  ],
  templateUrl: './employee-reports.component.html',
  styleUrls: ['./employee-reports.component.scss'],
})
export class EmployeeReportsComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  private notificationService = inject(NotificationService);
  private translationService = inject(TranslationService);

  // Employee data state - using BehaviorSubject for Observable compatibility
  employees$ = new BehaviorSubject<Employee[]>([]);
  loading$ = new BehaviorSubject<boolean>(false);
  error$ = new BehaviorSubject<string | null>(null);

  // Computed statistics from employees data
  statistics$ = this.employees$.pipe(
    map(employees => this.calculateStatistics(employees))
  );

  // Table columns for department statistics
  departmentColumns: TableColumn[] = [
    { key: 'department', label: 'Department', sortable: true, width: '50%' },
    { key: 'count', label: 'Employees', sortable: true, type: 'number', width: '25%', align: 'right' },
    { key: 'percentageFormatted', label: 'Percentage', sortable: true, width: '25%', align: 'right' },
  ];

  // Table columns for status statistics
  statusColumns: TableColumn[] = [
    { key: 'status', label: 'Status', sortable: true, width: '50%' },
    { key: 'count', label: 'Count', sortable: true, type: 'number', width: '25%', align: 'right' },
    { key: 'percentageFormatted', label: 'Percentage', sortable: true, width: '25%', align: 'right' },
  ];

  // Table columns for position statistics
  positionColumns: TableColumn[] = [
    { key: 'position', label: 'Position', sortable: true, width: '50%' },
    { key: 'count', label: 'Employees', sortable: true, type: 'number', width: '25%', align: 'right' },
    { key: 'percentageFormatted', label: 'Percentage', sortable: true, width: '25%', align: 'right' },
  ];

  // Table columns for salary range statistics
  salaryRangeColumns: TableColumn[] = [
    { key: 'range', label: 'Salary Range', sortable: true, width: '50%' },
    { key: 'count', label: 'Employees', sortable: true, type: 'number', width: '25%', align: 'right' },
    { key: 'percentageFormatted', label: 'Percentage', sortable: true, width: '25%', align: 'right' },
  ];

  // Table columns for hiring trends
  hiringTrendColumns: TableColumn[] = [
    { key: 'period', label: 'Period', sortable: true, width: '60%' },
    { key: 'count', label: 'New Hires', sortable: true, type: 'number', width: '40%', align: 'right' },
  ];

  // Table columns for employment type statistics
  employmentTypeColumns: TableColumn[] = [
    { key: 'type', label: 'Employment Type', sortable: true, width: '50%' },
    { key: 'count', label: 'Count', sortable: true, type: 'number', width: '25%', align: 'right' },
    { key: 'percentageFormatted', label: 'Percentage', sortable: true, width: '25%', align: 'right' },
  ];

  // Table columns for location statistics
  locationColumns: TableColumn[] = [
    { key: 'location', label: 'Location', sortable: true, width: '50%' },
    { key: 'count', label: 'Employees', sortable: true, type: 'number', width: '25%', align: 'right' },
    { key: 'percentageFormatted', label: 'Percentage', sortable: true, width: '25%', align: 'right' },
  ];

  // Table columns for contract type statistics
  contractTypeColumns: TableColumn[] = [
    { key: 'contractType', label: 'Contract Type', sortable: true, width: '50%' },
    { key: 'count', label: 'Count', sortable: true, type: 'number', width: '25%', align: 'right' },
    { key: 'percentageFormatted', label: 'Percentage', sortable: true, width: '25%', align: 'right' },
  ];

  // Table columns for working hours statistics
  workingHoursColumns: TableColumn[] = [
    { key: 'hoursRange', label: 'Hours per Week', sortable: true, width: '50%' },
    { key: 'count', label: 'Employees', sortable: true, type: 'number', width: '25%', align: 'right' },
    { key: 'percentageFormatted', label: 'Percentage', sortable: true, width: '25%', align: 'right' },
  ];

  // Table columns for department salary statistics
  departmentSalaryColumns: TableColumn[] = [
    { key: 'department', label: 'Department', sortable: true, width: '30%' },
    { key: 'employeeCount', label: 'Employees', sortable: true, type: 'number', width: '15%', align: 'right' },
    { 
      key: 'averageSalaryFormatted', 
      label: 'Avg. Salary', 
      sortable: true,
      width: '20%',
      align: 'right'
    },
    { 
      key: 'minSalaryFormatted', 
      label: 'Min Salary', 
      sortable: true,
      width: '17.5%',
      align: 'right'
    },
    { 
      key: 'maxSalaryFormatted', 
      label: 'Max Salary', 
      sortable: true,
      width: '17.5%',
      align: 'right'
    },
  ];

  // Table columns for recent hires
  recentHiresColumns: TableColumn[] = [
    { key: 'name', label: 'Name', sortable: true, width: '25%' },
    { key: 'department', label: 'Department', sortable: true, width: '25%' },
    { key: 'position', label: 'Position', sortable: true, width: '25%' },
    { key: 'hireDate', label: 'Hire Date', sortable: true, type: 'date', width: '15%', align: 'center' },
    { key: 'daysSinceHire', label: 'Days', sortable: true, type: 'number', width: '10%', align: 'right' },
  ];

  /**
   * Calculate statistics from employee data
   */
  private calculateStatistics(employees: Employee[]): {
    statCards: StatCard[];
    departmentStats: DepartmentStat[];
    statusStats: StatusStat[];
    positionStats: PositionStat[];
    salaryRangeStats: SalaryRangeStat[];
    hiringTrendStats: HiringTrendStat[];
    employmentTypeStats: EmploymentTypeStat[];
    cityStats: LocationStat[];
    countryStats: LocationStat[];
    contractTypeStats: ContractTypeStat[];
    workingHoursStats: WorkingHoursStat[];
    departmentSalaryStats: DepartmentSalaryStat[];
    recentHires: RecentHire[];
    expiringContractsCount: number;
    averageSalary: number;
    minSalary: number;
    maxSalary: number;
    totalWithSalary: number;
    managersCount: number;
    averageTenure: number;
  } {
    const total = employees.length;
    const active = employees.filter(e => e.status === 'Active').length;
    const inactive = employees.filter(e => e.status === 'Inactive').length;
    const terminated = employees.filter(e => e.status === 'Terminated').length;

    // Department statistics
    const departmentMap = new Map<string, number>();
    employees.forEach(emp => {
      const dept = emp.department || 'No Department';
      departmentMap.set(dept, (departmentMap.get(dept) || 0) + 1);
    });
    const departmentStats: DepartmentStat[] = Array.from(departmentMap.entries())
      .map(([department, count]) => {
        const percentage = total > 0 ? Math.round((count / total) * 100 * 100) / 100 : 0;
        return {
          department,
          count,
          percentage,
          percentageFormatted: `${percentage}%`,
        };
      })
      .sort((a, b) => b.count - a.count);

    // Status statistics
    const statusStats: StatusStat[] = [
      {
        status: 'Active',
        count: active,
        percentage: total > 0 ? Math.round((active / total) * 100 * 100) / 100 : 0,
        percentageFormatted: total > 0 ? `${Math.round((active / total) * 100 * 100) / 100}%` : '0%',
      },
      {
        status: 'Inactive',
        count: inactive,
        percentage: total > 0 ? Math.round((inactive / total) * 100 * 100) / 100 : 0,
        percentageFormatted: total > 0 ? `${Math.round((inactive / total) * 100 * 100) / 100}%` : '0%',
      },
      {
        status: 'Terminated',
        count: terminated,
        percentage: total > 0 ? Math.round((terminated / total) * 100 * 100) / 100 : 0,
        percentageFormatted: total > 0 ? `${Math.round((terminated / total) * 100 * 100) / 100}%` : '0%',
      },
    ];

    // Position statistics
    const positionMap = new Map<string, number>();
    employees.forEach(emp => {
      const pos = emp.position || 'No Position';
      positionMap.set(pos, (positionMap.get(pos) || 0) + 1);
    });
    const positionStats: PositionStat[] = Array.from(positionMap.entries())
      .map(([position, count]) => {
        const percentage = total > 0 ? Math.round((count / total) * 100 * 100) / 100 : 0;
        return {
          position,
          count,
          percentage,
          percentageFormatted: `${percentage}%`,
        };
      })
      .sort((a, b) => b.count - a.count);

    // Salary statistics
    const employeesWithSalary = employees.filter(e => e.salary && e.salary > 0);
    const totalWithSalary = employeesWithSalary.length;
    const salaries = employeesWithSalary.map(e => e.salary || 0);
    const averageSalary = totalWithSalary > 0
      ? Math.round(salaries.reduce((sum, s) => sum + s, 0) / totalWithSalary)
      : 0;
    const minSalary = totalWithSalary > 0 ? Math.min(...salaries) : 0;
    const maxSalary = totalWithSalary > 0 ? Math.max(...salaries) : 0;

    // Salary range statistics
    const salaryRanges = [
      { label: '0 - 50,000', min: 0, max: 50000 },
      { label: '50,000 - 100,000', min: 50000, max: 100000 },
      { label: '100,000 - 150,000', min: 100000, max: 150000 },
      { label: '150,000 - 200,000', min: 150000, max: 200000 },
      { label: '200,000+', min: 200000, max: Infinity },
    ];
    const salaryRangeStats: SalaryRangeStat[] = salaryRanges.map(range => {
      const count = employeesWithSalary.filter(e => {
        const salary = e.salary || 0;
        return salary >= range.min && (range.max === Infinity || salary < range.max);
      }).length;
      const percentage = totalWithSalary > 0 ? Math.round((count / totalWithSalary) * 100 * 100) / 100 : 0;
      return {
        range: range.label,
        count,
        percentage,
        percentageFormatted: `${percentage}%`,
      };
    }).filter(stat => stat.count > 0);

    // Hiring trends (last 12 months)
    const now = new Date();
    const hiringTrendStats: HiringTrendStat[] = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0, 23, 59, 59);
      
      const count = employees.filter(emp => {
        if (!emp.hireDate) return false;
        const hireDate = new Date(emp.hireDate);
        return hireDate >= monthStart && hireDate <= monthEnd;
      }).length;

      if (count > 0 || i >= 10) { // Show last 3 months even if 0
        hiringTrendStats.push({
          period: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          count,
          year,
          month,
        });
      }
    }

    // Employment type statistics
    const employmentTypeMap = new Map<string, number>();
    employees.forEach(emp => {
      const type = emp.employmentType || 'Not Specified';
      employmentTypeMap.set(type, (employmentTypeMap.get(type) || 0) + 1);
    });
    const employmentTypeStats: EmploymentTypeStat[] = Array.from(employmentTypeMap.entries())
      .map(([type, count]) => {
        const percentage = total > 0 ? Math.round((count / total) * 100 * 100) / 100 : 0;
        return {
          type,
          count,
          percentage,
          percentageFormatted: `${percentage}%`,
        };
      })
      .sort((a, b) => b.count - a.count);

    // Manager statistics
    const managersCount = employees.filter(e => e.isManager).length;

    // Average tenure (years)
    const employeesWithHireDate = employees.filter(e => e.hireDate);
    const averageTenure = employeesWithHireDate.length > 0
      ? Math.round((employeesWithHireDate.reduce((sum, e) => {
          const hireDate = new Date(e.hireDate!);
          const years = (now.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
          return sum + years;
        }, 0) / employeesWithHireDate.length) * 10) / 10
      : 0;

    // City statistics
    const cityMap = new Map<string, number>();
    employees.forEach(emp => {
      const city = emp.address?.city || 'Not Specified';
      cityMap.set(city, (cityMap.get(city) || 0) + 1);
    });
    const cityStats: LocationStat[] = Array.from(cityMap.entries())
      .map(([location, count]) => {
        const percentage = total > 0 ? Math.round((count / total) * 100 * 100) / 100 : 0;
        return {
          location,
          count,
          percentage,
          percentageFormatted: `${percentage}%`,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 cities

    // Country statistics
    const countryMap = new Map<string, number>();
    employees.forEach(emp => {
      const country = emp.address?.country || 'Not Specified';
      countryMap.set(country, (countryMap.get(country) || 0) + 1);
    });
    const countryStats: LocationStat[] = Array.from(countryMap.entries())
      .map(([location, count]) => {
        const percentage = total > 0 ? Math.round((count / total) * 100 * 100) / 100 : 0;
        return {
          location,
          count,
          percentage,
          percentageFormatted: `${percentage}%`,
        };
      })
      .sort((a, b) => b.count - a.count);

    // Contract type statistics
    const contractTypeMap = new Map<string, number>();
    employees.forEach(emp => {
      const contractType = emp.contractType || 'Not Specified';
      contractTypeMap.set(contractType, (contractTypeMap.get(contractType) || 0) + 1);
    });
    const contractTypeStats: ContractTypeStat[] = Array.from(contractTypeMap.entries())
      .map(([contractType, count]) => {
        const percentage = total > 0 ? Math.round((count / total) * 100 * 100) / 100 : 0;
        return {
          contractType,
          count,
          percentage,
          percentageFormatted: `${percentage}%`,
        };
      })
      .sort((a, b) => b.count - a.count);

    // Working hours statistics
    const workingHoursRanges = [
      { label: '0-20 hours', min: 0, max: 20 },
      { label: '21-30 hours', min: 21, max: 30 },
      { label: '31-40 hours', min: 31, max: 40 },
      { label: '41-50 hours', min: 41, max: 50 },
      { label: '50+ hours', min: 51, max: Infinity },
    ];
    const workingHoursStats: WorkingHoursStat[] = workingHoursRanges.map(range => {
      const count = employees.filter(e => {
        const hours = e.workingHoursPerWeek || 0;
        return hours >= range.min && (range.max === Infinity || hours <= range.max);
      }).length;
      const percentage = total > 0 ? Math.round((count / total) * 100 * 100) / 100 : 0;
      return {
        hoursRange: range.label,
        count,
        percentage,
        percentageFormatted: `${percentage}%`,
      };
    }).filter(stat => stat.count > 0);

    // Department salary statistics
    const departmentSalaryMap = new Map<string, { salaries: number[]; count: number }>();
    employeesWithSalary.forEach(emp => {
      const dept = emp.department || 'No Department';
      if (!departmentSalaryMap.has(dept)) {
        departmentSalaryMap.set(dept, { salaries: [], count: 0 });
      }
      const deptData = departmentSalaryMap.get(dept)!;
      deptData.salaries.push(emp.salary || 0);
      deptData.count++;
    });
    const departmentSalaryStats: DepartmentSalaryStat[] = Array.from(departmentSalaryMap.entries())
      .map(([department, data]) => {
        const salaries = data.salaries;
        return {
          department,
          averageSalary: Math.round(salaries.reduce((sum, s) => sum + s, 0) / salaries.length),
          minSalary: Math.min(...salaries),
          maxSalary: Math.max(...salaries),
          employeeCount: data.count,
        };
      })
      .sort((a, b) => b.averageSalary - a.averageSalary)
      .map(stat => ({
        ...stat,
        averageSalaryFormatted: `$${stat.averageSalary.toLocaleString()}`,
        minSalaryFormatted: `$${stat.minSalary.toLocaleString()}`,
        maxSalaryFormatted: `$${stat.maxSalary.toLocaleString()}`,
      }));

    // Recent hires (last 90 days)
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const recentHires: RecentHire[] = employees
      .filter(emp => {
        if (!emp.hireDate) return false;
        const hireDate = new Date(emp.hireDate);
        return hireDate >= ninetyDaysAgo;
      })
      .map(emp => {
        const hireDate = new Date(emp.hireDate!);
        const daysSinceHire = Math.floor((now.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24));
        return {
          name: `${emp.firstName} ${emp.lastName}`,
          department: emp.department || 'No Department',
          position: emp.position || 'No Position',
          hireDate: emp.hireDate!,
          daysSinceHire,
        };
      })
      .sort((a, b) => new Date(b.hireDate).getTime() - new Date(a.hireDate).getTime())
      .slice(0, 10); // Top 10 recent hires

    // Expiring contracts (within next 90 days)
    const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    const expiringContractsCount = employees.filter(emp => {
      if (!emp.contractEndDate) return false;
      const endDate = new Date(emp.contractEndDate);
      return endDate >= now && endDate <= ninetyDaysFromNow;
    }).length;

    // Stat cards
    const statCards: StatCard[] = [
      {
        title: 'Total Employees',
        value: total,
        icon: 'people',
        color: 'primary',
      },
      {
        title: 'Active Employees',
        value: active,
        icon: 'check_circle',
        color: 'success',
        trend: {
          value: total > 0 ? Math.round((active / total) * 100) : 0,
          label: '% of total',
          positive: true,
        },
      },
      {
        title: 'Average Salary',
        value: averageSalary > 0 ? `$${averageSalary.toLocaleString()}` : 'N/A',
        icon: 'attach_money',
        color: 'info',
      },
      {
        title: 'Departments',
        value: departmentStats.length,
        icon: 'business',
        color: 'warning',
      },
      {
        title: 'Managers',
        value: managersCount,
        icon: 'supervisor_account',
        color: 'primary',
        trend: {
          value: total > 0 ? Math.round((managersCount / total) * 100) : 0,
          label: '% of total',
          positive: true,
        },
      },
      {
        title: 'Avg. Tenure',
        value: averageTenure > 0 ? `${averageTenure} years` : 'N/A',
        icon: 'schedule',
        color: 'info',
      },
      {
        title: 'Max Salary',
        value: maxSalary > 0 ? `$${maxSalary.toLocaleString()}` : 'N/A',
        icon: 'trending_up',
        color: 'success',
      },
      {
        title: 'Positions',
        value: positionStats.length,
        icon: 'work',
        color: 'warning',
      },
      {
        title: 'Cities',
        value: cityStats.length,
        icon: 'location_city',
        color: 'info',
      },
      {
        title: 'Expiring Contracts',
        value: expiringContractsCount,
        icon: 'event_busy',
        color: expiringContractsCount > 0 ? 'danger' : 'success',
      },
    ];

    return {
      statCards,
      departmentStats,
      statusStats,
      positionStats,
      salaryRangeStats,
      hiringTrendStats,
      employmentTypeStats,
      cityStats,
      countryStats,
      contractTypeStats,
      workingHoursStats,
      departmentSalaryStats,
      recentHires,
      expiringContractsCount,
      averageSalary,
      minSalary,
      maxSalary,
      totalWithSalary,
      managersCount,
      averageTenure,
    };
  }

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
   * Refresh statistics
   */
  refreshData(): void {
    this.loadEmployees();
  }

  /**
   * Retry loading employees
   */
  onRetryLoad = (): void => {
    this.loadEmployees();
  };
}
