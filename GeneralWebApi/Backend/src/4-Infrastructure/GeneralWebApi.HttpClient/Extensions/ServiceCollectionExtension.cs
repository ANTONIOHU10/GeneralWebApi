using GeneralWebApi.HttpClient.Models;
using GeneralWebApi.HttpClient.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace GeneralWebApi.HttpClient.Extensions;

/// <summary>
/// Service collection extensions for HttpClient module
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Add external HTTP client services to the service collection
    /// </summary>
    public static IServiceCollection AddExternalHttpClient(this IServiceCollection services, IConfiguration configuration)
    {
        // Configure HttpClient options
        services.Configure<HttpClientOptions>(configuration.GetSection("HttpClient"));

        // Register HttpClient factory
        services.AddHttpClient();

        // Register external HTTP client service
        services.AddScoped<IExternalHttpClientService, ExternalHttpClientService>();

        return services;
    }

    /// <summary>
    /// Add external HTTP client services with custom options
    /// </summary>
    public static IServiceCollection AddExternalHttpClient(this IServiceCollection services, Action<HttpClientOptions> configureOptions)
    {
        // Configure HttpClient options
        services.Configure(configureOptions);

        // Register HttpClient factory
        services.AddHttpClient();

        // Register external HTTP client service
        services.AddScoped<IExternalHttpClientService, ExternalHttpClientService>();

        return services;
    }
}