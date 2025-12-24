// Path: GeneralWebApi/Frontend/general-frontend/src/app/core/services/audit-log.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from './base-http.service';

// Backend AuditLogDto
export interface BackendAuditLog {
  id: number;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName: string;
  ipAddress: string;
  userAgent: string;
  requestPath: string;
  httpMethod: string;
  requestId: string;
  details?: string | null;
  oldValues?: string | null;
  newValues?: string | null;
  severity: string;
  category: string;
  isSuccess: boolean;
  errorMessage?: string | null;
  durationMs?: number | null;
  createdAt: string;
  updatedAt?: string | null;
}

// Generic paged result that matches backend PagedResult<T>
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

// Search parameters that map to AuditLogSearchDto
export interface AuditLogSearch {
  userId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  severity?: string;
  category?: string;
  isSuccess?: boolean;
  startDate?: string;
  endDate?: string;
  pageNumber?: number;
  pageSize?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuditLogService extends BaseHttpService {
  private readonly endpoint = `${this.baseUrl}/AuditLogs`;

  /**
   * Get paged audit logs from backend
   * @param search Optional search criteria
   */
  getAuditLogs(search?: AuditLogSearch): Observable<PagedResult<BackendAuditLog>> {
    return this.get<PagedResult<BackendAuditLog>>(
      this.endpoint,
      search as Record<string, unknown> | undefined
    );
  }
}











