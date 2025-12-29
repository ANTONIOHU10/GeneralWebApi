using GeneralWebApi.Email.Configuration;
using GeneralWebApi.Email.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace GeneralWebApi.Email.Extensions;

/// <summary>
/// Extension methods for registering email services
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Register email service
    /// </summary>
    /// <param name="services">Service collection</param>
    /// <param name="configuration">Configuration</param>
    /// <returns>Service collection</returns>
    public static IServiceCollection AddEmailService(this IServiceCollection services, IConfiguration configuration)
    {
        // Register email settings
        services.Configure<EmailSettings>(configuration.GetSection(EmailSettings.SectionName));

        // Register Razor template service (singleton for template caching)
        services.AddSingleton<RazorTemplateService>();

        // Register email service
        services.AddScoped<IEmailService, EmailService>();

        return services;
    }
}

