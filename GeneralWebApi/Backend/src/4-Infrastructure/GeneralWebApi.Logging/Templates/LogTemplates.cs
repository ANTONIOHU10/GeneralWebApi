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
        // Login/Logout Templates
        public const string UserLoginAttempt = "Login attempt for user {Username} from {IpAddress}";
        public const string UserLoginSuccess = "User {Username} logged in successfully";
        public const string UserLoginFailed = "Login failed for user {Username}: {Reason}";
        public const string UserLogout = "User {Username} logged out successfully";

        // Token Management Templates
        public const string TokenRefreshAttempt = "Token refresh attempt";
        public const string TokenRefreshSuccess = "Token refreshed successfully for user {UserId}";
        public const string TokenRefreshFailed = "Token refresh failed: {Reason}";
        public const string InvalidRefreshToken = "Invalid refresh token";
        public const string ExpiredRefreshToken = "Expired refresh token";

        // User Registration Templates
        public const string UserRegistration = "User {Username} registered successfully";
        public const string UserRegistrationAttempt = "Registration attempt for username '{Username}' and email '{Email}'";
        public const string EmailAlreadyExists = "Registration failed: Email '{Email}' already exists in database";
        public const string UsernameAlreadyExists = "Registration failed: Username '{Username}' already exists in database";
        public const string UserAndEmailAlreadyExist = "Registration failed: Both username '{Username}' and email '{Email}' already exist in database";
        public const string UserRegistrationValidationPassed = "Registration validation passed for username '{Username}' and email '{Email}'";
        public const string UserCreationStarted = "Creating new user: '{Username}' with email '{Email}' and role '{Role}'";
        public const string UserCreationCompleted = "User creation completed successfully for '{Username}' with ID {UserId}";
        public const string UserRegistrationError = "User registration error: {ErrorMessage}";

        // Password Management Templates
        public const string PasswordUpdate = "Password updated for user {Username}";
        public const string PasswordUpdateError = "Password update error: {ErrorMessage}";
        public const string PasswordHashGenerated = "Password hash generated successfully for user '{Username}'";

        // Authentication Templates
        public const string ApiKeyAuthSuccess = "API Key authentication successful for client {ClientName}";
        public const string UserValidationError = "User validation error: {ErrorMessage}";
        public const string UserValidationAttempt = "Validating user credentials for '{Username}'";
        public const string UserValidationSuccess = "User validation successful for '{Username}'";
        public const string UserValidationFailed = "User validation failed for '{Username}': Invalid credentials";

        // Claims Management Templates
        public const string LogoutError = "Logout error: {ErrorMessage}";
        public const string GetUserClaimsError = "Get user claims error for {Username}: {ErrorMessage}";
        public const string GetUserClaimsAttempt = "Attempting to get user claims for '{Username}'";
        public const string GetUserClaimsFromCache = "Retrieved user claims from cache for '{Username}'";
        public const string GetUserClaimsFromDatabase = "Retrieved user claims from database for '{Username}'";
        public const string UserClaimsCached = "User claims cached successfully for '{Username}' with expiry {ExpiryMinutes} minutes";

        // Database Existence Check Templates
        public const string CheckingEmailExists = "Checking if email '{Email}' already exists in database";
        public const string CheckingUsernameExists = "Checking if username '{Username}' already exists in database";
        public const string EmailExistsResult = "Email existence check result for '{Email}': {Exists}";
        public const string UsernameExistsResult = "Username existence check result for '{Username}': {Exists}";
    }

    public static class Database
    {
        public const string ConnectionEstablished = "Database connection established successfully";
        public const string QueryExecuted = "Database query executed: {QueryType} in {Duration}ms";
        public const string QueryFailed = "Database query failed: {QueryType} - {ErrorMessage}";

        // Database Management Templates
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

        // Local File Storage Templates
        public const string FileSaved = "File saved successfully: {FilePath}";
        public const string FileSaveError = "Error saving file {FileName} to category {Category}";
        public const string FileSavedFromStream = "File saved from stream successfully: {FilePath}";
        public const string FileSaveFromStreamError = "Error saving file from stream {FileName} to category {Category}";
        public const string FileDeleteError = "Error deleting file: {FilePath}";

        // File Common Service Templates
        public const string FileDeletionStarted = "Deleting file by ID: {FileId}";
        public const string FileNotFoundById = "File not found by ID: {FileId}";
        public const string FileDeletionFailedById = "File deletion failed for ID {FileId}: {ErrorMessage}";
        public const string BulkDeletionStarted = "Starting bulk file deletion";
        public const string BulkDeletionInProgress = "Deleting {FileCount} files";
        public const string BulkDeletionCompleted = "Bulk file deletion completed successfully: {FileCount} files deleted";
        public const string BulkDeletionFailed = "Bulk file deletion failed";

        // Progress Service Templates
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

    #region Base Repository
    public static class Repository
    {
        public const string EntityAdded = "Entity {EntityType} with ID {EntityId} added successfully";
        public const string EntityAddFailed = "Failed to add entity {EntityType}";
        public const string EntityNotFound = "Entity {EntityType} with ID {EntityId} not found";
        public const string EntityGetByIdFailed = "Failed to get entity {EntityType} with ID {EntityId}";
        public const string EntitiesRetrieved = "Retrieved {Count} entities of type {EntityType}";
        public const string EntitiesGetAllFailed = "Failed to get all entities {EntityType}";
        public const string EntityUpdated = "Entity {EntityType} with ID {EntityId} updated successfully";
        public const string EntityUpdateFailed = "Failed to update entity {EntityType} with ID {EntityId}";
        public const string EntityDeleteFailed = "Failed to delete entity {EntityType} with ID {EntityId}";
        
        // Range operation templates
        public const string EntitiesAdded = "Added {Count} entities of type {EntityType}";
        public const string EntitiesAddRangeFailed = "Failed to add range of entities {EntityType}";
        public const string EntitiesUpdated = "Updated {Count} entities of type {EntityType}";
        public const string EntitiesUpdateRangeFailed = "Failed to update range of entities {EntityType}";
        public const string EntitySoftDeleted = "Entity {EntityType} with ID {EntityId} soft deleted successfully";
        public const string EntitiesSoftDeleted = "Soft deleted {Count} entities of type {EntityType}";
        public const string EntitiesDeleteRangeFailed = "Failed to delete range of entities {EntityType}";
        
        // User-specific templates
        public const string UserNotFound = "User with {Identifier} not found";
        public const string UserValidationFailed = "Failed to validate user with {Identifier}";
        public const string UserEmailExists = "User with email {Email} already exists";
        public const string UserRegistrationFailed = "Failed to register user with email {Email}";
        public const string UserPasswordUpdateFailed = "Failed to update password for user with email {Email}";
        public const string UserGetByEmailFailed = "Failed to get user with email {Email}";
        public const string UserGetByNameFailed = "Failed to get user with name {Name}";
        
        // File-specific templates
        public const string FileNotFound = "FileDocument with fileName {FileName} not found";
        public const string FileGetByFileNameFailed = "Failed to get FileDocument with fileName {FileName}";
        public const string FilesRetrieved = "Retrieved {Count} FileDocuments";
        public const string FilesGetAllFailed = "Failed to get all FileDocuments";
        public const string FileAddFailed = "Failed to add FileDocument with fileName {FileName}";
        public const string FileUpdateFailed = "Failed to update FileDocument with ID {Id}";
        public const string FileDeleteFailed = "Failed to delete FileDocument with fileName {FileName}";
        public const string FilesDeleteAllFailed = "Failed to delete all FileDocuments";
        
        // ExternalApiConfig-specific templates
        public const string ExternalApiConfigNotFound = "ExternalApiConfig with name {Name} not found or not active";
        public const string ExternalApiConfigGetFailed = "Failed to get ExternalApiConfig with name {Name}";
    }
    #endregion
}

