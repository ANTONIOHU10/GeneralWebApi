// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/dashboard/dashboard.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <h1>
        <span class="material-icons">dashboard</span>
        Dashboard Overview
      </h1>
      
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Total Employees</h3>
          <p class="stat-number">{{ totalEmployees() }}</p>
        </div>
        
        <div class="stat-card">
          <h3>Active Contracts</h3>
          <p class="stat-number">{{ activeContracts() }}</p>
        </div>
        
        <div class="stat-card">
          <h3>Departments</h3>
          <p class="stat-number">{{ totalDepartments() }}</p>
        </div>
        
        <div class="stat-card">
          <h3>Pending Approvals</h3>
          <p class="stat-number">{{ pendingApprovals() }}</p>
        </div>
      </div>
      
      <div class="recent-activities">
        <h2>Recent Activities</h2>
        <div class="activity-list">
          <div class="activity-item" *ngFor="let activity of recentActivities()">
            <span class="activity-icon material-icons">{{ activity.icon }}</span>
            <span class="activity-text">{{ activity.text }}</span>
            <span class="activity-time">{{ activity.time }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    h1 {
      color: #333;
      margin-bottom: 2rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .material-icons {
      font-size: 1.5rem;
      color: #2196F3;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }
    
    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;
    }
    
    .stat-card h3 {
      color: #666;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .stat-number {
      font-size: 2.5rem;
      font-weight: bold;
      color: #2196F3;
      margin: 0;
    }
    
    .recent-activities {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .recent-activities h2 {
      color: #333;
      margin-bottom: 1rem;
    }
    
    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    
    .activity-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 6px;
    }
    
    .activity-icon {
      font-size: 1.2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #666;
    }
    
    .activity-text {
      flex: 1;
      color: #333;
    }
    
    .activity-time {
      color: #666;
      font-size: 0.9rem;
    }
  `]
})
export class DashboardComponent {
  // Mock data - in real app, these would come from services
  totalEmployees = signal(156);
  activeContracts = signal(142);
  totalDepartments = signal(12);
  pendingApprovals = signal(8);
  
  recentActivities = signal([
    { icon: 'person', text: 'New employee John Doe added', time: '2 hours ago' },
    { icon: 'description', text: 'Contract for Jane Smith renewed', time: '4 hours ago' },
    { icon: 'business', text: 'New department "Marketing" created', time: '6 hours ago' },
    { icon: 'key', text: 'Role permissions updated for Admin', time: '1 day ago' },
    { icon: 'history', text: 'Audit log entry created', time: '1 day ago' }
  ]);
}
