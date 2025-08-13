namespace GeneralWebApi.Extensions;

public static class CORSExtension
{
    // it's possible to add a policy for each endpoint
    // for example: [EnableCors("StrictPolicy")]
    public static IServiceCollection AddCORS(this IServiceCollection services)
    {
        services.AddCors(options =>
        {
            options.AddPolicy("DevelopmentPolicy", builder =>
                builder.WithOrigins("http://localhost:4200")
                    .AllowAnyHeader()
                    .AllowAnyMethod());

            options.AddPolicy("DevelopmentPolicy", builder =>
                builder.WithOrigins("https://localhost:7297")
                    .AllowAnyHeader()
                    .AllowAnyMethod());

            options.AddPolicy("ProductionPolicy", builder =>
                builder.WithOrigins("https://myapp.com")
                    .AllowAnyHeader()
                    .AllowAnyMethod());
        });
        return services;
    }
}