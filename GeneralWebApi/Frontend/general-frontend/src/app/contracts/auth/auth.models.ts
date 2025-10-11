export interface LoginRequest {
  username: string;
  password: string;
}
// src/app/contracts/auth/auth.models.ts
export interface LoginData {
  userId: string;
  username: string;
  email: string;
  roles: string[];
  profile: string;
  token: {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    expiresAt: string;
    refreshTokenExpiresAt: string;
    scope: string;
  };
}
export interface RefreshTokenRequest {
  refreshToken: string;
}
export interface RefreshTokenData {
  token: {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    expiresAt: string;
    refreshTokenExpiresAt: string;
    scope: string;
  };
}
export interface LogoutRequest {
  refreshToken: string;
}
export interface LogoutData {
  message: string;
}

export interface UpdatePasswordRequest {
  username: string;
  oldPassword: string;
  newPassword: string;
}
export interface UpdatePasswordData {
  message: string;
}

export interface UserInfoRequest {
  username: string;
}
export interface UserInfoData {
  username: string;
  email: string;
  roles: string[];
}

// Backward-compat (deprecated): old flat responses used before ApiResponse<T>
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  roles: string[];
}
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}
export interface LogoutResponse {
  message: string;
}
export interface UpdatePasswordResponse {
  message: string;
}
export interface UserInfoResponse {
  username: string;
  email: string;
  roles: string[];
}
