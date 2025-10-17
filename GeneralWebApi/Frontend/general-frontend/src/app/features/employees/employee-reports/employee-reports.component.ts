// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/employees/employee-reports/employee-reports.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employee-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="reports-container">
      <div class="page-header">
        <h2>
          <span class="material-icons">assessment</span>
          Employee Reports
        </h2>
        <p>Generate and view employee-related reports and analytics</p>
      </div>

      <div class="reports-grid">
        <div class="report-card">
          <div class="report-icon material-icons">people</div>
          <h3>Department Overview</h3>
          <p>Employee distribution by department</p>
          <button class="btn btn-primary">Generate Report</button>
        </div>

        <div class="report-card">
          <div class="report-icon material-icons">trending_up</div>
          <h3>Hiring Trends</h3>
          <p>Monthly hiring statistics and trends</p>
          <button class="btn btn-primary">Generate Report</button>
        </div>

        <div class="report-card">
          <div class="report-icon material-icons">attach_money</div>
          <h3>Salary Analysis</h3>
          <p>Salary distribution and analysis</p>
          <button class="btn btn-primary">Generate Report</button>
        </div>

        <div class="report-card">
          <div class="report-icon material-icons">event</div>
          <h3>Attendance Report</h3>
          <p>Employee attendance and leave records</p>
          <button class="btn btn-primary">Generate Report</button>
        </div>

        <div class="report-card">
          <div class="report-icon material-icons">gps_fixed</div>
          <h3>Performance Review</h3>
          <p>Employee performance evaluation reports</p>
          <button class="btn btn-primary">Generate Report</button>
        </div>

        <div class="report-card">
          <div class="report-icon material-icons">description</div>
          <h3>Custom Report</h3>
          <p>Create custom reports with specific criteria</p>
          <button class="btn btn-primary">Create Report</button>
        </div>
      </div>

      <div class="recent-reports">
        <h3>Recent Reports</h3>
        <div class="report-list">
          <div class="report-item">
            <div class="report-info">
              <h4>Department Overview - December 2024</h4>
              <p>Generated on Dec 19, 2024 at 10:30 AM</p>
            </div>
            <div class="report-actions">
              <button class="btn btn-sm btn-outline">View</button>
              <button class="btn btn-sm btn-outline">Download</button>
            </div>
          </div>
          <div class="report-item">
            <div class="report-info">
              <h4>Hiring Trends - Q4 2024</h4>
              <p>Generated on Dec 15, 2024 at 2:15 PM</p>
            </div>
            <div class="report-actions">
              <button class="btn btn-sm btn-outline">View</button>
              <button class="btn btn-sm btn-outline">Download</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .reports-container {
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .page-header {
        padding: 2rem 2rem 1rem 2rem;
        border-bottom: 1px solid #e9ecef;
        background: white;
      }

      .page-header h2 {
        margin: 0 0 0.5rem 0;
        color: #333;
        font-size: 1.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .material-icons {
        font-size: 1.5rem;
        color: #2196f3;
      }

      .page-header p {
        margin: 0;
        color: #666;
      }

      .reports-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
        padding: 2rem;
        flex: 1;
        overflow-y: auto;
      }

      .report-card {
        background: white;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        padding: 1.5rem;
        text-align: center;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .report-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }

      .report-icon {
        font-size: 2.5rem;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #666;
      }

      .report-card h3 {
        margin: 0 0 0.5rem 0;
        color: #333;
        font-size: 1.2rem;
      }

      .report-card p {
        margin: 0 0 1.5rem 0;
        color: #666;
        font-size: 0.9rem;
      }

      .btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn-primary {
        background: #007bff;
        color: white;
      }

      .btn-primary:hover {
        background: #0056b3;
      }

      .btn-outline {
        background: transparent;
        color: #007bff;
        border: 1px solid #007bff;
      }

      .btn-outline:hover {
        background: #007bff;
        color: white;
      }

      .btn-sm {
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
      }

      .recent-reports {
        margin: 0 2rem 2rem 2rem;
      }

      .recent-reports h3 {
        margin: 0 0 1rem 0;
        color: #333;
        padding: 0 1rem;
      }

      .report-list {
        background: white;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        overflow: hidden;
      }

      .report-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.5rem;
        border-bottom: 1px solid #e9ecef;
      }

      .report-item:last-child {
        border-bottom: none;
      }

      .report-info h4 {
        margin: 0 0 0.25rem 0;
        color: #333;
        font-size: 1rem;
      }

      .report-info p {
        margin: 0;
        color: #666;
        font-size: 0.875rem;
      }

      .report-actions {
        display: flex;
        gap: 0.5rem;
      }

      @media (max-width: 768px) {
        .reports-grid {
          grid-template-columns: 1fr;
        }

        .report-item {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
        }

        .report-actions {
          width: 100%;
          justify-content: flex-end;
        }
      }
    `,
  ],
})
export class EmployeeReportsComponent {}
