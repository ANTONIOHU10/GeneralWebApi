namespace GeneralWebApi.Logging.Services;

/// <summary>
/// Abstraction for application logging. Prefer logging errors in catch blocks;
/// use Debug for success-path logs when needed for troubleshooting.
/// </summary>
public interface ILoggingService
{
    void LogInformation(string message, params object[] args);
    void LogWarning(string message, params object[] args);
    void LogError(string message, params object[] args);
    void LogError(Exception exception, string message, params object[] args);
    void LogCritical(Exception exception, string message, params object[] args);
    void LogDebug(string message, params object[] args);
    void LogDebug(Exception exception, string message, params object[] args);
}