using GeneralWebApi.Application.Mappings;
using GeneralWebApi.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace GeneralWebApi.Application.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddCSVExport(this IServiceCollection services)
    {
        services.AddAutoMapper(cfg => cfg.AddMaps(typeof(ExportMappingProfile).Assembly));
        services.AddScoped<ICSVExportService, CSVExportService>();
        return services;
    }
}