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
        // 绑定配置
        var authSettings = configuration.GetSection("Authentication").Get<AuthenticationSettings>() ?? new();
        services.Configure<AuthenticationSettings>(configuration.GetSection("Authentication"));
        services.Configure<JwtSettings>(configuration.GetSection("Authentication:Jwt"));
        services.Configure<ApiKeySettings>(configuration.GetSection("Authentication:ApiKey"));

        // 注册服务
        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<IUserService, UserService>();

        // 配置认证
        var authBuilder = services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = authSettings.DefaultScheme;
            options.DefaultChallengeScheme = authSettings.DefaultScheme;
        });

        // JWT 认证
        if (authSettings.EnableJwt)
        {
            var jwtSettings = authSettings.Jwt;
            var key = Encoding.UTF8.GetBytes(jwtSettings.SecretKey);

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
                        // 记录认证失败
                        return Task.CompletedTask;
                    },
                    OnTokenValidated = context =>
                    {
                        // 记录认证成功
                        return Task.CompletedTask;
                    }
                };
            });
        }

        // API Key 认证（通过中间件处理）
        if (authSettings.EnableApiKey)
        {
            // API Key 通过中间件处理，不需要在这里配置
        }

        services.AddAuthorization(options =>
        {
            options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
            options.AddPolicy("UserOrAdmin", policy => policy.RequireRole("User", "Admin"));
        });

        return services;
    }

    public static IApplicationBuilder UseCustomAuthentication(this IApplicationBuilder app)
    {
        app.UseMiddleware<ApiKeyMiddleware>();
        app.UseAuthentication();
        app.UseAuthorization();
        return app;
    }
}