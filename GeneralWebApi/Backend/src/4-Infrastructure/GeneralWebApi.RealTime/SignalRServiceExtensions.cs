using Microsoft.Extensions.DependencyInjection;

namespace GeneralWebApi.RealTime;

public static class SignalRServiceExtensions
{
    public static IServiceCollection AddSignalRService(this IServiceCollection services)
    {
        services.AddScoped<IProgressService, ProgressService>();
        return services;
    }
}