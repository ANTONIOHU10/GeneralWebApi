// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/positions/position-card/position-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Position } from 'app/contracts/positions/position.model';
import {
  BaseCardComponent,
  BaseBadgeComponent,
  BaseButtonComponent,
  BadgeVariant,
} from '../../../Shared/components/base';

/**
 * PositionCardComponent - Display component for position information
 */
@Component({
  selector: 'app-position-card',
  standalone: true,
  imports: [
    CommonModule,
    BaseCardComponent,
    BaseBadgeComponent,
    BaseButtonComponent,
  ],
  templateUrl: './position-card.component.html',
  styleUrls: ['./position-card.component.scss'],
})
export class PositionCardComponent {
  @Input() position!: Position;
  @Input() showActions = true;

  @Output() edit = new EventEmitter<Position>();
  @Output() delete = new EventEmitter<Position>();
  @Output() view = new EventEmitter<Position>();

  onEdit(): void {
    this.edit.emit(this.position);
  }

  onDelete(): void {
    this.delete.emit(this.position);
  }

  onView(): void {
    this.view.emit(this.position);
  }

  getLevelVariant(): BadgeVariant {
    if (this.position.level === 1) return 'primary';
    if (this.position.level === 2) return 'secondary';
    if (this.position.level === 3) return 'info';
    return 'primary';
  }

  getManagementVariant(): BadgeVariant {
    return this.position.isManagement ? 'warning' : 'success';
  }
}

