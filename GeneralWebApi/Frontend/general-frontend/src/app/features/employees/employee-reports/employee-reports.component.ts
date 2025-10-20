// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/employees/employee-reports/employee-reports.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseButtonComponent } from '../../../Shared/components/base/base-button/base-button.component';
import { BaseCardComponent } from '../../../Shared/components/base/base-card/base-card.component';
import { BaseTableComponent } from '../../../Shared/components/base/base-table/base-table.component';

@Component({
  selector: 'app-employee-reports',
  standalone: true,
  imports: [
    CommonModule,
    BaseButtonComponent,
    BaseCardComponent,
    BaseTableComponent
  ],
  templateUrl: './employee-reports.component.html',
  styleUrls: ['./employee-reports.component.scss'],
})
export class EmployeeReportsComponent {
  // 报告卡片数据
  reportCards = [
    {
      icon: 'people',
      title: 'Department Overview',
      description: 'Employee distribution by department',
      action: 'Generate Report'
    },
    {
      icon: 'trending_up',
      title: 'Hiring Trends',
      description: 'Monthly hiring statistics and trends',
      action: 'Generate Report'
    },
    {
      icon: 'attach_money',
      title: 'Salary Analysis',
      description: 'Salary distribution and analysis',
      action: 'Generate Report'
    },
    {
      icon: 'event',
      title: 'Attendance Report',
      description: 'Employee attendance and leave records',
      action: 'Generate Report'
    },
    {
      icon: 'gps_fixed',
      title: 'Performance Review',
      description: 'Employee performance evaluation reports',
      action: 'Generate Report'
    },
    {
      icon: 'description',
      title: 'Custom Report',
      description: 'Create custom reports with specific criteria',
      action: 'Create Report'
    }
  ];

  // 最近报告数据
  recentReports = [
    {
      id: 1,
      title: 'Department Overview - December 2024',
      generatedDate: 'Dec 19, 2024 at 10:30 AM',
      status: 'completed'
    },
    {
      id: 2,
      title: 'Hiring Trends - Q4 2024',
      generatedDate: 'Dec 15, 2024 at 2:15 PM',
      status: 'completed'
    }
  ];

  // 表格列定义
  reportColumns = [
    { key: 'title', label: 'Report Name', sortable: true },
    { key: 'generatedDate', label: 'Generated', sortable: true },
    { key: 'status', label: 'Status', sortable: true }
  ];

  // 表格操作
  reportActions = [
    {
      label: 'View',
      icon: 'visibility',
      onClick: (item: unknown) => this.viewReport(item)
    },
    {
      label: 'Download',
      icon: 'download',
      onClick: (item: unknown) => this.downloadReport(item)
    }
  ];

  // 生成报告
  generateReport(reportType: string) {
    console.log('Generating report:', reportType);
    // 这里添加实际的报告生成逻辑
  }

  // 查看报告
  viewReport(report: unknown) {
    console.log('Viewing report:', report);
    // 这里添加查看报告的逻辑
  }

  // 下载报告
  downloadReport(report: unknown) {
    console.log('Downloading report:', report);
    // 这里添加下载报告的逻辑
  }
}
