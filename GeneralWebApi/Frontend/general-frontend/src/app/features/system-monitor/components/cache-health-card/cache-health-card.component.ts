// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/system-monitor/components/cache-health-card/cache-health-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseBadgeComponent, BaseButtonComponent } from '../../../../Shared/components/base';
import { CacheHealth } from '../../../../core/services/health-check.service';

@Component({
  selector: 'app-cache-health-card',
  standalone: true,
  imports: [CommonModule, BaseBadgeComponent, BaseButtonComponent],
  templateUrl: './cache-health-card.component.html',
  styleUrls: ['./cache-health-card.component.scss'],
})
export class CacheHealthCardComponent {
  @Input() cacheHealth: CacheHealth | null = null;
  @Input() isLoading = false;
  @Output() recover = new EventEmitter<void>();
  @Output() refresh = new EventEmitter<void>();

  /**
   * Get status badge variant
   */
  getStatusVariant(): 'success' | 'danger' | 'warning' {
    if (!this.cacheHealth) return 'warning';
    if (this.cacheHealth.status === 'Healthy') return 'success';
    if (this.cacheHealth.status === 'Unavailable') return 'warning';
    return 'danger';
  }

  /**
   * Get overall performance score (0-100)
   */
  getPerformanceScore(): number {
    if (!this.cacheHealth?.performance) return 0;
    const totalMs = this.cacheHealth.performance.totalMs;
    // Score based on total time: <50ms = 100, >1000ms = 0
    if (totalMs < 50) return 100;
    if (totalMs > 1000) return 0;
    return Math.round(100 - ((totalMs - 50) / 950) * 100);
  }

  /**
   * Get performance level text
   */
  getPerformanceLevel(): string {
    const score = this.getPerformanceScore();
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    if (score >= 30) return 'Slow';
    return 'Poor';
  }

  /**
   * Get performance class
   */
  getPerformanceClass(): string {
    const score = this.getPerformanceScore();
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'fair';
    if (score >= 30) return 'slow';
    return 'poor';
  }

  /**
   * Get operation performance class based on milliseconds
   */
  getOperationClass(ms: number): string {
    if (ms < 10) return 'excellent';
    if (ms < 50) return 'good';
    if (ms < 100) return 'fair';
    if (ms < 500) return 'slow';
    return 'poor';
  }

  /**
   * Calculate operation bar width percentage
   */
  getOperationBarWidth(ms: number): number {
    // Max width at 200ms, min at 1ms
    const maxMs = 200;
    return Math.min(100, Math.max(5, (ms / maxMs) * 100));
  }

  /**
   * Handle recover button click
   */
  onRecover(): void {
    this.recover.emit();
  }

  /**
   * Handle refresh button click
   */
  onRefresh(): void {
    this.refresh.emit();
  }
}

