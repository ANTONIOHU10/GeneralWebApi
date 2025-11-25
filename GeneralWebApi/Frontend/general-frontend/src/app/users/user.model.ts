// Path: GeneralWebApi/Frontend/general-frontend/src/app/users/user.model.ts

export interface User {
  id: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  isActive: boolean;
  emailConfirmed: boolean;
  lockoutEnabled: boolean;
  lockoutEnd: string | null;
  roles: string[];
  createdAt: string;
  updatedAt: string | null;
  lastLoginAt: string | null;
}

export interface CreateUserRequest {
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  password: string;
  roles?: string[];
  isActive?: boolean;
}

export interface UpdateUserRequest {
  userName?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  roles?: string[];
  isActive?: boolean;
}

