// Path: GeneralWebApi/Frontend/general-frontend/src/app/roles/role.model.ts

export interface Role {
  id: string;
  name: string;
  normalizedName: string;
  description: string | null;
  permissions: string[];
  userCount: number;
  isSystemRole: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions?: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: string[];
}

