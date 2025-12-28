namespace GeneralWebApi.Contracts.Constants;

/// <summary>
/// Centralized, user-friendly error messages for the application
/// All messages follow a consistent format: clear, helpful, and professional
/// </summary>
public static class ErrorMessages
{
    /// <summary>
    /// Common operation messages
    /// </summary>
    public static class Common
    {
        public const string OperationSuccessful = "Operation completed successfully";
        public const string OperationFailed = "The operation could not be completed";
        public const string RequestTimeout = "The request took too long to process. Please try again later";
        public const string InvalidRequest = "The request is invalid or malformed";
        public const string ResourceNotFound = "The requested resource could not be found";
        public const string UnauthorizedAccess = "You are not authorized to access this resource";
        public const string AccessForbidden = "Access to this resource is forbidden";
        public const string InternalServerError = "An unexpected error occurred. Please try again or contact support if the problem persists";
    }

    /// <summary>
    /// Authentication and authorization related messages
    /// </summary>
    public static class Authentication
    {
        public const string InvalidCredentials = "Invalid username or password. Please check your credentials and try again";
        public const string InvalidToken = "The provided token is invalid or malformed";
        public const string TokenExpired = "Your session has expired. Please log in again";
        public const string UserNotFound = "The specified user could not be found";
        public const string UserLocked = "This account has been locked. Please contact an administrator";
        public const string InvalidRefreshToken = "The refresh token is invalid or has expired. Please log in again";
        public const string ClaimsGenerationFailed = "Failed to generate user claims. Please try again";
        public const string LogoutFailed = "Failed to log out. Please try again";
        public const string PasswordUpdateFailed = "Failed to update password. Please ensure your new password meets the requirements";
        public const string OldPasswordIncorrect = "The current password you entered is incorrect. Please check and try again";
        public const string PasswordValidationFailed = "The new password does not meet the security requirements. Please ensure it contains at least 8 characters, including uppercase, lowercase, numbers, and special symbols";
        public const string PasswordTooSimilar = "The new password is too similar to your current password. Please choose a password with at least 4 different characters";
    }

    /// <summary>
    /// User management related messages
    /// </summary>
    public static class User
    {
        public const string UsernameAlreadyExists = "This username is already taken. Please choose a different one";
        public const string EmailAlreadyExists = "This email address is already registered. Please use a different email";
        public const string UserCreationFailed = "Failed to create user account. Please check your information and try again";
        public const string UserNotFound = "The specified user could not be found";
        public const string InvalidUserData = "The provided user data is invalid. Please check all fields and try again";
    }

    /// <summary>
    /// Validation related messages
    /// </summary>
    public static class Validation
    {
        public const string ValidationFailed = "One or more validation errors occurred";
        public const string RequiredField = "This field is required";
        public const string InvalidFormat = "The provided format is invalid";
        public const string InvalidLength = "The provided value does not meet the length requirements";
        public const string InvalidEmail = "Please provide a valid email address";
        public const string WeakPassword = "The password does not meet the security requirements";
        public const string ParameterMissing = "A required parameter is missing or null";
        public const string InvalidArgument = "The provided argument is invalid";
    }

    /// <summary>
    /// Database related messages
    /// </summary>
    public static class Database
    {
        public const string OperationFailed = "An error occurred while processing your request. Please try again";
        public const string DataIntegrityViolation = "The operation cannot be completed because it would violate data integrity rules. Please check that all referenced records exist";
        public const string DuplicateData = "A record with this information already exists. Please check your data and try again";
        public const string RequiredFieldMissing = "A required field is missing. Please provide all required information";
        public const string DataTooLong = "One or more fields contain data that is too long. Please check your input and try again";
        public const string NumericValueOutOfRange = "One or more numeric values are outside the allowed range. Please check your input";
        public const string Timeout = "The database operation timed out. Please try again later";
        public const string ReferenceDataNotFound = "One or more referenced records do not exist. Please check that all referenced data is valid";
        
        // Foreign key specific messages
        public const string DepartmentNotFound = "The specified department does not exist. Please select a valid department";
        public const string PositionNotFound = "The specified position does not exist. Please select a valid position";
        public const string ManagerNotFound = "The specified manager does not exist. Please select a valid manager";
        public const string DepartmentForPositionNotFound = "The specified department does not exist. Please select a valid department for the position";
        public const string GenericForeignKeyError = "The operation cannot be completed because one or more referenced records do not exist. Please check that all referenced data is valid";
        public const string DataIntegrityConstraint = "The operation cannot be completed due to data integrity constraints. Please check your data and try again";
    }

    /// <summary>
    /// File operation related messages
    /// </summary>
    public static class File
    {
        public const string FileNotFound = "The requested file could not be found";
        public const string DirectoryNotFound = "The requested directory could not be found";
        public const string InvalidFileType = "The file type is not supported";
        public const string FileSizeExceeded = "The file size exceeds the maximum allowed limit";
        public const string UploadFailed = "Failed to upload the file. Please try again";
        public const string DeleteFailed = "Failed to delete the file. Please try again";
    }

    /// <summary>
    /// External service related messages
    /// </summary>
    public static class ExternalService
    {
        public const string ServiceError = "An error occurred while communicating with an external service";
        public const string ServiceUnavailable = "The external service is currently unavailable. Please try again later";
    }

    /// <summary>
    /// Business logic related messages
    /// </summary>
    public static class Business
    {
        public const string RuleViolation = "The operation violates a business rule";
        public const string InvalidOperation = "This operation is not allowed in the current state";
        public const string OperationNotSupported = "This operation is not supported";
    }
}

