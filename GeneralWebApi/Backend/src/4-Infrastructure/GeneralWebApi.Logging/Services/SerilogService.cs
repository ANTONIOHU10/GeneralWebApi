
using Microsoft.Extensions.Logging;

namespace GeneralWebApi.Logging.Services;

public class SerilogService(ILogger<SerilogService> logger) : ILoggingService
{

    //DI

    //ILogger is the abstraction for logging
    private readonly ILogger<SerilogService> _logger = logger;


    public void LogInformation(string message, params object[] args)
    {
        //@ is used to format the args as a json object
         _logger.LogInformation("Message: {Message}, Args: {@Args}", message, args);
    }

    public void LogWarning(string message, params object[] args)
    {
        _logger.LogWarning("Message: {Message}, Args: {@Args}", message, args);
    }

        public void LogError(string message, params object[] args)
    {
        _logger.LogError("Message: {Message}, Args: {@Args}", message, args);
    }

    
    public void LogCritical(Exception exception, string message, params object[] args)
    {
        _logger.LogCritical("Message: {Message}, Args: {@Args}", message, args);
    }

    public void LogDebug(Exception exception, string message, params object[] args)
    {
        _logger.LogDebug("Message: {Message}, Args: {@Args}", message, args);
    }
}