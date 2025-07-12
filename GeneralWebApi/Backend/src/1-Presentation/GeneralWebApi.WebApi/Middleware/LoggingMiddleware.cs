namespace GeneralWebApi.WebApi.Middleware;

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
        using var scope = _logger.BeginScope(new Dictionary<string, object>
        {
            ["StatusCode"] = context.Response.StatusCode
        });

        try
        {
            await _next(context);
        }
        catch (Exception ex)
        
        {
            _logger.LogError(ex, "An error occurred while processing the request");
            throw;
        }
    }
}