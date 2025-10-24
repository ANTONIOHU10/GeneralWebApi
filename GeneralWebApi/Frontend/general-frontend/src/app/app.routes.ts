import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { LoginComponent } from '@features/auth/login/login.component';
import { PrivateLayoutComponent } from '@layout/privatePage';
import { PublicLayoutComponent } from '@layout/publicPage';

// Import placeholder components (to be created)
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { TaskListComponent } from './features/tasks/task-list/task-list.component';
import { NotificationCenterComponent } from './features/notifications/notification-center/notification-center.component';
import { ApprovalListComponent } from './features/approvals/approval-list/approval-list.component';
import { EmployeeListComponent } from './features/employees/employee-list/employee-list.component';
import { DepartmentListComponent } from './features/departments/department-list/department-list.component';
import { PositionListComponent } from './features/positions/position-list/position-list.component';
import { OnboardingListComponent } from './features/onboarding/onboarding-list/onboarding-list.component';
import { ContractListComponent } from './features/contracts/contract-list/contract-list.component';
import { ContractApprovalListComponent } from './features/contract-approvals/contract-approval-list/contract-approval-list.component';
import { ContractTemplateListComponent } from './features/contract-templates/contract-template-list/contract-template-list.component';
import { ContractReminderListComponent } from './features/contract-reminders/contract-reminder-list/contract-reminder-list.component';
import { IdentityDocumentListComponent } from './features/identity-documents/identity-document-list/identity-document-list.component';
import { EducationListComponent } from './features/education/education-list/education-list.component';
import { CertificationListComponent } from './features/certifications/certification-list/certification-list.component';
import { CompanyDocumentListComponent } from './features/company-documents/company-document-list/company-document-list.component';
import { UserListComponent } from './features/users/user-list/user-list.component';
import { RoleListComponent } from './features/roles/role-list/role-list.component';
import { PermissionListComponent } from './features/permissions/permission-list/permission-list.component';
import { SettingsComponent } from './features/settings/settings.component';
import { AuditLogListComponent } from './features/audit-logs/audit-log-list/audit-log-list.component';
import { SystemMonitorComponent } from './features/system-monitor/system-monitor/system-monitor.component';
import { SecurityAuditComponent } from './features/security-audit/security-audit/security-audit.component';
import { BackupComponent } from './features/backup/backup/backup.component';
import { NotificationDemoComponent } from './features/demo/notification-demo/notification-demo.component';

export const routes: Routes = [
  {
    //auth/login
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
    ],
  },
  {
    path: 'private',
    component: PrivateLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      // 🏠 Workspace
      { path: 'dashboard', component: DashboardComponent },
      { path: 'tasks', component: TaskListComponent },
      { path: 'notifications', component: NotificationCenterComponent },
      { path: 'approvals', component: ApprovalListComponent },

      // 👥 HR Management
      { path: 'employees', component: EmployeeListComponent },
      { path: 'departments', component: DepartmentListComponent },
      { path: 'positions', component: PositionListComponent },
      { path: 'onboarding', component: OnboardingListComponent },

      // 📄 Contract Management
      { path: 'contracts', component: ContractListComponent },
      { path: 'contract-approvals', component: ContractApprovalListComponent },
      { path: 'contract-templates', component: ContractTemplateListComponent },
      { path: 'contract-reminders', component: ContractReminderListComponent },

      // 📁 Document Center
      { path: 'identity-documents', component: IdentityDocumentListComponent },
      { path: 'education', component: EducationListComponent },
      { path: 'certifications', component: CertificationListComponent },
      { path: 'company-documents', component: CompanyDocumentListComponent },

      // ⚙️ System Management
      { path: 'users', component: UserListComponent },
      { path: 'roles', component: RoleListComponent },
      { path: 'permissions', component: PermissionListComponent },
      { path: 'settings', component: SettingsComponent },

      // 📊 Monitoring & Audit
      { path: 'audit-logs', component: AuditLogListComponent },
      { path: 'system-monitor', component: SystemMonitorComponent },
      { path: 'security-audit', component: SecurityAuditComponent },
      { path: 'backup', component: BackupComponent },

      // 🧪 Development & Testing
      { path: 'notification-demo', component: NotificationDemoComponent },
    ],
  },
];
