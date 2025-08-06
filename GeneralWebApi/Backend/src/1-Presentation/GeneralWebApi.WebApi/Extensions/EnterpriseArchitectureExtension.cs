using System.Text.Json;
using GeneralWebApi.WebApi.Helpers;
using Microsoft.AspNetCore.Mvc;

namespace GeneralWebApi.WebApi.Extensions;

/// <summary>
/// Extension methods for registering enterprise architecture services
/// Used to configure the Json Property Naming Policy and Write Indented
/// </summary>
public static class EnterpriseArchitectureExtension
{
    /// <summary>
    /// Add enterprise architecture services and configurations
    /// </summary>
    public static IServiceCollection AddEnterpriseArchitecture(this IServiceCollection services)
    {

        // Configure JSON serialization for better error handling
        services.Configure<JsonOptions>(options =>
        {
            options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
            options.JsonSerializerOptions.WriteIndented = true;
        });

        return services;
    }

}