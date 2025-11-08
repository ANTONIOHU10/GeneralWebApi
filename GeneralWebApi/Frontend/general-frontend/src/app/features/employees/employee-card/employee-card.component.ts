// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/employees/employee-card/employee-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Employee } from 'app/contracts/employees/employee.model';
import {
  BaseCardComponent,
  BaseAvatarComponent,
  BaseBadgeComponent,
  BaseButtonComponent,
  BadgeVariant,
} from '../../../Shared/components/base';

@Component({
  selector: 'app-employee-card',
  standalone: true,
  imports: [
    CommonModule,
    BaseCardComponent,
    BaseAvatarComponent,
    BaseBadgeComponent,
    BaseButtonComponent,
  ],
  templateUrl: './employee-card.component.html',
  styleUrls: ['./employee-card.component.scss'],
})
export class EmployeeCardComponent {
  @Input() employee!: Employee;
  @Input() showActions = true;

  @Output() edit = new EventEmitter<Employee>();
  @Output() delete = new EventEmitter<Employee>();
  @Output() view = new EventEmitter<Employee>();

  onEdit(): void {
    this.edit.emit(this.employee);
  }

  onDelete(): void {
    this.delete.emit(this.employee);
  }

  onView(): void {
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

  getStatusVariant(): BadgeVariant {
    switch (this.employee.status?.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'terminated':
        return 'danger';
      default:
        return 'primary';
    }
  }

  getStatusBorderStyle(): string {
    const statusColors: Record<string, string> = {
      active: 'var(--color-success-500)',
      inactive: 'var(--color-warning-500)',
      terminated: 'var(--color-error-500)',
    };

    const color = statusColors[this.employee.status?.toLowerCase() || 'active'];
    return `border-left: 4px solid ${color};`;
  }
}
