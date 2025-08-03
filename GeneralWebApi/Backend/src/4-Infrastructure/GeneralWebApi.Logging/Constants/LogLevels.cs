using Microsoft.Extensions.Logging;

namespace GeneralWebApi.Logging.Constants;

public static class LogLevels
{
    public static class Presentation
    {
        public const LogLevel EndpointCalled = LogLevel.Information;
        public const LogLevel EndpointCalledWithRequest = LogLevel.Information;
        public const LogLevel EndPointCompleted = LogLevel.Information;
        public const LogLevel EndPointFailed = LogLevel.Error;
        public const LogLevel RateLimitExceeded = LogLevel.Warning;
    }

    public static class Application
    {
        public const LogLevel ServiceExecuted = LogLevel.Information;
        public const LogLevel ServiceExecutedWithRequest = LogLevel.Information;
        public const LogLevel ServiceCompleted = LogLevel.Information;
        public const LogLevel ServiceFailed = LogLevel.Error;

        public static class CSVExport
        {
            public const LogLevel ExportStarted = LogLevel.Information;
            public const LogLevel ExportCompleted = LogLevel.Information;
            public const LogLevel ExportFailed = LogLevel.Error;
        }
    }

    public static class Identity
    {
        public const LogLevel UserLoginAttempt = LogLevel.Information;
        public const LogLevel UserLoginSuccess = LogLevel.Information;
        public const LogLevel UserLoginFailed = LogLevel.Error;
        public const LogLevel UserLogout = LogLevel.Information;
        public const LogLevel TokenRefreshAttempt = LogLevel.Information;
        public const LogLevel TokenRefreshSuccess = LogLevel.Information;
        public const LogLevel TokenRefreshFailed = LogLevel.Error;
        public const LogLevel UserRegistration = LogLevel.Information;
        public const LogLevel PasswordUpdate = LogLevel.Information;
        public const LogLevel ApiKeyAuthSuccess = LogLevel.Information;
    }

    public static class Database
    {
        public const LogLevel QueryExecuted = LogLevel.Information;
        public const LogLevel QueryFailed = LogLevel.Error;
    }

    public static class FileOperation
    {
        public const LogLevel FileUploadStarted = LogLevel.Information;
        public const LogLevel FileUploadCompleted = LogLevel.Information;
        public const LogLevel FileUploadFailed = LogLevel.Error;
        public const LogLevel FileDownloadStarted = LogLevel.Information;
        public const LogLevel FileDownloadCompleted = LogLevel.Information;
        public const LogLevel FileDownloadFailed = LogLevel.Error;
        public const LogLevel FileDeleted = LogLevel.Information;
        public const LogLevel FileDeleteFailed = LogLevel.Error;
        public const LogLevel FileValidationPassed = LogLevel.Information;
        public const LogLevel FileValidationFailed = LogLevel.Error;
    }
}