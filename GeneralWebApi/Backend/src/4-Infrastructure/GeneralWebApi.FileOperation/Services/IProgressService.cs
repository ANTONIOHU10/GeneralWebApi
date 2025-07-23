using GeneralWebApi.FileOperation.Models;

namespace GeneralWebApi.FileOperation.Services;

public interface IProgressService
{
    Task UpdateProgressAsync(string uploadId, UploadProgress progress);
    Task CompleteUploadAsync(string uploadId, string filePath);
    Task FailUploadAsync(string uploadId, string errorMessage);
    Task StartUploadAsync(string uploadId, string fileName, long fileSize);
}
