export interface ApiResponse<T> {
  success: boolean;
  message?: string; // Detailed error message (priority)
  data?: T;
  error?: string; // Error title/type (fallback)
  statusCode?: number;
  timestamp?: string;
}

export interface ApiError {
  status: number;
  message: string;
  details?: unknown;
}
