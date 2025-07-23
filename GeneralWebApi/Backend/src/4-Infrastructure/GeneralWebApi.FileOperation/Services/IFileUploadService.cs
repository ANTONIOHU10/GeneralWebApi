using GeneralWebApi.FileOperation.Models;
using Microsoft.AspNetCore.Http;

namespace GeneralWebApi.FileOperation.Services;

public interface IFileUploadService
{
    // Buffer upload with progress tracking
    Task<string> UploadFileWithProgressAsync(IFormFile file, string uploadId);

    // Stream upload for large files
    Task<string> StreamUploadAsync(HttpContext httpContext, CancellationToken cancellationToken);

    // Simple upload without progress
    Task<string> UploadFileAsync(IFormFile file, string folderName);
}