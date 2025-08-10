using GeneralWebApi.Application.Mappings;
using Microsoft.Extensions.DependencyInjection;

namespace GeneralWebApi.Contracts.Extensions;

public static class MapperExtension
{
    public static IServiceCollection AddExternalApiMapper(this IServiceCollection services)
    {
        services.AddAutoMapper(cfg => cfg.AddMaps(typeof(ExternalApiConfigMapperProfile).Assembly));

        return services;
    }
}