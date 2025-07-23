using GeneralWebApi.FileOperation.Services;
using Microsoft.Extensions.DependencyInjection;

namespace GeneralWebApi.FileOperation.Extensions;

public static class SignalRServiceExtensions
{
    public static IServiceCollection AddSignalRService(this IServiceCollection services)
    {
        services.AddScoped<IProgressService, ProgressService>();
        return services;
    }
}