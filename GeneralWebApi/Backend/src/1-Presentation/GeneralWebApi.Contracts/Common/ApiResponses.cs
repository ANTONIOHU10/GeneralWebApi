using GeneralWebApi.Contracts.Constants;

namespace GeneralWebApi.Contracts.Common;

/// <summary>
/// Standard API response wrapper for all endpoints
/// </summary>
/// <typeparam name="T">Type of the data payload</typeparam>
public class ApiResponse<T>
{
    public T? Data { get; set; }

    /// <summary>
    /// Detailed message for the operation result.
    /// For success: describes what was accomplished.
    /// For errors: provides user-friendly, detailed error information that should be displayed to end users.
    /// This is the PRIMARY field that frontend should use for displaying messages to users.
    /// </summary>
    public string? Message { get; set; }

    public bool Success { get; set; }
    public int StatusCode { get; set; }

    /// <summary>
    /// Error title/category (short, technical identifier).
    /// Used for error classification, logging, and as a fallback when Message is not provided.
    /// Examples: "Invalid credentials", "Validation failed", "Resource not found"
    /// This field is primarily for developers/logging systems, not for end-user display.
    /// </summary>
    public string? Error { get; set; }

    public DateTime? Timestamp { get; set; }


    /// <summary>
    /// Creates a successful API response
    /// </summary>
    /// <param name="data">The response data</param>
    /// <param name="message">Success message describing what was accomplished</param>
    public static ApiResponse<T> SuccessResult(T? data, string message = ErrorMessages.Common.OperationSuccessful)
    {
        return new ApiResponse<T>
        {
            Data = data,
            Success = true,
            StatusCode = 200,
            Message = message,
            Timestamp = DateTime.UtcNow
        };
    }


    /// <summary>
    /// Creates an error API response
    /// </summary>
    /// <param name="error">Error title/category (short identifier) - used for classification and logging</param>
    /// <param name="statusCode">HTTP status code</param>
    /// <param name="message">Detailed, user-friendly error message - displayed to end users. If null, uses error value.</param>
    /// <remarks>
    /// Field Responsibilities:
    /// - Error: Short title for error classification (e.g., "Invalid credentials", "Validation failed")
    /// - Message: Detailed, user-friendly description (e.g., "Invalid username or password. Please check your credentials and try again")
    /// Frontend should prioritize Message for user display, use Error as fallback or for logging.
    /// </remarks>
    public static ApiResponse<T> ErrorResult(string error, int statusCode = 400, string? message = null)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Error = error,
            Timestamp = DateTime.UtcNow,
            StatusCode = statusCode,
            Message = message ?? error // Use error as message if message is not provided
        };
    }

    public static ApiResponse<T> NotFound(string error = ErrorMessages.Common.ResourceNotFound) => ErrorResult(error, 404);
    public static ApiResponse<T> Unauthorized(string error = ErrorMessages.Common.UnauthorizedAccess) => ErrorResult(error, 401);
    public static ApiResponse<T> Forbidden(string error = ErrorMessages.Common.AccessForbidden) => ErrorResult(error, 403);
    public static ApiResponse<T> InternalServerError(string error = ErrorMessages.Common.InternalServerError) => ErrorResult(error, 500);
}

