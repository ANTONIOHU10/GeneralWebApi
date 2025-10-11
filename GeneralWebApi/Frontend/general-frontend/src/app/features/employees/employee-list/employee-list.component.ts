// src/app/features/employees/employee-list/employee-list.component.ts
import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeCardComponent } from '../employee-card/employee-card.component';
import { EmployeeService } from '@core/services/employee.service';
import { Employee } from 'app/contracts/employees/employee.model';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, EmployeeCardComponent],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss'],
})
export class EmployeeListComponent implements OnInit {
  private employeeService = inject(EmployeeService);

  employees = signal<Employee[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadEmployees();
  }

  loadEmployees() {
    this.loading.set(true);
    this.error.set(null);

    console.log('🔄 Loading employees...');

    this.employeeService.getEmployees().subscribe({
      next: response => {
        console.log('📋 Employee response:', response);
        console.log('📋 Response data:', response.data);
        console.log('📋 Data type:', typeof response.data);
        console.log('📋 Is array:', Array.isArray(response.data));

        // 现在 response.data 已经是转换后的 Employee[] 数组
        const employeeArray = Array.isArray(response.data) ? response.data : [];
        this.employees.set(employeeArray);
        this.loading.set(false);

        console.log('✅ Employees loaded:', employeeArray.length);
        console.log('📋 Employee data:', employeeArray);
      },
      error: err => {
        console.error('❌ Error loading employees:', err);
        this.error.set(err.message || 'Failed to load employees');
        this.loading.set(false);

        // 如果 API 调用失败，使用模拟数据
        console.log('🔄 Using mock data due to API error');
        this.loadMockEmployees();
      },
    });
  }

  // 临时模拟数据方法
  loadMockEmployees() {
    const mockEmployees: Employee[] = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-0123',
        department: 'Engineering',
        position: 'Software Developer',
        hireDate: '2023-01-15',
        status: 'Active',
        managerId: '2',
        salary: 75000,
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
        },
      },
      {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1-555-0124',
        department: 'Engineering',
        position: 'Senior Developer',
        hireDate: '2022-06-01',
        status: 'Active',
        managerId: null,
        salary: 95000,
        address: {
          street: '456 Oak Ave',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          country: 'USA',
        },
      },
      {
        id: '3',
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@example.com',
        phone: '+1-555-0125',
        department: 'Marketing',
        position: 'Marketing Manager',
        hireDate: '2023-03-10',
        status: 'Active',
        managerId: '4',
        salary: 65000,
        address: {
          street: '789 Pine St',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
          country: 'USA',
        },
      },
    ];

    this.employees.set(mockEmployees);
    this.loading.set(false);
    console.log('✅ Mock employees loaded:', mockEmployees.length);
  }

  onEditEmployee(employee: Employee) {
    console.log('Edit employee:', employee);
    // TODO: 导航到编辑页面或打开编辑模态框
  }

  onDeleteEmployee(employee: Employee) {
    if (
      confirm(
        `Are you sure you want to delete ${employee.firstName} ${employee.lastName}?`
      )
    ) {
      this.employeeService.deleteEmployee(employee.id).subscribe({
        next: () => {
          // 从列表中移除已删除的员工
          this.employees.update(emps =>
            emps.filter(emp => emp.id !== employee.id)
          );
        },
        error: err => {
          console.error('Error deleting employee:', err);
          alert('Failed to delete employee');
        },
      });
    }
  }

  onViewEmployee(employee: Employee) {
    console.log('View employee:', employee);
    // TODO: 导航到员工详情页面
  }

  onAddEmployee() {
    console.log('Add new employee');
    // TODO: 导航到添加员工页面或打开添加模态框
  }
}
