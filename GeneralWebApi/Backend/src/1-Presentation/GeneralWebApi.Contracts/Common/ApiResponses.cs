namespace GeneralWebApi.Contracts.Common;

public class ApiResponse<T>
{
    public T? Data { get; set; }
    public string? Message { get; set; }
    public bool Success { get; set; }
    public int StatusCode { get; set; }
    public string? Error { get; set; }
    public DateTime? Timestamp { get; set; }

    
    public static ApiResponse<T> SuccessResult(T? data, string message = "Operation successful")
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


    public static ApiResponse<T> ErrorResult(string error, int statusCode = 400, string message = "Operation failed")
    {
        return new ApiResponse<T>
        {
            Success = false,
            Error = error,
            Timestamp = DateTime.UtcNow,
            StatusCode = statusCode,
            Message = message
        };
    }

    public static ApiResponse<T> NotFound(string error = "Resource not found") => ErrorResult(error, 404);
    public static ApiResponse<T> Unauthorized(string error = "Unauthorized access") => ErrorResult(error, 401);
    public static ApiResponse<T> Forbidden(string error = "Access forbidden") => ErrorResult(error, 403);
    public static ApiResponse<T> InternalServerError(string error = "Internal server error") => ErrorResult(error, 500);
}

