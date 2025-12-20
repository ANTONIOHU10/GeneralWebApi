using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Contracts.Constants;
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
    // next middleware
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
                    ErrorTitles.Common.InvalidRequest,
                    (int)HttpStatusCode.BadRequest,
                    $"{ErrorMessages.Validation.ParameterMissing}: {ex.ParamName ?? "Unknown parameter"}"
                );
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                break;

            case ArgumentException ex:
                response = ApiResponse<object>.ErrorResult(
                    ErrorTitles.Validation.InvalidArgument,
                    (int)HttpStatusCode.BadRequest,
                    ex.Message
                );
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                break;

            case KeyNotFoundException ex:
                response = ApiResponse<object>.ErrorResult(
                    ErrorTitles.Common.ResourceNotFound,
                    (int)HttpStatusCode.NotFound,
                    ex.Message
                );
                context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                break;

            case InvalidOperationException ex:
                response = ApiResponse<object>.ErrorResult(
                    ErrorTitles.Business.InvalidOperation,
                    (int)HttpStatusCode.BadRequest,
                    ex.Message
                );
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                break;

            case UnauthorizedAccessException ex:
                response = ApiResponse<object>.ErrorResult(
                    ErrorTitles.Common.UnauthorizedAccess,
                    (int)HttpStatusCode.Unauthorized,
                    ex.Message
                );
                context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                break;

            case TimeoutException ex:
                response = ApiResponse<object>.ErrorResult(
                    ErrorTitles.Common.RequestTimeout,
                    (int)HttpStatusCode.RequestTimeout,
                    ErrorMessages.Common.RequestTimeout
                );
                context.Response.StatusCode = (int)HttpStatusCode.RequestTimeout;
                break;

            case HttpRequestException ex:
                response = ApiResponse<object>.ErrorResult(
                    ErrorTitles.ExternalService.ServiceError,
                    (int)HttpStatusCode.BadGateway,
                    $"{ErrorMessages.ExternalService.ServiceError}: {ex.Message}"
                );
                context.Response.StatusCode = (int)HttpStatusCode.BadGateway;
                break;

            case FileNotFoundException ex:
                response = ApiResponse<object>.ErrorResult(
                    ErrorTitles.File.FileNotFound,
                    (int)HttpStatusCode.NotFound,
                    ex.Message
                );
                context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                break;

            case DirectoryNotFoundException ex:
                response = ApiResponse<object>.ErrorResult(
                    ErrorTitles.File.DirectoryNotFound,
                    (int)HttpStatusCode.NotFound,
                    ex.Message
                );
                context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                break;

            case NotSupportedException ex:
                response = ApiResponse<object>.ErrorResult(
                    ErrorTitles.Business.OperationNotSupported,
                    (int)HttpStatusCode.NotImplemented,
                    ex.Message
                );
                context.Response.StatusCode = (int)HttpStatusCode.NotImplemented;
                break;

            case ValidationException ex:
                var validationErrors = ex.Errors?.Select(e => e.ErrorMessage).ToList() ?? new List<string> { ex.Message };
                response = ApiResponse<object>.ErrorResult(
                    ErrorTitles.Validation.ValidationFailed,
                    (int)HttpStatusCode.BadRequest,
                    $"{ErrorMessages.Validation.ValidationFailed}: {string.Join(", ", validationErrors)}"
                );
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                break;

            case BusinessException ex:
                var businessDetails = ex.Details?.ToList() ?? new List<string> { ex.Message };
                response = ApiResponse<object>.ErrorResult(
                    ex.Title ?? ErrorTitles.Business.RuleViolation,
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
                    ErrorTitles.Common.InternalServerError,
                    (int)HttpStatusCode.InternalServerError,
                    ErrorMessages.Common.InternalServerError
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

    #region helper methods
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
                ErrorTitles.Database.DataIntegrityViolation,
                (int)HttpStatusCode.BadRequest,
                ErrorMessages.Database.DataIntegrityViolation
            );
        }

        return ApiResponse<object>.ErrorResult(
            ErrorTitles.Database.OperationFailed,
            (int)HttpStatusCode.BadRequest,
            ErrorMessages.Database.OperationFailed
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
                ErrorTitles.Database.ReferenceDataNotFound,
                (int)HttpStatusCode.BadRequest,
                GetForeignKeyErrorMessage(ex.Message)
            ),

            // Primary key constraint violation
            2627 => ApiResponse<object>.ErrorResult(
                ErrorTitles.Database.DuplicateData,
                (int)HttpStatusCode.BadRequest,
                ErrorMessages.Database.DuplicateData
            ),

            // Unique constraint violation
            2601 => ApiResponse<object>.ErrorResult(
                ErrorTitles.Database.DuplicateData,
                (int)HttpStatusCode.BadRequest,
                ErrorMessages.Database.DuplicateData
            ),

            // Cannot insert NULL value
            515 => ApiResponse<object>.ErrorResult(
                ErrorTitles.Database.RequiredFieldMissing,
                (int)HttpStatusCode.BadRequest,
                ErrorMessages.Database.RequiredFieldMissing
            ),

            // String or binary data would be truncated
            8152 => ApiResponse<object>.ErrorResult(
                ErrorTitles.Database.DataTooLong,
                (int)HttpStatusCode.BadRequest,
                ErrorMessages.Database.DataTooLong
            ),

            // Arithmetic overflow error
            8115 => ApiResponse<object>.ErrorResult(
                ErrorTitles.Database.NumericValueOutOfRange,
                (int)HttpStatusCode.BadRequest,
                ErrorMessages.Database.NumericValueOutOfRange
            ),

            // Timeout expired
            -2 => ApiResponse<object>.ErrorResult(
                ErrorTitles.Database.Timeout,
                (int)HttpStatusCode.RequestTimeout,
                ErrorMessages.Database.Timeout
            ),

            // Default SQL exception
            _ => ApiResponse<object>.ErrorResult(
                ErrorTitles.Database.OperationFailed,
                (int)HttpStatusCode.BadRequest,
                ErrorMessages.Database.OperationFailed
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
            return ErrorMessages.Database.DepartmentNotFound;
        }

        if (sqlMessage.Contains("FK_Employees_Positions_PositionId"))
        {
            return ErrorMessages.Database.PositionNotFound;
        }

        if (sqlMessage.Contains("FK_Employees_Employees_ManagerId"))
        {
            return ErrorMessages.Database.ManagerNotFound;
        }

        if (sqlMessage.Contains("FK_Positions_Departments_DepartmentId"))
        {
            return ErrorMessages.Database.DepartmentForPositionNotFound;
        }

        // Generic foreign key error
        if (sqlMessage.Contains("FOREIGN KEY"))
        {
            return ErrorMessages.Database.GenericForeignKeyError;
        }

        return ErrorMessages.Database.DataIntegrityConstraint;
    }

    #endregion
}

#region custom exceptions classes
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

#endregion