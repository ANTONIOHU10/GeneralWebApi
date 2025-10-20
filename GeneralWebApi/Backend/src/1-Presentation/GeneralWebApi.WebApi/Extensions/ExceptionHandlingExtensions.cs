using GeneralWebApi.Middleware;

namespace GeneralWebApi.Extensions;

/// <summary>
/// Extension methods for configuring global exception handling
/// </summary>
public static class ExceptionHandlingExtensions
{
    /// <summary>
    /// Adds global exception handling middleware to the application pipeline
    /// </summary>
    /// <param name="app">The web application builder</param>
    /// <returns>The web application builder for chaining</returns>
    public static IApplicationBuilder UseGlobalExceptionHandling(this IApplicationBuilder app)
    {
        return app.UseMiddleware<GlobalExceptionMiddleware>();
    }

    /// <summary>
    /// Adds global exception handling services to the dependency injection container
    /// </summary>
    /// <param name="services">The service collection</param>
    /// <returns>The service collection for chaining</returns>
    public static IServiceCollection AddGlobalExceptionHandling(this IServiceCollection services)
    {
        // Register any additional services needed for exception handling
        // Currently, the middleware is self-contained, but this can be extended
        // for more complex scenarios like custom exception handlers, etc.

        return services;
    }
}
