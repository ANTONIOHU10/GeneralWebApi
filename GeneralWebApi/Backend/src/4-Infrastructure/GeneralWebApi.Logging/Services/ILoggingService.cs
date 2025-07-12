namespace GeneralWebApi.Logging.Services;

public interface ILoggingService
{
    //Log leve
    
    //Usage exmaple: _log.LogInformation("User {UserId} created an order", userId);
    void LogInformation(string message, params object[] args);
    void LogWarning(string message, params object[] args);
    void LogError(string message, params object[] args);
    void LogCritical(Exception exception, string message, params object[] args);
    void LogDebug(Exception exception, string message, params object[] args);
}