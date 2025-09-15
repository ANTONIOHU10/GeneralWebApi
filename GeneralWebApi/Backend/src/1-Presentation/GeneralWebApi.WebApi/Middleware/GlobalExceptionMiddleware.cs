using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Logging.Templates;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Text.Json;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace GeneralWebApi.Middleware;

/// <summary>
/// Global exception handling middleware that catches all unhandled exceptions
/// and returns a consistent error response format
/// </summary>
public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred while processing the request");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var response = new ApiResponse<object>();

        switch (exception)
        {
            case ArgumentNullException ex:
                response = ApiResponse<object>.ErrorResult(
                    "Invalid request",
                    (int)HttpStatusCode.BadRequest,
                    $"A required parameter is missing or null: {ex.ParamName ?? "Unknown parameter"}"
                );
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                break;

            case ArgumentException ex:
                response = ApiResponse<object>.ErrorResult(
                    "Invalid argument",
                    (int)HttpStatusCode.BadRequest,
                    ex.Message
                );
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                break;

            case KeyNotFoundException ex:
                response = ApiResponse<object>.ErrorResult(
                    "Resource not found",
                    (int)HttpStatusCode.NotFound,
                    ex.Message
                );
                context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                break;

            case InvalidOperationException ex:
                response = ApiResponse<object>.ErrorResult(
                    "Invalid operation",
                    (int)HttpStatusCode.BadRequest,
                    ex.Message
                );
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                break;

            case UnauthorizedAccessException ex:
                response = ApiResponse<object>.ErrorResult(
                    "Unauthorized access",
                    (int)HttpStatusCode.Unauthorized,
                    ex.Message
                );
                context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                break;

            case TimeoutException ex:
                response = ApiResponse<object>.ErrorResult(
                    "Request timeout",
                    (int)HttpStatusCode.RequestTimeout,
                    "The request took too long to process. Please try again later."
                );
                context.Response.StatusCode = (int)HttpStatusCode.RequestTimeout;
                break;

            case HttpRequestException ex:
                response = ApiResponse<object>.ErrorResult(
                    "External service error",
                    (int)HttpStatusCode.BadGateway,
                    $"An error occurred while communicating with an external service: {ex.Message}"
                );
                context.Response.StatusCode = (int)HttpStatusCode.BadGateway;
                break;

            case FileNotFoundException ex:
                response = ApiResponse<object>.ErrorResult(
                    "File not found",
                    (int)HttpStatusCode.NotFound,
                    ex.Message
                );
                context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                break;

            case DirectoryNotFoundException ex:
                response = ApiResponse<object>.ErrorResult(
                    "Directory not found",
                    (int)HttpStatusCode.NotFound,
                    ex.Message
                );
                context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                break;

            case NotSupportedException ex:
                response = ApiResponse<object>.ErrorResult(
                    "Operation not supported",
                    (int)HttpStatusCode.NotImplemented,
                    ex.Message
                );
                context.Response.StatusCode = (int)HttpStatusCode.NotImplemented;
                break;

            case ValidationException ex:
                var validationErrors = ex.Errors?.Select(e => e.ErrorMessage).ToList() ?? new List<string> { ex.Message };
                response = ApiResponse<object>.ErrorResult(
                    "Validation failed",
                    (int)HttpStatusCode.BadRequest,
                    $"One or more validation errors occurred: {string.Join(", ", validationErrors)}"
                );
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                break;

            case BusinessException ex:
                var businessDetails = ex.Details?.ToList() ?? new List<string> { ex.Message };
                response = ApiResponse<object>.ErrorResult(
                    ex.Title ?? "Business rule violation",
                    (int)HttpStatusCode.BadRequest,
                    $"{ex.Message}. Details: {string.Join(", ", businessDetails)}"
                );
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                break;

            // database exception
            case DbUpdateException ex:
                response = HandleDatabaseException(ex);
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                break;

            case SqlException ex:
                response = HandleSqlException(ex);
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                break;

            default:
                response = ApiResponse<object>.ErrorResult(
                    "Internal server error",
                    (int)HttpStatusCode.InternalServerError,
                    "An unexpected error occurred while processing your request. Please contact support if the problem persists."
                );
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                break;
        }

        var jsonResponse = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = true
        });

        await context.Response.WriteAsync(jsonResponse);
    }

    /// <summary>
    /// Handles Entity Framework database update exceptions
    /// </summary>
    private static ApiResponse<object> HandleDatabaseException(DbUpdateException ex)
    {
        var innerException = ex.InnerException as SqlException;
        if (innerException != null)
        {
            return HandleSqlException(innerException);
        }

        // Handle other database exceptions
        if (ex.InnerException?.Message.Contains("FOREIGN KEY") == true)
        {
            return ApiResponse<object>.ErrorResult(
                "Data integrity violation",
                (int)HttpStatusCode.BadRequest,
                "The operation cannot be completed because it would violate data integrity rules. Please check that all referenced records exist."
            );
        }

        return ApiResponse<object>.ErrorResult(
            "Database operation failed",
            (int)HttpStatusCode.BadRequest,
            "An error occurred while saving data to the database. Please try again."
        );
    }

    /// <summary>
    /// Handles SQL Server specific exceptions
    /// </summary>
    private static ApiResponse<object> HandleSqlException(SqlException ex)
    {
        return ex.Number switch
        {
            // Foreign key constraint violation
            547 => ApiResponse<object>.ErrorResult(
                "Reference data not found",
                (int)HttpStatusCode.BadRequest,
                GetForeignKeyErrorMessage(ex.Message)
            ),

            // Primary key constraint violation
            2627 => ApiResponse<object>.ErrorResult(
                "Duplicate data",
                (int)HttpStatusCode.BadRequest,
                "A record with this information already exists. Please check your data and try again."
            ),

            // Unique constraint violation
            2601 => ApiResponse<object>.ErrorResult(
                "Duplicate data",
                (int)HttpStatusCode.BadRequest,
                "A record with this information already exists. Please check your data and try again."
            ),

            // Cannot insert NULL value
            515 => ApiResponse<object>.ErrorResult(
                "Required field missing",
                (int)HttpStatusCode.BadRequest,
                "A required field is missing. Please provide all required information."
            ),

            // String or binary data would be truncated
            8152 => ApiResponse<object>.ErrorResult(
                "Data too long",
                (int)HttpStatusCode.BadRequest,
                "One or more fields contain data that is too long. Please check your input and try again."
            ),

            // Arithmetic overflow error
            8115 => ApiResponse<object>.ErrorResult(
                "Numeric value out of range",
                (int)HttpStatusCode.BadRequest,
                "One or more numeric values are outside the allowed range. Please check your input."
            ),

            // Timeout expired
            -2 => ApiResponse<object>.ErrorResult(
                "Request timeout",
                (int)HttpStatusCode.RequestTimeout,
                "The database operation timed out. Please try again later."
            ),

            // Default SQL exception
            _ => ApiResponse<object>.ErrorResult(
                "Database error",
                (int)HttpStatusCode.BadRequest,
                "An error occurred while processing your request. Please try again."
            )
        };
    }

    /// <summary>
    /// Extracts meaningful information from foreign key constraint error messages
    /// </summary>
    private static string GetForeignKeyErrorMessage(string sqlMessage)
    {
        // Parse the SQL error message to extract table and column information
        if (sqlMessage.Contains("FK_Employees_Departments_DepartmentId"))
        {
            return "The specified department does not exist. Please select a valid department.";
        }

        if (sqlMessage.Contains("FK_Employees_Positions_PositionId"))
        {
            return "The specified position does not exist. Please select a valid position.";
        }

        if (sqlMessage.Contains("FK_Employees_Employees_ManagerId"))
        {
            return "The specified manager does not exist. Please select a valid manager.";
        }

        if (sqlMessage.Contains("FK_Positions_Departments_DepartmentId"))
        {
            return "The specified department does not exist. Please select a valid department for the position.";
        }

        if (sqlMessage.Contains("FK_Departments_Employees_ManagerId"))
        {
            return "The specified manager does not exist. Please select a valid manager for the department.";
        }

        // Generic foreign key error
        if (sqlMessage.Contains("FOREIGN KEY"))
        {
            return "The operation cannot be completed because one or more referenced records do not exist. Please check that all referenced data is valid.";
        }

        return "The operation cannot be completed due to data integrity constraints. Please check your data and try again.";
    }
}

/// <summary>
/// Custom validation exception for business logic validation
/// </summary>
public class ValidationException : Exception
{
    public List<ValidationError> Errors { get; }

    public ValidationException(string message) : base(message)
    {
        Errors = new List<ValidationError>();
    }

    public ValidationException(string message, List<ValidationError> errors) : base(message)
    {
        Errors = errors;
    }
}

/// <summary>
/// Custom business exception for business rule violations
/// </summary>
public class BusinessException : Exception
{
    public string? Title { get; }
    public List<string>? Details { get; }

    public BusinessException(string message) : base(message)
    {
    }

    public BusinessException(string message, string title) : base(message)
    {
        Title = title;
    }

    public BusinessException(string message, string title, List<string> details) : base(message)
    {
        Title = title;
        Details = details;
    }
}

/// <summary>
/// Validation error details
/// </summary>
public class ValidationError
{
    public string PropertyName { get; set; } = string.Empty;
    public string ErrorMessage { get; set; } = string.Empty;
    public object? AttemptedValue { get; set; }
}