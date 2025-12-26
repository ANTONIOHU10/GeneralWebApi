// Path: GeneralWebApi/Frontend/general-frontend/src/app/features/system-monitor/system-monitor/system-monitor.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, interval, EMPTY } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { HealthCheckService, CacheHealth, DatabaseHealth, SystemHealth } from '../../../core/services/health-check.service';
import { NotificationService } from '../../../Shared/services';
import { BaseLoadingComponent, BaseErrorComponent } from '../../../Shared/components/base';
import { TranslatePipe } from '@core/pipes/translate.pipe';
import {
  DatabaseHealthCardComponent,
  CacheHealthCardComponent,
  SystemOverviewCardComponent,
} from '../components';

@Component({
  selector: 'app-system-monitor',
  standalone: true,
  imports: [
    CommonModule,
    BaseLoadingComponent,
    BaseErrorComponent,
    DatabaseHealthCardComponent,
    CacheHealthCardComponent,
    SystemOverviewCardComponent,
    TranslatePipe,
  ],
  templateUrl: './system-monitor.component.html',
  styleUrls: ['./system-monitor.component.scss'],
})
export class SystemMonitorComponent implements OnInit, OnDestroy {
  private healthCheckService = inject(HealthCheckService);
  private notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();

  // Health status data
  systemHealth: SystemHealth | null = null;
  cacheHealth: CacheHealth | null = null;
  databaseHealth: DatabaseHealth | null = null;

  // UI state
  isLoading = false;
  error: string | null = null;

  // Auto-refresh interval (30 seconds)
  private readonly REFRESH_INTERVAL = 30000;

  ngOnInit(): void {
    // Load health status on init
    this.loadHealthStatus();

    // Auto-refresh
    interval(this.REFRESH_INTERVAL)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadHealthStatus();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load all health status information
   */
  loadHealthStatus(): void {
    this.isLoading = true;
    this.error = null;

    this.healthCheckService.getSystemHealth().pipe(
      takeUntil(this.destroy$),
      catchError((err) => {
        this.error = err.message || 'Failed to load system health';
        this.isLoading = false;
        return EMPTY;
      })
    ).subscribe({
      next: (health) => {
        this.systemHealth = health;
        this.cacheHealth = health.services.cache;
        this.databaseHealth = health.services.database;
        this.isLoading = false;
      }
    });
  }

  /**
   * Recover cache connection
   */
  recoverCache(): void {
    this.isLoading = true;
    this.healthCheckService.recoverCache().pipe(
      takeUntil(this.destroy$),
      catchError((err) => {
        this.notificationService.error('Error', 'Failed to recover cache', { duration: 3000 });
        this.isLoading = false;
        return EMPTY;
      })
    ).subscribe({
      next: (result) => {
        this.notificationService.success('Success', 'Cache recovery attempted', { duration: 3000 });
        // Reload health status after recovery attempt
        setTimeout(() => this.loadHealthStatus(), 1000);
      }
    });
  }

  /**
   * Run cleanup for expired tokens and sessions
   */
  runCleanup(): void {
    this.isLoading = true;
    this.healthCheckService.cleanup().pipe(
      takeUntil(this.destroy$),
      catchError((err) => {
        this.notificationService.error('Error', 'Failed to run cleanup', { duration: 3000 });
        this.isLoading = false;
        return EMPTY;
      })
    ).subscribe({
      next: (result) => {
        this.notificationService.success(
          'Success',
          `Cleanup completed: ${result.cleanupResults.expiredRefreshTokensRemoved} tokens, ${result.cleanupResults.expiredSessionsRemoved} sessions removed`,
          { duration: 5000 }
        );
        this.isLoading = false;
      }
    });
  }
}
