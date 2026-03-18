using Microsoft.Extensions.Configuration;

namespace GeneralWebApi.Extensions;

public static class CORSExtension
{
    // it's possible to add a policy for each endpoint
    // for example: [EnableCors("StrictPolicy")]
    public static IServiceCollection AddCORS(this IServiceCollection services, IConfiguration configuration)
    {
        var devOrigins = configuration
            .GetSection("Cors:Development:AllowedOrigins")
            .Get<string[]>() ?? Array.Empty<string>();

        var prodOrigins = configuration
            .GetSection("Cors:Production:AllowedOrigins")
            .Get<string[]>() ?? Array.Empty<string>();

        services.AddCors(options =>
        {
            options.AddPolicy("DevelopmentPolicy", builder =>
                builder.WithOrigins(devOrigins)
                    .AllowAnyHeader()
                    .AllowAnyMethod());

            options.AddPolicy("ProductionPolicy", builder =>
                builder.WithOrigins(prodOrigins)
                    .AllowAnyHeader()
                    .AllowAnyMethod());
        });
        return services;
    }
}