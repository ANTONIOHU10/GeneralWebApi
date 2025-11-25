// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/contracts/contract-card/contract-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contract } from 'app/contracts/contracts/contract.model';
import {
  BaseCardComponent,
  BaseBadgeComponent,
  BaseButtonComponent,
  BadgeVariant,
} from '../../../Shared/components/base';

/**
 * ContractCardComponent - Display component for contract information
 * 
 * This is a presentational component that:
 * - Displays contract information in a card format
 * - Emits events for user actions (edit, delete, view)
 * - Does NOT handle business logic or confirmations
 * - Parent component (ContractListComponent) handles confirmations via DialogService
 */

@Component({
  selector: 'app-contract-card',
  standalone: true,
  imports: [
    CommonModule,
    BaseCardComponent,
    BaseBadgeComponent,
    BaseButtonComponent,
  ],
  templateUrl: './contract-card.component.html',
  styleUrls: ['./contract-card.component.scss'],
})
export class ContractCardComponent {
  @Input() contract!: Contract;
  @Input() showActions = true;

  @Output() edit = new EventEmitter<Contract>();
  @Output() delete = new EventEmitter<Contract>();
  @Output() view = new EventEmitter<Contract>();

  onEdit(): void {
    this.edit.emit(this.contract);
  }

  onDelete(): void {
    this.delete.emit(this.contract);
  }

  onView(): void {
    this.view.emit(this.contract);
  }

  getStatusVariant(): BadgeVariant {
    switch (this.contract.status) {
      case 'Active':
        return 'success';
      case 'Expired':
        return 'warning';
      case 'Terminated':
        return 'danger';
      case 'Pending':
        return 'info';
      default:
        return 'secondary';
    }
  }

  getContractTypeLabel(type: string): string {
    const typeMap: Record<string, string> = {
      'Indefinite': 'Indefinite (无限期)',
      'Fixed': 'Fixed Term (固定期限)',
      'PartTime': 'Part Time (兼职)',
      'Temporary': 'Temporary (临时)',
      'Internship': 'Internship (实习)',
    };
    return typeMap[type] || type;
  }

  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatCurrency(amount: number | null | undefined): string {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }
}

