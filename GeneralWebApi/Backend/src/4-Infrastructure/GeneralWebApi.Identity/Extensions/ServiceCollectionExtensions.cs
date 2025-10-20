using GeneralWebApi.Identity.Configuration;
using GeneralWebApi.Identity.Middleware;
using GeneralWebApi.Identity.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace GeneralWebApi.Identity.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddCustomAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        // bind the appsettings.json configuration to the AuthenticationSettings, JwtSettings, and ApiKeySettings
        var authSettings = configuration.GetSection("Authentication").Get<AuthenticationSettings>() ?? new();
        services.Configure<AuthenticationSettings>(configuration.GetSection("Authentication"));
        services.Configure<JwtSettings>(configuration.GetSection("Authentication:Jwt"));
        services.Configure<ApiKeySettings>(configuration.GetSection("Authentication:ApiKey"));

        // register the services
        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<IUserService, UserService>();

        // configure the authentication
        var authBuilder = services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = authSettings.DefaultScheme;
            options.DefaultChallengeScheme = authSettings.DefaultScheme;
        });

        // JWT authentication
        if (authSettings.EnableJwt)
        {
            var jwtSettings = authSettings.Jwt;

            // get the key from environment variable
            // if the environment variable is not set, use the key from the configuration
            var secretKey = Environment.GetEnvironmentVariable("JWT_SECRET") ?? jwtSettings.SecretKey;
            var key = Encoding.UTF8.GetBytes(secretKey);

            //var key = Encoding.UTF8.GetBytes(jwtSettings.SecretKey);

            authBuilder.AddJwtBearer("Bearer", options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = jwtSettings.ValidateIssuerSigningKey,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = jwtSettings.ValidateIssuer,
                    ValidIssuer = jwtSettings.Issuer,
                    ValidateAudience = jwtSettings.ValidateAudience,
                    ValidAudience = jwtSettings.Audience,
                    ValidateLifetime = jwtSettings.ValidateLifetime,
                    ClockSkew = TimeSpan.Zero
                };

                options.Events = new JwtBearerEvents
                {
                    OnAuthenticationFailed = context =>
                    {
                        // log the authentication failed
                        return Task.CompletedTask;
                    },
                    OnTokenValidated = context =>
                    {
                        // log the authentication success
                        return Task.CompletedTask;
                    }
                };
            });
        }

        // API Key authentication (handled by the middleware)
        if (authSettings.EnableApiKey)
        {
            // API Key is handled by the middleware, no need to configure here
        }

        // Role based authorization 
        services.AddAuthorization(options =>
        {
            // Single role policies
            options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
            options.AddPolicy("ManagerOnly", policy => policy.RequireRole("Manager"));
            options.AddPolicy("UserOnly", policy => policy.RequireRole("User"));

            // Combined role policies
            options.AddPolicy("UserOrAdmin", policy => policy.RequireRole("User", "Admin"));
            options.AddPolicy("ManagerOrAdmin", policy => policy.RequireRole("Manager", "Admin"));
            options.AddPolicy("AllRoles", policy => policy.RequireRole("User", "Manager", "Admin"));
        });

        return services;
    }

    // middlewares
    public static IApplicationBuilder UseCustomAuthentication(this IApplicationBuilder app)
    {
        //custom middleware for api key authentication
        app.UseMiddleware<ApiKeyMiddleware>();

        // native middleware for authentication and authorization
        app.UseAuthentication();
        app.UseAuthorization();
        return app;
    }
}