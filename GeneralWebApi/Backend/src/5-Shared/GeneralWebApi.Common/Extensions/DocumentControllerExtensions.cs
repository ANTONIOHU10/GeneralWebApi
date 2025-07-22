using GeneralWebApi.Common.Helpers;
using Microsoft.Extensions.DependencyInjection;

namespace GeneralWebApi.Common.Extensions;

public static class DocumentControllerExtensions
{

    public static IServiceCollection AddCustomDocumentHelper(this IServiceCollection services)
    {
        // add document checks
        services.AddScoped<IDocumentChecks, DocumentChecks>();

        // for stream upload
        services.AddScoped<IMultipartRequestHelper, MultipartRequestHelper>();
        return services;
    }

}