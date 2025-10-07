export interface LoginRequest {username: string; password: string;}
export interface LoginData {accessToken: string; refreshToken: string; expiresIn?: number; tokenType?: string;}

export interface RefreshTokenRequest {refreshToken: string;}
export interface RefreshTokenData {accessToken: string; refreshToken: string; expiresIn?: number; tokenType?: string;}

export interface LogoutRequest {refreshToken: string;}
export interface LogoutData {message: string;}

export interface UpdatePasswordRequest {username: string; oldPassword: string; newPassword: string;}
export interface UpdatePasswordData {message: string;}

export interface UserInfoRequest {username: string;}
export interface UserInfoData {username: string; email: string; roles: string[];}

// Backward-compat (deprecated): old flat responses used before ApiResponse<T>
export interface LoginResponse {accessToken: string; refreshToken: string; roles: string[];}
export interface RefreshTokenResponse {accessToken: string; refreshToken: string;}
export interface LogoutResponse {message: string;}
export interface UpdatePasswordResponse {message: string;}
export interface UserInfoResponse {username: string; email: string; roles: string[];}