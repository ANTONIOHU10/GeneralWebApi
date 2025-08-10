using FluentValidation;
using GeneralWebApi.Contracts.Requests;
using GeneralWebApi.Contracts.Validators.AuthValidators;
using GeneralWebApi.Contracts.Validators.ExternalApiConfigValidators;
using Microsoft.Extensions.DependencyInjection;

namespace GeneralWebApi.Contracts.Extensions;

public static class ValidatorExtension
{
    public static IServiceCollection AddValidators(this IServiceCollection services)
    {

        // add login request validator
        services.AddScoped<IValidator<LoginRequest>, LoginRequestValidator>();
        services.AddScoped<IValidator<RegisterRequest>, RegisterRequestValidator>();
        services.AddScoped<IValidator<RefreshTokenRequest>, RefreshTokenRequestValidator>();
        services.AddScoped<IValidator<LogoutRequest>, LogoutRequestValidator>();
        services.AddScoped<IValidator<UpdatePasswordRequest>, UpdatePasswordValidator>();

        // add external api config request validator
        services.AddScoped<IValidator<ExternalApiConfigRequest>, CreateExternalApiConfigValidator>();

        return services;
    }
}