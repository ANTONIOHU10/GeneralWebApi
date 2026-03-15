using Microsoft.Extensions.Logging;

namespace GeneralWebApi.Logging.Constants;

public static class LogLevels
{
    public static class Presentation
    {
        public const LogLevel EndpointCalled = LogLevel.Debug;
        public const LogLevel EndpointCalledWithRequest = LogLevel.Debug;
        public const LogLevel EndPointCompleted = LogLevel.Debug;
        public const LogLevel EndPointFailed = LogLevel.Error;
        public const LogLevel RateLimitExceeded = LogLevel.Warning;
    }

    public static class Application
    {
        public const LogLevel ServiceExecuted = LogLevel.Debug;
        public const LogLevel ServiceExecutedWithRequest = LogLevel.Debug;
        public const LogLevel ServiceCompleted = LogLevel.Debug;
        public const LogLevel ServiceFailed = LogLevel.Error;

        public static class CSVExport
        {
            public const LogLevel ExportStarted = LogLevel.Debug;
            public const LogLevel ExportCompleted = LogLevel.Debug;
            public const LogLevel ExportFailed = LogLevel.Error;
        }
    }

    public static class Identity
    {
        public const LogLevel UserLoginAttempt = LogLevel.Debug;
        public const LogLevel UserLoginSuccess = LogLevel.Information;
        public const LogLevel UserLoginFailed = LogLevel.Error;
        public const LogLevel UserLogout = LogLevel.Debug;
        public const LogLevel TokenRefreshAttempt = LogLevel.Debug;
        public const LogLevel TokenRefreshSuccess = LogLevel.Information;
        public const LogLevel TokenRefreshFailed = LogLevel.Error;
        public const LogLevel UserRegistration = LogLevel.Information;
        public const LogLevel PasswordUpdate = LogLevel.Information;
        public const LogLevel ApiKeyAuthSuccess = LogLevel.Information;
    }

    public static class Database
    {
        public const LogLevel QueryExecuted = LogLevel.Debug;
        public const LogLevel QueryFailed = LogLevel.Error;
    }

    public static class FileOperation
    {
        public const LogLevel FileUploadStarted = LogLevel.Debug;
        public const LogLevel FileUploadCompleted = LogLevel.Debug;
        public const LogLevel FileUploadFailed = LogLevel.Error;
        public const LogLevel FileDownloadStarted = LogLevel.Debug;
        public const LogLevel FileDownloadCompleted = LogLevel.Debug;
        public const LogLevel FileDownloadFailed = LogLevel.Error;
        public const LogLevel FileDeleted = LogLevel.Debug;
        public const LogLevel FileDeleteFailed = LogLevel.Error;
        public const LogLevel FileValidationPassed = LogLevel.Debug;
        public const LogLevel FileValidationFailed = LogLevel.Error;
    }
}