using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Versioning;

namespace GeneralWebApi.Extensions;

/// <summary>
/// Extension methods for API versioning configuration
/// </summary>
public static class ApiVersioningExtension
{
    /// <summary>
    /// Add API versioning services with comprehensive configuration
    /// </summary>
    public static IServiceCollection AddApiVersioningServices(this IServiceCollection services)
    {
        // Add API versioning with comprehensive configuration
        services.AddApiVersioning(options =>
        {
            options.DefaultApiVersion = new ApiVersion(1, 0);
            options.AssumeDefaultVersionWhenUnspecified = true;
            options.ReportApiVersions = true;

            // Configure the ApiVersionReader to use multiple sources
            options.ApiVersionReader = ApiVersionReader.Combine(
                // Read the version from the url segment
                new UrlSegmentApiVersionReader(),
                // Read the version from the header
                new HeaderApiVersionReader("X-API-Version"),
                // Read the version from the media type
                new MediaTypeApiVersionReader("version"),
                // Read the version from the query string
                new QueryStringApiVersionReader("api-version")
            );
        });

        services.AddVersionedApiExplorer(options =>
        {
            options.GroupNameFormat = "'v'VVV";
            options.SubstituteApiVersionInUrl = true;
        });

        return services;
    }
}