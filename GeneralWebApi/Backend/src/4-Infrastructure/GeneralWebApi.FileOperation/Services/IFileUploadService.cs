using GeneralWebApi.FileOperation.Models;
using GeneralWebApi.Domain.Entities;
using Microsoft.AspNetCore.Http;

namespace GeneralWebApi.FileOperation.Services;

public interface IFileUploadService
{
    // Upload file to local file system with progress tracking
    Task<FileDocument> UploadFileWithProgressAsync(IFormFile file, string uploadId);

    // Stream upload for large files to local file system
    Task<FileDocument> StreamUploadAsync(HttpContext httpContext, CancellationToken cancellationToken);

    // Simple upload to local file system
    Task<FileDocument> UploadFileAsync(IFormFile file, CancellationToken cancellationToken = default);

    // Update file content
    Task<FileDocument> UpdateFileContentAsync(int fileId, IFormFile newFile, CancellationToken cancellationToken = default);

}