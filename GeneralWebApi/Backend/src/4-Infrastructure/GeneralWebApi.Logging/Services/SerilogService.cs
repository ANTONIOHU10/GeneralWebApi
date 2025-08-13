
using Microsoft.Extensions.Logging;

namespace GeneralWebApi.Logging.Services;

public class SerilogService : ILoggingService
{
    private readonly ILogger<SerilogService> _logger;

    public SerilogService(ILogger<SerilogService> logger)
    {
        _logger = logger;
    }

    public void LogInformation(string message, params object[] args)
    {

        _logger.LogInformation(message, args);
    }

    public void LogWarning(string message, params object[] args)
    {
        _logger.LogWarning(message, args);
    }

    public void LogError(string message, params object[] args)
    {
        _logger.LogError(message, args);
    }

    public void LogCritical(Exception exception, string message, params object[] args)
    {
        _logger.LogCritical(exception, message, args);
    }

    public void LogDebug(Exception exception, string message, params object[] args)
    {
        _logger.LogDebug(exception, message, args);
    }
}