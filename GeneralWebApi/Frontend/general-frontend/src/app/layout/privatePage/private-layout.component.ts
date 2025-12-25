// Path: GeneralWebApi/Frontend/general-frontend/src/app/layout/private-layout.component.ts
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { HeaderComponent } from '../../Shared/components/header/header.component';
import { FooterComponent } from '../../Shared/components/footer/footer.component';
import { SidebarComponent } from '../../Shared/components/sidebar/sidebar.component';
import { BreadcrumbComponent } from '../../Shared/components/breadcrumb/breadcrumb.component';
import { UserProfileModalComponent } from '../../Shared/components/user-profile-modal/user-profile-modal.component';
import { NotificationCenterComponent } from '../../features/notifications/notification-center/notification-center.component';
import { BaseModalComponent } from '../../Shared/components/base/base-modal/base-modal.component';
import { Employee } from 'app/contracts/employees/employee.model';
import { User } from 'app/users/user.model';
import { AuthService } from '@core/services/auth.service';
import { UserService } from '@core/services/user.service';
import { EmployeeService } from '@core/services/employee.service';
import { catchError, of, Observable } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-private-layout',
  templateUrl: './private-layout.component.html',
  styleUrls: ['./private-layout.component.scss'],
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    BreadcrumbComponent,
    UserProfileModalComponent,
    NotificationCenterComponent,
    BaseModalComponent,
  ],
})
export class PrivateLayoutComponent implements OnInit {
  // Services
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private employeeService = inject(EmployeeService);
  private router = inject(Router);

  // User profile modal state
  isUserProfileModalOpen = false;
  isDarkMode = false;
  isSidebarOpen = this.getInitialSidebarState(); // 根据屏幕尺寸设置初始状态
  
  // Notification center modal state
  isNotificationCenterOpen = false;
  
  // Reference to header component for refreshing notification count
  @ViewChild(HeaderComponent) headerComponent?: HeaderComponent;
  
  // Settings panel state
  isSettingsPanelOpen = false;

  // Real user and employee data
  currentEmployee: Employee | null = null;
  currentUser: User | null = null;

  constructor() {
    // Initialize theme from localStorage or system preference
    this.initializeTheme();
  }

  /**
   * Initialize component - load current user and employee data
   */
  ngOnInit(): void {
    this.loadCurrentUserData();
  }

  /**
   * Get initial sidebar state based on screen size
   */
  private getInitialSidebarState(): boolean {
    // 桌面端默认打开，移动端默认关闭
    return window.innerWidth > 768;
  }

  /**
   * Initialize theme based on user preference or system setting
   */
  private initializeTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;

    this.isDarkMode = savedTheme === 'dark' || (!savedTheme && prefersDark);
    this.applyTheme();
  }

  /**
   * Toggle between light and dark theme
   */
  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  /**
   * Apply the current theme to the document
   */
  private applyTheme(): void {
    const theme = this.isDarkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    document.body.className = this.isDarkMode ? 'dark-theme' : 'light-theme';
  }

  /**
   * Toggle sidebar visibility (mobile)
   */
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  /**
   * Close sidebar (mobile)
   */
  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  /**
   * Handle notification click - open notification center panel
   */
  onNotificationClick(): void {
    this.isNotificationCenterOpen = true;
  }
  
  /**
   * Handle notification center close
   */
  onNotificationCenterClose(): void {
    this.isNotificationCenterOpen = false;
    // Refresh notification count in header when notification center closes
    if (this.headerComponent) {
      this.headerComponent.loadNotificationCount();
    }
  }

  /**
   * Handle profile click
   */
  onProfileClick(): void {
    console.log('Profile clicked - Current user:', this.currentUser);
    console.log('Profile clicked - Current employee:', this.currentEmployee);
    this.isUserProfileModalOpen = true;
    
    // If data is not loaded yet, try to load it
    if (!this.currentUser && !this.currentEmployee) {
      console.log('No user data found, attempting to load...');
      this.loadCurrentUserData();
    }
  }

  /**
   * Handle user profile modal close
   */
  onUserProfileModalClose(): void {
    this.isUserProfileModalOpen = false;
  }

  /**
   * Handle settings click - open settings panel or navigate to settings page
   */
  onSettingsClick(): void {
    // Option 1: Open settings panel (modal)
    this.isSettingsPanelOpen = true;
    
    // Option 2: Navigate to settings page (uncomment if you prefer navigation)
    // this.router.navigate(['/private/settings']);
  }
  
  /**
   * Handle settings panel close
   */
  onSettingsPanelClose(): void {
    this.isSettingsPanelOpen = false;
  }

  /**
   * Load current user and employee data from API
   */
  private loadCurrentUserData(): void {
    // Get current user info from API
    this.authService.getCurrentUser().pipe(
      catchError((error) => {
        console.error('Error loading current user from API, trying token fallback:', error);
        // Fallback to token
        const userFromToken = this.authService.getUserFromToken();
        if (userFromToken && userFromToken.id) {
          const userId = parseInt(userFromToken.id, 10);
          if (!isNaN(userId)) {
            return this.userService.getUserWithEmployee(userId).pipe(
              catchError(() => {
                // If getUserWithEmployee also fails, create user from token
                return of({
                  userId: userFromToken.id,
                  username: userFromToken.username || '',
                  email: userFromToken.email || '',
                  role: 'User',
                  roles: []
                });
              })
            );
          }
        }
        return of(null);
      })
    ).subscribe({
      next: (userInfo) => {
        if (!userInfo) {
          console.warn('No user info received from API or token');
          return;
        }

        console.log('Current user info received:', userInfo);

        // Handle both getCurrentUser response and getUserWithEmployee response
        let userData: any;
        if ('userId' in userInfo || 'username' in userInfo) {
          // UserWithEmployee format
          userData = {
            id: (userInfo as any).userId?.toString() || '',
            userName: (userInfo as any).username || '',
            email: (userInfo as any).email || '',
            roles: (userInfo as any).role ? [(userInfo as any).role] : ((userInfo as any).roles || []),
            createdAt: (userInfo as any).createdAt || new Date().toISOString(),
          };
        } else {
          // getCurrentUser format
          userData = {
            id: userInfo.userId || '',
            userName: userInfo.username || '',
            email: userInfo.email || '',
            roles: userInfo.roles || [],
            createdAt: new Date().toISOString(),
          };
        }

        // Map to User model
        this.currentUser = {
          id: userData.id,
          userName: userData.userName,
          email: userData.email,
          firstName: '',
          lastName: '',
          phoneNumber: null,
          isActive: true,
          emailConfirmed: true,
          lockoutEnabled: false,
          lockoutEnd: null,
          roles: userData.roles,
          createdAt: userData.createdAt,
          updatedAt: null,
          lastLoginAt: null,
        };

        console.log('Current user set:', this.currentUser);

        // Try to find employee by email
        if (this.currentUser.email) {
          this.findEmployeeByEmail(this.currentUser.email);
        }
      },
      error: (error) => {
        console.error('Error loading user data:', error);
      }
    });
  }

  /**
   * Find employee by email
   */
  private findEmployeeByEmail(email: string): void {
    console.log('Searching for employee with email:', email);
    
    this.employeeService.getEmployees({
      searchTerm: email,
      pageNumber: 1,
      pageSize: 10
    }).pipe(
      catchError((error) => {
        console.error('Error searching employees:', error);
        return of({ data: [] });
      })
    ).subscribe({
      next: (response) => {
        console.log('Employee search response:', response);
        
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          // Find exact email match
          const employee = response.data.find((emp: Employee) => 
            emp.email?.toLowerCase() === email.toLowerCase()
          );
          
          if (employee) {
            console.log('Found employee:', employee);
            this.currentEmployee = employee;
          } else {
            console.log('No employee found with matching email');
          }
        } else {
          console.log('No employees found in search results');
        }
      },
      error: (error) => {
        console.error('Error in employee search:', error);
      }
    });
  }

  /**
   * Load employee data by ID
   */
  private loadEmployeeData(employeeId: string): void {
    console.log('Loading employee data for employeeId:', employeeId);
    
    this.employeeService.getEmployeeById(employeeId).pipe(
      catchError((error) => {
        console.error('Error loading employee:', error);
        return of(null);
      })
    ).subscribe({
      next: (employee) => {
        console.log('Employee data received:', employee);
        
        if (employee) {
          this.currentEmployee = employee;
          console.log('Current employee set:', this.currentEmployee);
        } else {
          console.warn('No employee data received from API');
        }
      },
      error: (error) => {
        console.error('Error loading employee data:', error);
      }
    });
  }
}
