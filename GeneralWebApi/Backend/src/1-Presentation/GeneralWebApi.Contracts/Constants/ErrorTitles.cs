namespace GeneralWebApi.Contracts.Constants;

/// <summary>
/// Short error titles/categories for error classification and logging
/// These are used as the 'error' field in ApiResponse (short, technical identifiers)
/// </summary>
public static class ErrorTitles
{
    /// <summary>
    /// Common operation error titles
    /// </summary>
    public static class Common
    {
        public const string InvalidRequest = "Invalid request";
        public const string ResourceNotFound = "Resource not found";
        public const string UnauthorizedAccess = "Unauthorized access";
        public const string AccessForbidden = "Access forbidden";
        public const string InternalServerError = "Internal server error";
        public const string RequestTimeout = "Request timeout";
    }

    /// <summary>
    /// Authentication and authorization error titles
    /// </summary>
    public static class Authentication
    {
        public const string InvalidCredentials = "Invalid credentials";
        public const string InvalidToken = "Invalid token";
        public const string TokenExpired = "Token expired";
        public const string UserNotFound = "User not found";
        public const string UserLocked = "User locked";
        public const string InvalidRefreshToken = "Invalid refresh token";
        public const string ClaimsGenerationFailed = "Claims generation failed";
        public const string LogoutFailed = "Logout failed";
        public const string PasswordUpdateFailed = "Password update failed";
    }

    /// <summary>
    /// User management error titles
    /// </summary>
    public static class User
    {
        public const string UsernameAlreadyExists = "Username already exists";
        public const string EmailAlreadyExists = "Email already exists";
        public const string UserCreationFailed = "User creation failed";
        public const string UserNotFound = "User not found";
        public const string InvalidUserData = "Invalid user data";
    }

    /// <summary>
    /// Validation error titles
    /// </summary>
    public static class Validation
    {
        public const string ValidationFailed = "Validation failed";
        public const string RequiredField = "Required field";
        public const string InvalidFormat = "Invalid format";
        public const string InvalidLength = "Invalid length";
        public const string InvalidEmail = "Invalid email";
        public const string WeakPassword = "Weak password";
        public const string ParameterMissing = "Parameter missing";
        public const string InvalidArgument = "Invalid argument";
    }

    /// <summary>
    /// Database error titles
    /// </summary>
    public static class Database
    {
        public const string OperationFailed = "Database operation failed";
        public const string DataIntegrityViolation = "Data integrity violation";
        public const string DuplicateData = "Duplicate data";
        public const string RequiredFieldMissing = "Required field missing";
        public const string DataTooLong = "Data too long";
        public const string NumericValueOutOfRange = "Numeric value out of range";
        public const string Timeout = "Database timeout";
        public const string ReferenceDataNotFound = "Reference data not found";
        public const string DepartmentNotFound = "Department not found";
        public const string PositionNotFound = "Position not found";
        public const string ManagerNotFound = "Manager not found";
    }

    /// <summary>
    /// File operation error titles
    /// </summary>
    public static class File
    {
        public const string FileNotFound = "File not found";
        public const string DirectoryNotFound = "Directory not found";
        public const string InvalidFileType = "Invalid file type";
        public const string FileSizeExceeded = "File size exceeded";
        public const string UploadFailed = "Upload failed";
        public const string DeleteFailed = "Delete failed";
    }

    /// <summary>
    /// External service error titles
    /// </summary>
    public static class ExternalService
    {
        public const string ServiceError = "External service error";
        public const string ServiceUnavailable = "Service unavailable";
    }

    /// <summary>
    /// Business logic error titles
    /// </summary>
    public static class Business
    {
        public const string RuleViolation = "Business rule violation";
        public const string InvalidOperation = "Invalid operation";
        public const string OperationNotSupported = "Operation not supported";
    }
}

