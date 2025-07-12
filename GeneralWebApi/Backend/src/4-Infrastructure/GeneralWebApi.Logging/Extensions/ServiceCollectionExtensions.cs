using GeneralWebApi.Logging.Services;
using Microsoft.Extensions.DependencyInjection;

namespace GeneralWebApi.Logging.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddCustomLogging(this IServiceCollection services)
    {
        services.AddScoped<ILoggingService, SerilogService>();
        return services;
    }
}