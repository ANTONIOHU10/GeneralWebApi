using GeneralWebApi.Common.Helpers;
using Microsoft.Extensions.DependencyInjection;

namespace GeneralWebApi.Common.Extensions;

public static class DocumentControllerChecks
{

    public static IServiceCollection AddDocumentControllerChecks(this IServiceCollection services)
    {
        services.AddScoped<IDocumentChecks, DocumentChecks>();
        return services;
    }

}