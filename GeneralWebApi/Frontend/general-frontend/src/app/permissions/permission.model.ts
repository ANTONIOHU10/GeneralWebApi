// Path: GeneralWebApi/Frontend/general-frontend/src/app/permissions/permission.model.ts

export interface Permission {
  id: string;
  name: string;
  normalizedName: string;
  description: string | null;
  category: string;
  module: string;
  isSystemPermission: boolean;
  roleCount: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface PermissionCategory {
  name: string;
  permissions: Permission[];
}

export const PERMISSION_MODULES = [
  'Employees',
  'Departments',
  'Positions',
  'Contracts',
  'Approvals',
  'Users',
  'Roles',
  'Permissions',
  'System',
] as const;

export const PERMISSION_CATEGORIES = [
  'View',
  'Create',
  'Update',
  'Delete',
  'Approve',
  'Export',
  'Manage',
] as const;

