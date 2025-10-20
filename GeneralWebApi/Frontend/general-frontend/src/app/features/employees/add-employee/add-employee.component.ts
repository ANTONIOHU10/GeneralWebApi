// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/employees/add-employee/add-employee.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseButtonComponent } from '../../../Shared/components/base/base-button/base-button.component';
import { BaseInputComponent } from '../../../Shared/components/base/base-input/base-input.component';
import { BaseSelectComponent } from '../../../Shared/components/base/base-select/base-select.component';

@Component({
  selector: 'app-add-employee',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    BaseButtonComponent,
    BaseInputComponent,
    BaseSelectComponent
  ],
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.scss'],
})
export class AddEmployeeComponent {
  // 表单数据
  employeeForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    startDate: '',
    salary: ''
  };

  // 部门选项
  departments = [
    { value: 'hr', label: 'Human Resources' },
    { value: 'it', label: 'Information Technology' },
    { value: 'finance', label: 'Finance' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'sales', label: 'Sales' }
  ];

  // 表单提交
  onSubmit() {
    console.log('Employee data:', this.employeeForm);
    // 这里添加实际的提交逻辑
  }

  // 取消操作
  onCancel() {
    console.log('Form cancelled');
    // 这里添加取消逻辑，比如导航回列表页
  }
}
