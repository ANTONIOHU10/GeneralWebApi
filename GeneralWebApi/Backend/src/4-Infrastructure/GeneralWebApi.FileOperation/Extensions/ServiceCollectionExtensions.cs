using GeneralWebApi.Common.Helpers;
using GeneralWebApi.FileOperation.Services;
using Microsoft.Extensions.DependencyInjection;

namespace GeneralWebApi.FileOperation.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddFileOperationServices(this IServiceCollection services)
    {
        // register file upload service
        services.AddScoped<IFileUploadService, FileUploadService>();

        // register progress service
        services.AddScoped<IProgressService, ProgressService>();

        // register document checks helper
        services.AddScoped<IDocumentChecks, DocumentChecks>();

        // register multipart request helper
        services.AddScoped<IMultipartRequestHelper, MultipartRequestHelper>();

        // register file common service
        services.AddScoped<IFileCommonService, FileCommonService>();

        // register local file storage service
        services.AddScoped<LocalFileStorageService>();

        return services;
    }
}