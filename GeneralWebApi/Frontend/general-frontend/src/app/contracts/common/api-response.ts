/**
 * Standard API response wrapper for all endpoints
 * 
 * Field Responsibilities:
 * - message: Detailed, user-friendly message for display to end users (PRIMARY for UI)
 *   - Success: Describes what was accomplished
 *   - Error: Provides detailed, helpful error information
 * 
 * - error: Short error title/category for classification and logging (SECONDARY for UI)
 *   - Used for error classification, logging, and as fallback
 *   - Examples: "Invalid credentials", "Validation failed", "Resource not found"
 *   - Frontend should prioritize message for user display, use error as fallback
 */
export interface ApiResponse<T> {
  success: boolean;
  /** 
   * Detailed message for the operation result (PRIMARY for user display).
   * For errors: user-friendly, detailed error information.
   * For success: describes what was accomplished.
   */
  message?: string;
  data?: T;
  /** 
   * Error title/category (short identifier) - used for classification and logging.
   * Frontend should use this as fallback or for logging, not primary user display.
   */
  error?: string;
  statusCode?: number;
  timestamp?: string;
}

export interface ApiError {
  status: number;
  message: string;
  details?: unknown;
}
