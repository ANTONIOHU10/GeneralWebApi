using GeneralWebApi.Logging.Templates;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace GeneralWebApi.Logging.Middleware;

public class LoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<LoggingMiddleware> _logger;

    public LoggingMiddleware(RequestDelegate next, ILogger<LoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, LogTemplates.RequestProcessingError);
            throw;
        }
    }
}