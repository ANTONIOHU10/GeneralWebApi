using GeneralWebApi.FileOperation.Models;
using GeneralWebApi.Domain.Entities;
using Microsoft.AspNetCore.Http;

namespace GeneralWebApi.FileOperation.Services;

public interface IFileUploadService
{
    // Buffer upload with progress tracking (database storage)
    Task<FileDocument> UploadFileWithProgressAsync(IFormFile file, string uploadId);

    // Stream upload for large files
    Task<string> StreamUploadAsync(HttpContext httpContext, CancellationToken cancellationToken);

    // Simple upload without progress
    Task<string> UploadFileAsync(IFormFile file, string folderName);

    // Database storage methods
    Task<FileDocument> UploadFileToDatabaseAsync(IFormFile file, CancellationToken cancellationToken = default);
    Task<byte[]> GetFileContentFromDatabaseAsync(string fileName, CancellationToken cancellationToken = default);
}