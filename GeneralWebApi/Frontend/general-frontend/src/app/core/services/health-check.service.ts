// Path: GeneralWebApi/Frontend/general-frontend/src/app/core/services/health-check.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from './base-http.service';

/**
 * Health check response interfaces
 */
export interface CacheHealth {
  status: string;
  available: boolean;
  testResult?: string;
  performance?: {
    setOperationMs: number;
    getOperationMs: number;
    removeOperationMs: number;
    totalMs: number;
  };
  error?: string;
  message?: string;
  fallbackEnabled?: boolean;
  timestamp: string;
}

export interface DatabaseTableSize {
  tableName: string;
  rowCount: number;
  totalSizeMB: number;
  usedSizeMB: number;
  dataSizeMB: number;
}

export interface DatabaseStatistics {
  tableCount: number;
  totalSizeMB: number;
  dataSizeMB: number;
  logSizeMB: number;
  totalRowCount: number;
  largestTables: DatabaseTableSize[];
  error?: string;
}

export interface DatabaseHealth {
  status: string;
  available: boolean;
  connection?: {
    status: string;
    responseTime: number;
    userCount: number;
  };
  statistics?: DatabaseStatistics;
  error?: string;
  timestamp: string;
}

export interface SystemHealth {
  status: string;
  timestamp: string;
  services: {
    cache: CacheHealth;
    database: DatabaseHealth;
    refreshTokens?: any;
    userSessions?: any;
  };
  error?: string;
}

/**
 * Health Check Service
 * Handles all health check related API calls
 */
@Injectable({
  providedIn: 'root',
})
export class HealthCheckService extends BaseHttpService {
  protected endpoint = '/health';

  /**
   * Get overall system health
   * Note: Health endpoints return data directly, not wrapped in ApiResponse
   */
  getSystemHealth(): Observable<SystemHealth> {
    return this.get<SystemHealth>(this.endpoint, undefined, { extractData: false });
  }

  /**
   * Get cache health status
   * Note: Health endpoints return data directly, not wrapped in ApiResponse
   */
  getCacheHealth(): Observable<CacheHealth> {
    return this.get<CacheHealth>(`${this.endpoint}/cache`, undefined, { extractData: false });
  }

  /**
   * Get database health status
   * Note: Health endpoints return data directly, not wrapped in ApiResponse
   */
  getDatabaseHealth(): Observable<DatabaseHealth> {
    return this.get<DatabaseHealth>(`${this.endpoint}/database`, undefined, { extractData: false });
  }

  /**
   * Recover cache connection
   * Note: Health endpoints return data directly, not wrapped in ApiResponse
   */
  recoverCache(): Observable<{ status: string; timestamp: string; cacheAvailable: boolean }> {
    return this.post<{ status: string; timestamp: string; cacheAvailable: boolean }>(
      `${this.endpoint}/cache/recover`,
      {},
      { extractData: false }
    );
  }

  /**
   * Cleanup expired tokens and sessions
   * Note: Health endpoints return data directly, not wrapped in ApiResponse
   */
  cleanup(): Observable<{
    status: string;
    timestamp: string;
    cleanupResults: {
      expiredRefreshTokensRemoved: number;
      expiredSessionsRemoved: number;
    };
  }> {
    return this.post<{
      status: string;
      timestamp: string;
      cleanupResults: {
        expiredRefreshTokensRemoved: number;
        expiredSessionsRemoved: number;
      };
    }>(`${this.endpoint}/cleanup`, {}, { extractData: false });
  }
}

