// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/system-monitor/components/system-overview-card/system-overview-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SystemHealth, CacheHealth, DatabaseHealth } from '../../../../core/services/health-check.service';

interface ServiceStatus {
  name: string;
  icon: string;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  message?: string;
}

@Component({
  selector: 'app-system-overview-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './system-overview-card.component.html',
  styleUrls: ['./system-overview-card.component.scss'],
})
export class SystemOverviewCardComponent {
  @Input() systemHealth: SystemHealth | null = null;
  @Input() cacheHealth: CacheHealth | null = null;
  @Input() databaseHealth: DatabaseHealth | null = null;
  @Input() isLoading = false;
  @Output() refresh = new EventEmitter<void>();
  @Output() cleanup = new EventEmitter<void>();

  /**
   * Get overall system status
   */
  getOverallStatus(): 'healthy' | 'warning' | 'error' | 'unknown' {
    if (!this.systemHealth) return 'unknown';
    if (this.systemHealth.status === 'Healthy') return 'healthy';
    return 'error';
  }

  /**
   * Get status badge variant
   */
  getStatusVariant(): 'success' | 'danger' | 'warning' {
    const status = this.getOverallStatus();
    if (status === 'healthy') return 'success';
    if (status === 'warning') return 'warning';
    return 'danger';
  }

  /**
   * Get list of all services with their statuses
   */
  getServices(): ServiceStatus[] {
    const services: ServiceStatus[] = [];

    // Cache Service
    if (this.cacheHealth) {
      services.push({
        name: 'Cache',
        icon: 'memory',
        status: this.cacheHealth.status === 'Healthy' ? 'healthy' : 
                this.cacheHealth.status === 'Unavailable' ? 'warning' : 'error',
        message: this.cacheHealth.available ? 'Available' : 'Unavailable'
      });
    } else {
      services.push({ name: 'Cache', icon: 'memory', status: 'unknown' });
    }

    // Database Service
    if (this.databaseHealth) {
      services.push({
        name: 'Database',
        icon: 'storage',
        status: this.databaseHealth.status === 'Healthy' ? 'healthy' : 'error',
        message: this.databaseHealth.available ? 'Connected' : 'Disconnected'
      });
    } else {
      services.push({ name: 'Database', icon: 'storage', status: 'unknown' });
    }

    return services;
  }

  /**
   * Count healthy services
   */
  getHealthyCount(): number {
    return this.getServices().filter(s => s.status === 'healthy').length;
  }

  /**
   * Get total services count
   */
  getTotalCount(): number {
    return this.getServices().length;
  }

  /**
   * Format timestamp for display
   */
  formatTimestamp(timestamp: string): string {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return timestamp;
    }
  }

  /**
   * Get time since last check
   */
  getTimeSinceLastCheck(): string {
    if (!this.systemHealth?.timestamp) return 'Unknown';
    try {
      const date = new Date(this.systemHealth.timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      
      if (diffSec < 60) return `${diffSec}s ago`;
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      return `${Math.floor(diffSec / 3600)}h ago`;
    } catch {
      return 'Unknown';
    }
  }

  /**
   * Handle refresh click
   */
  onRefresh(): void {
    this.refresh.emit();
  }

  /**
   * Handle cleanup click
   */
  onCleanup(): void {
    this.cleanup.emit();
  }
}

