namespace GeneralWebApi.Logging.Templates;

public static class LogTemplates
{
    #region Presentation Layer

    public const string EndpointCalled = "Endpoint called: {Endpoint} by {UserId}";
    public const string EndpointCalledWithRequest = "Endpoint called: {Endpoint} by {UserId} with request: {Request}";
    public const string EndPointCompleted = "Endpoint completed: {Endpoint} with response: {Response}";
    public const string EndPointFailed = "Endpoint failed: {Endpoint} with error: {Error}";
    public const string RateLimitExceeded = "Rate limit exceeded: {Endpoint} by {UserId}";
    public const string RequestProcessingError = "An error occurred while processing the request";
    public const string TestEndpointWorking = "Test endpoint {Version} is working";

    public static class DocumentController
    {
        public const string FileUploadError = "Error during file upload: {ErrorMessage}";
        public const string StreamUploadError = "Error during stream upload: {ErrorMessage}";
        public const string GetFilesError = "Error getting files: {ErrorMessage}";
        public const string FileNotFound = "File not found with ID {Id}: {ErrorMessage}";
        public const string UpdateFileContentError = "Error updating file content for ID {Id}: {ErrorMessage}";
        public const string DownloadFileError = "Error downloading file with ID {Id}: {ErrorMessage}";
        public const string DeleteFileError = "Error deleting file with ID {Id}: {ErrorMessage}";
        public const string ExportCSVError = "Error exporting CSV: {ErrorMessage}";
    }
    #endregion

    #region Application Layer

    public const string ServiceExecuted = "Service executed: {Command} by {UserId}";
    public const string ServiceExecutedWithRequest = "Service executed: {Service} by {UserId} with request: {Request}";
    public const string ServiceCompleted = "Service completed: {Service} with response: {Response}";
    public const string ServiceFailed = "Service failed: {Service} with error: {Error}";

    public static class CSVExport
    {
        public const string ExportStarted = "CSV export started for {EntityType}";
        public const string ExportCompleted = "CSV export completed successfully for {FileName}";
        public const string ExportFailed = "CSV export failed for {EntityType}: {ErrorMessage}";
    }

    #endregion


    #region Infrastructure Layer

    public static class Identity
    {
        public const string UserLoginAttempt = "Login attempt for user {Username} from {IpAddress}";
        public const string UserLoginSuccess = "User {Username} logged in successfully";
        public const string UserLoginFailed = "Login failed for user {Username}: {Reason}";
        public const string UserLogout = "User {Username} logged out successfully";
        public const string TokenRefreshAttempt = "Token refresh attempt";
        public const string TokenRefreshSuccess = "Token refreshed successfully for user {UserId}";
        public const string TokenRefreshFailed = "Token refresh failed: {Reason}";
        public const string UserRegistration = "User {Username} registered successfully";
        public const string PasswordUpdate = "Password updated for user {Username}";
        public const string ApiKeyAuthSuccess = "API Key authentication successful for client {ClientName}";

        // Additional templates for UserService
        public const string InvalidRefreshToken = "Invalid refresh token";
        public const string ExpiredRefreshToken = "Expired refresh token";
        public const string LogoutError = "Logout error: {ErrorMessage}";
        public const string GetUserClaimsError = "Get user claims error for {Username}: {ErrorMessage}";
        public const string UserValidationError = "User validation error: {ErrorMessage}";
        public const string UserRegistrationError = "User registration error: {ErrorMessage}";
        public const string PasswordUpdateError = "Password update error: {ErrorMessage}";
    }

    public static class Database
    {
        public const string ConnectionEstablished = "Database connection established successfully";
        public const string QueryExecuted = "Database query executed: {QueryType} in {Duration}ms";
        public const string QueryFailed = "Database query failed: {QueryType} - {ErrorMessage}";

        // Additional templates for DatabaseMigrationService
        public const string DatabaseCreated = "Database created successfully";
        public const string DatabaseCreatedError = "Error ensuring database created";
        public const string DatabaseDeleted = "Database deleted successfully";
        public const string DatabaseDeletedError = "Error ensuring database deleted";
        public const string DatabaseMigrated = "Database migrated successfully";
        public const string DatabaseMigratedError = "Error migrating database";
        public const string DatabaseHealthCheckError = "Error checking database health";
    }

    public static class FileOperation
    {
        public const string FileUploadStarted = "File upload started: {FileName} ({FileSize} bytes)";
        public const string FileUploadCompleted = "File uploaded successfully: {FileName} -> {FilePath}";
        public const string FileUploadFailed = "File upload failed: {FileName} - {ErrorMessage}";
        public const string FileDownloadStarted = "File download started: {FilePath}";
        public const string FileDownloadCompleted = "File downloaded successfully: {FilePath}";
        public const string FileDownloadFailed = "File download failed: {FilePath} - {ErrorMessage}";
        public const string FileDeleted = "File deleted successfully: {FilePath}";
        public const string FileDeleteFailed = "File deletion failed: {FilePath} - {ErrorMessage}";
        public const string FileValidationPassed = "File validation passed: {FileName} ({Extension})";
        public const string FileValidationFailed = "File validation failed: {FileName} - {Reason}";

        // Additional templates for LocalFileStorageService
        public const string FileSaved = "File saved successfully: {FilePath}";
        public const string FileSaveError = "Error saving file {FileName} to category {Category}";
        public const string FileSavedFromStream = "File saved from stream successfully: {FilePath}";
        public const string FileSaveFromStreamError = "Error saving file from stream {FileName} to category {Category}";
        public const string FileDeleteError = "Error deleting file: {FilePath}";

        // Additional templates for FileCommonService
        public const string FileDeletionStarted = "Deleting file by ID: {FileId}";
        public const string FileNotFoundById = "File not found by ID: {FileId}";
        public const string FileDeletionFailedById = "File deletion failed for ID {FileId}: {ErrorMessage}";
        public const string BulkDeletionStarted = "Starting bulk file deletion";
        public const string BulkDeletionInProgress = "Deleting {FileCount} files";
        public const string BulkDeletionCompleted = "Bulk file deletion completed. {DeletedCount} files deleted";
        public const string BulkDeletionFailed = "Bulk file deletion failed";

        // Additional templates for ProgressService
        public const string UploadCompleted = "Upload completed: {UploadId} -> {FilePath}";
        public const string UploadFailed = "Upload failed: {UploadId} - {ErrorMessage}";
        public const string UploadStarted = "Upload started: {UploadId} - {FileName} ({FileSizeMB:F1}MB)";
    }

    public static class DocumentValidation
    {
        public const string InvalidFileExtension = "Invalid file extension: {Extension}";
        public const string ValidFileExtension = "File extension is valid: {Extension}";
        public const string FileSizeTooLarge = "File size is too large: {FileSize}";
        public const string ValidFileSize = "File size is valid: {FileSize}";
        public const string NoSignatureFound = "No signature found for extension: {Extension}";
        public const string FileTooSmall = "File too small to validate signature";
        public const string FileSignatureCertificate = "File type signature certificate: {FileBytes}";
    }

    #endregion

}