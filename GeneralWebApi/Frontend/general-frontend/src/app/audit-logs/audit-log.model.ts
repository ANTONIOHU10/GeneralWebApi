// Path: GeneralWebApi/Frontend/general-frontend/src/app/audit-logs/audit-log.model.ts

export interface AuditLog {
  id: number;
  entityType: string; // Employee, Contract, Department, etc.
  entityId: number;
  action: 'Create' | 'Update' | 'Delete' | 'View' | 'Approve' | 'Reject' | 'Export' | 'Login' | 'Logout';
  userId: string;
  userName: string;
  timestamp: string;
  ipAddress: string | null;
  userAgent: string | null;
  changes: string | null; // JSON string of changes
  oldValues: string | null; // JSON string
  newValues: string | null; // JSON string
  description: string | null;
  severity: 'Info' | 'Warning' | 'Error' | 'Critical';
  module: string; // Employees, Contracts, Departments, etc.
}

export interface AuditLogSearchParams {
  entityType?: string;
  action?: string;
  userId?: string;
  module?: string;
  severity?: string;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
}

export const AUDIT_LOG_ACTIONS = [
  'Create',
  'Update',
  'Delete',
  'View',
  'Approve',
  'Reject',
  'Export',
  'Login',
  'Logout',
] as const;

export const AUDIT_LOG_SEVERITIES = [
  'Info',
  'Warning',
  'Error',
  'Critical',
] as const;

export const AUDIT_LOG_MODULES = [
  'Employees',
  'Contracts',
  'Departments',
  'Positions',
  'Approvals',
  'Authentication',
  'System',
] as const;

export const AUDIT_LOG_ENTITY_TYPES = [
  'Employee',
  'Contract',
  'Department',
  'Position',
  'Approval',
  'User',
  'Role',
] as const;

