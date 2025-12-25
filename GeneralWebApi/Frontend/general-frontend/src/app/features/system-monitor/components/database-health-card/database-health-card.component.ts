// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/system-monitor/components/database-health-card/database-health-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseBadgeComponent } from '../../../../Shared/components/base';
import { DatabaseHealth, DatabaseTableSize } from '../../../../core/services/health-check.service';

@Component({
  selector: 'app-database-health-card',
  standalone: true,
  imports: [CommonModule, BaseBadgeComponent],
  templateUrl: './database-health-card.component.html',
  styleUrls: ['./database-health-card.component.scss'],
})
export class DatabaseHealthCardComponent {
  @Input() databaseHealth: DatabaseHealth | null = null;
  @Input() isLoading = false;
  @Output() refresh = new EventEmitter<void>();

  // Expanded state for table details
  isTableListExpanded = false;

  /**
   * Get status badge variant
   */
  getStatusVariant(): 'success' | 'danger' | 'warning' {
    if (!this.databaseHealth) return 'warning';
    if (this.databaseHealth.status === 'Healthy') return 'success';
    return 'danger';
  }

  /**
   * Get connection status color class
   */
  getConnectionClass(): string {
    if (!this.databaseHealth?.connection) return 'neutral';
    const responseTime = this.databaseHealth.connection.responseTime;
    if (responseTime < 100) return 'excellent';
    if (responseTime < 300) return 'good';
    if (responseTime < 500) return 'warning';
    return 'poor';
  }

  /**
   * Get response time performance level
   */
  getResponseTimeLevel(): string {
    if (!this.databaseHealth?.connection) return 'Unknown';
    const responseTime = this.databaseHealth.connection.responseTime;
    if (responseTime < 100) return 'Excellent';
    if (responseTime < 300) return 'Good';
    if (responseTime < 500) return 'Fair';
    return 'Slow';
  }

  /**
   * Calculate storage usage percentage
   */
  getStorageUsagePercent(): number {
    if (!this.databaseHealth?.statistics) return 0;
    const { dataSizeMB, totalSizeMB } = this.databaseHealth.statistics;
    if (totalSizeMB === 0) return 0;
    return Math.round((dataSizeMB / totalSizeMB) * 100);
  }

  /**
   * Format file size for display (MB to appropriate unit)
   */
  formatSize(sizeMB: number): string {
    if (sizeMB < 1) {
      return `${(sizeMB * 1024).toFixed(1)} KB`;
    } else if (sizeMB < 1024) {
      return `${sizeMB.toFixed(2)} MB`;
    } else {
      return `${(sizeMB / 1024).toFixed(2)} GB`;
    }
  }

  /**
   * Format large numbers with locale string
   */
  formatNumber(num: number): string {
    return num.toLocaleString('en-US');
  }

  /**
   * Get percentage for table row count visualization
   */
  getTableRowPercent(table: DatabaseTableSize): number {
    if (!this.databaseHealth?.statistics?.totalRowCount) return 0;
    return Math.round((table.rowCount / this.databaseHealth.statistics.totalRowCount) * 100);
  }

  /**
   * Toggle table list expanded state
   */
  toggleTableList(): void {
    this.isTableListExpanded = !this.isTableListExpanded;
  }

  /**
   * Refresh data
   */
  onRefresh(): void {
    this.refresh.emit();
  }
}

