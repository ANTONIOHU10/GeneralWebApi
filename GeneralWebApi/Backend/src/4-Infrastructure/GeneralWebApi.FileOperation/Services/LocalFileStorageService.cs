using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using GeneralWebApi.Logging.Templates;
using System.Security.Cryptography;

namespace GeneralWebApi.FileOperation.Services;

public class LocalFileStorageService
{
    private readonly string _baseStoragePath;
    private readonly ILogger<LocalFileStorageService> _logger;

    public LocalFileStorageService(IConfiguration configuration, ILogger<LocalFileStorageService> logger)
    {
        _baseStoragePath = configuration["FileStorage:BasePath"] ?? Path.Combine(Directory.GetCurrentDirectory(), "Files");
        _logger = logger;

        // Ensure base storage directory exists
        if (!Directory.Exists(_baseStoragePath))
        {
            Directory.CreateDirectory(_baseStoragePath);
        }
    }

    public async Task<string> SaveFileAsync(IFormFile file, string category, CancellationToken cancellationToken = default)
    {
        try
        {
            var categoryPath = Path.Combine(_baseStoragePath, category);
            if (!Directory.Exists(categoryPath))
            {
                Directory.CreateDirectory(categoryPath);
            }

            var extension = Path.GetExtension(file.FileName);
            var uniqueFileName = GenerateUniqueFileName(file.FileName, extension);
            var filePath = Path.Combine(categoryPath, uniqueFileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream, cancellationToken);

            _logger.LogInformation(LogTemplates.FileOperation.FileSaved, filePath);
            return filePath;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, LogTemplates.FileOperation.FileSaveError, file.FileName, category);
            throw;
        }
    }

    public async Task<string> SaveFileFromStreamAsync(Stream fileStream, string fileName, string category, CancellationToken cancellationToken = default)
    {
        try
        {
            var categoryPath = Path.Combine(_baseStoragePath, category);
            if (!Directory.Exists(categoryPath))
            {
                Directory.CreateDirectory(categoryPath);
            }

            var extension = Path.GetExtension(fileName);
            var uniqueFileName = GenerateUniqueFileName(fileName, extension);
            var filePath = Path.Combine(categoryPath, uniqueFileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await fileStream.CopyToAsync(stream, cancellationToken);

            _logger.LogInformation(LogTemplates.FileOperation.FileSavedFromStream, filePath);
            return filePath;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, LogTemplates.FileOperation.FileSaveFromStreamError, fileName, category);
            throw;
        }
    }

    public async Task<Stream> GetFileStreamAsync(string filePath, CancellationToken cancellationToken = default)
    {
        if (!FileExists(filePath))
        {
            throw new FileNotFoundException($"File not found: {filePath}");
        }

        return new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read);
    }

    public bool FileExists(string filePath)
    {
        return File.Exists(filePath);
    }

    public async Task<bool> DeleteFileAsync(string filePath, CancellationToken cancellationToken = default)
    {
        try
        {
            if (FileExists(filePath))
            {
                File.Delete(filePath);
                _logger.LogInformation(LogTemplates.FileOperation.FileDeleted, filePath);
                return true;
            }
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, LogTemplates.FileOperation.FileDeleteError, filePath);
            return false;
        }
    }

    public string GenerateUniqueFileName(string originalFileName, string extension)
    {
        var fileNameWithoutExtension = Path.GetFileNameWithoutExtension(originalFileName);
        var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
        var guid = Guid.NewGuid().ToString("N")[..8];

        return $"{fileNameWithoutExtension}_{timestamp}_{guid}{extension}";
    }

    public string GetFileCategory(string contentType)
    {
        return contentType.ToLower() switch
        {
            var ct when ct.StartsWith("image/") => "images",
            var ct when ct.StartsWith("video/") => "videos",
            var ct when ct.StartsWith("audio/") => "audio",
            var ct when ct.Contains("pdf") => "pdfs",
            var ct when ct.Contains("document") || ct.Contains("word") || ct.Contains("excel") || ct.Contains("powerpoint") => "documents",
            var ct when ct.Contains("text/") => "text",
            var ct when ct.Contains("zip") || ct.Contains("rar") || ct.Contains("7z") => "archives",
            _ => "others"
        };
    }

    public async Task<string> CalculateFileHashAsync(IFormFile file, CancellationToken cancellationToken = default)
    {
        using var sha256 = SHA256.Create();
        using var stream = file.OpenReadStream();
        var hashBytes = await sha256.ComputeHashAsync(stream, cancellationToken);
        return Convert.ToHexString(hashBytes).ToLower();
    }
}