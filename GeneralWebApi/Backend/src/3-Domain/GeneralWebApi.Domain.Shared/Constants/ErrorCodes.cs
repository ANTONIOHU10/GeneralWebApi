namespace GeneralWebApi.Domain.Shared.Constants;

/// <summary>
/// Centralized error codes for the application
/// </summary>
public static class ErrorCodes
{
    /// <summary>
    /// Authentication related error codes
    /// </summary>
    public static class Authentication
    {
        public const string InvalidCredentials = "AUTH_001";
        public const string InvalidToken = "AUTH_002";
        public const string TokenExpired = "AUTH_003";
        public const string UserNotFound = "AUTH_004";
        public const string UserLocked = "AUTH_005";
        public const string InvalidRefreshToken = "AUTH_006";
        public const string ClaimsGenerationFailed = "AUTH_007";
    }

    /// <summary>
    /// User management related error codes
    /// </summary>
    public static class User
    {
        public const string UsernameAlreadyExists = "USER_001";
        public const string EmailAlreadyExists = "USER_002";
        public const string UserCreationFailed = "USER_003";
        public const string PasswordUpdateFailed = "USER_004";
        public const string UserNotFound = "USER_005";
        public const string InvalidUserData = "USER_006";
    }

    /// <summary>
    /// Validation related error codes
    /// </summary>
    public static class Validation
    {
        public const string RequiredField = "VAL_001";
        public const string InvalidFormat = "VAL_002";
        public const string InvalidLength = "VAL_003";
        public const string InvalidEmail = "VAL_004";
        public const string WeakPassword = "VAL_005";
    }

    /// <summary>
    /// System related error codes
    /// </summary>
    public static class System
    {
        public const string InternalError = "SYS_001";
        public const string DatabaseError = "SYS_002";
        public const string CacheError = "SYS_003";
        public const string ConfigurationError = "SYS_004";
        public const string ExternalServiceError = "SYS_005";
    }

    /// <summary>
    /// File operation related error codes
    /// </summary>
    public static class File
    {
        public const string FileNotFound = "FILE_001";
        public const string InvalidFileType = "FILE_002";
        public const string FileSizeExceeded = "FILE_003";
        public const string UploadFailed = "FILE_004";
        public const string DeleteFailed = "FILE_005";
    }
}