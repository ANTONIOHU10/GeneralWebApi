// src/app/features/employees/employee-card/employee-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Employee } from 'app/contracts/employees/employee.model';

@Component({
  selector: 'app-employee-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-card.component.html',
  styleUrls: ['./employee-card.component.scss'],
})
export class EmployeeCardComponent {
  @Input() employee!: Employee;
  @Input() showActions = true;

  @Output() edit = new EventEmitter<Employee>();
  @Output() delete = new EventEmitter<Employee>();
  @Output() view = new EventEmitter<Employee>();

  onEdit() {
    this.edit.emit(this.employee);
  }

  onDelete() {
    this.delete.emit(this.employee);
  }

  onView() {
    this.view.emit(this.employee);
  }

  getFullName(): string {
    return `${this.employee.firstName} ${this.employee.lastName}`;
  }

  getInitials(): string {
    return `${this.employee.firstName.charAt(0)}${this.employee.lastName.charAt(0)}`.toUpperCase();
  }

  getStatusClass(): string {
    return `status-${this.employee.status}`;
  }
}
