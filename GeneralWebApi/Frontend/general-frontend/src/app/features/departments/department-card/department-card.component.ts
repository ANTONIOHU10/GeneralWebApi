// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/departments/department-card/department-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Department } from 'app/contracts/departments/department.model';
import {
  BaseCardComponent,
  BaseBadgeComponent,
  BaseButtonComponent,
  BadgeVariant,
} from '../../../Shared/components/base';

/**
 * DepartmentCardComponent - Display component for department information
 * 
 * This is a presentational component that:
 * - Displays department information in a card format
 * - Emits events for user actions (edit, delete, view)
 * - Does NOT handle business logic or confirmations
 * - Parent component (DepartmentListComponent) handles confirmations via DialogService
 */

@Component({
  selector: 'app-department-card',
  standalone: true,
  imports: [
    CommonModule,
    BaseCardComponent,
    BaseBadgeComponent,
    BaseButtonComponent,
  ],
  templateUrl: './department-card.component.html',
  styleUrls: ['./department-card.component.scss'],
})
export class DepartmentCardComponent {
  @Input() department!: Department;
  @Input() showActions = true;

  @Output() edit = new EventEmitter<Department>();
  @Output() delete = new EventEmitter<Department>();
  @Output() view = new EventEmitter<Department>();

  onEdit(): void {
    this.edit.emit(this.department);
  }

  onDelete(): void {
    this.delete.emit(this.department);
  }

  onView(): void {
    this.view.emit(this.department);
  }

  getLevelVariant(): BadgeVariant {
    if (this.department.level === 1) return 'primary';
    if (this.department.level === 2) return 'secondary';
    if (this.department.level === 3) return 'info';
    return 'primary';
  }
}

