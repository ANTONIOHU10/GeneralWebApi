using GeneralWebApi.Common.Helpers;
using GeneralWebApi.FileOperation.Models;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Integration.Repository;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Net.Http.Headers;

namespace GeneralWebApi.FileOperation.Services;

public class FileUploadService : IFileUploadService
{
    private readonly IDocumentChecks _documentCheckService;
    private readonly IProgressService _progressService;
    private readonly IMultipartRequestHelper _multipartRequestHelper;
    private readonly IFileDocumentRepository _fileDocumentRepository;
    private readonly LocalFileStorageService _fileStorageService;

    public FileUploadService(
        IDocumentChecks documentCheckService,
        IProgressService progressService,
        IMultipartRequestHelper multipartRequestHelper,
        IFileDocumentRepository fileDocumentRepository,
        LocalFileStorageService fileStorageService)
    {
        _documentCheckService = documentCheckService;
        _progressService = progressService;
        _multipartRequestHelper = multipartRequestHelper;
        _fileDocumentRepository = fileDocumentRepository;
        _fileStorageService = fileStorageService;
    }

    public async Task<FileDocument> UploadFileWithProgressAsync(IFormFile file, string uploadId)
    {
        // Get file information
        long fileSize = file.Length;
        string fileName = file.FileName;

        // Record upload start
        await _progressService.StartUploadAsync(uploadId, fileName, fileSize);

        // Validate file
        if (!await ValidateFileAsync(file, uploadId))
        {
            return null;
        }

        // Start upload
        var startTime = DateTime.UtcNow;
        var lastProgressUpdate = startTime;
        long processedBytes = 0;
        const int bufferSize = 8192; // 8KB buffer
        var buffer = new byte[bufferSize];

        // Determine file category
        var fileCategory = _fileStorageService.GetFileCategory(file.ContentType);
        var fileExtension = Path.GetExtension(file.FileName);
        var uniqueFileName = _fileStorageService.GenerateUniqueFileName(file.FileName, fileExtension);
        var fileHash = await _fileStorageService.CalculateFileHashAsync(file);

        // Save file to local file system with progress tracking
        var filePath = await _fileStorageService.SaveFileAsync(file, fileCategory);

        // Create file document for database
        var fileDocument = new FileDocument
        {
            FileName = uniqueFileName,
            FilePath = filePath,
            FileExtension = fileExtension,
            FileSize = fileSize,
            FileContentType = file.ContentType,
            FileCategory = fileCategory,
            OriginalFileName = fileName,
            FileHash = fileHash,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Save to database
        var savedFileDocument = await _fileDocumentRepository.AddFileDocumentAsync(fileDocument);

        // Show 100% progress
        var finalElapsed = DateTime.UtcNow - startTime;
        var finalSpeedMBps = finalElapsed.TotalSeconds > 0 ? fileSize / 1024.0 / 1024.0 / finalElapsed.TotalSeconds : 0;

        // Create final progress
        var finalProgress = new UploadProgress
        {
            UploadId = uploadId,
            FileName = fileName,
            ProgressPercentage = 100.0,
            ProcessedBytes = fileSize,
            TotalBytes = fileSize,
            SpeedMBps = finalSpeedMBps,
            EstimatedTimeRemaining = TimeSpan.Zero,
            StartTime = startTime,
            Status = UploadStatus.Completed
        };

        // Update final progress
        await _progressService.UpdateProgressAsync(uploadId, finalProgress);

        // Complete upload
        await _progressService.CompleteUploadAsync(uploadId, savedFileDocument.FileName);

        return savedFileDocument;
    }

    public async Task<FileDocument> StreamUploadAsync(HttpContext httpContext, CancellationToken cancellationToken)
    {
        var request = httpContext.Request;

        // Check if it's a multipart/form-data request
        if (request.ContentType == null)
        {
            throw new InvalidOperationException("Content-Type is null");
        }

        if (!_multipartRequestHelper.IsMultipartContentType(request.ContentType))
        {
            throw new InvalidOperationException("Not a multipart/form-data request");
        }

        var boundary = _multipartRequestHelper.GetBoundary(
            MediaTypeHeaderValue.Parse(request.ContentType), 4096
        );

        // Create reader for multipart/form-data request
        var reader = new MultipartReader(boundary, request.Body);

        // Read first section
        var section = await reader.ReadNextSectionAsync(cancellationToken);

        FileDocument? savedFileDocument = null;

        // Read next section
        while (section != null)
        {
            var hasContentDisposition = ContentDispositionHeaderValue.TryParse(section.ContentDisposition, out var contentDisposition);

            // If it's a file, save it to local file system
            if (hasContentDisposition && contentDisposition != null && _multipartRequestHelper.HasFileContentDisposition(contentDisposition))
            {
                var originalFileName = Path.GetFileName(contentDisposition.FileName.Value);
                var fileExtension = Path.GetExtension(originalFileName);

                // Validate file
                ValidateFileName(originalFileName);
                ValidateFileExtension(fileExtension);
                ValidateFileSize(section.Body.Length);

                // Read file header to validate signature
                var headerBuffer = new byte[1024];
                var bytesRead = await section.Body.ReadAsync(headerBuffer, cancellationToken);

                // TODO: disable it temporarily
                // if (fileExtension != null)
                // {
                //     ValidateFileSignature(new MemoryStream(headerBuffer, 0, bytesRead), fileExtension);
                // }
                // else
                // {
                //     throw new InvalidOperationException("Invalid file extension");
                // }

                // Determine file category
                var fileCategory = _fileStorageService.GetFileCategory("application/octet-stream");
                var uniqueFileName = _fileStorageService.GenerateUniqueFileName(originalFileName, fileExtension);

                // Read the rest of the file content and save to local file system
                using var memoryStream = new MemoryStream();
                await memoryStream.WriteAsync(headerBuffer, 0, bytesRead, cancellationToken);
                await section.Body.CopyToAsync(memoryStream, cancellationToken);
                memoryStream.Position = 0;

                var filePath = await _fileStorageService.SaveFileFromStreamAsync(memoryStream, uniqueFileName, fileCategory, cancellationToken);

                // Create file document for database
                var fileDocument = new FileDocument
                {
                    FileName = uniqueFileName,
                    FilePath = filePath,
                    FileExtension = fileExtension,
                    FileSize = memoryStream.Length,
                    FileContentType = "application/octet-stream",
                    FileCategory = fileCategory,
                    OriginalFileName = originalFileName,
                    FileHash = "", // Calculate hash if needed
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                // Save to database
                savedFileDocument = await _fileDocumentRepository.AddFileDocumentAsync(fileDocument);

                // Only process first file
                break;
            }

            section = await reader.ReadNextSectionAsync(cancellationToken);
        }

        if (savedFileDocument == null)
        {
            throw new InvalidOperationException("No file was uploaded");
        }

        return savedFileDocument;
    }

    public async Task<FileDocument> UploadFileAsync(IFormFile file, CancellationToken cancellationToken = default)
    {
        // Validate file
        if (file == null || file.Length == 0)
        {
            throw new InvalidOperationException("No file provided");
        }

        ValidateFile(file);

        // Determine file category and generate unique name
        var fileCategory = _fileStorageService.GetFileCategory(file.ContentType);
        var fileExtension = Path.GetExtension(file.FileName);
        var uniqueFileName = _fileStorageService.GenerateUniqueFileName(file.FileName, fileExtension);
        var fileHash = await _fileStorageService.CalculateFileHashAsync(file, cancellationToken);

        // Save file to local file system
        var filePath = await _fileStorageService.SaveFileAsync(file, fileCategory, cancellationToken);

        // Create file document for database
        var fileDocument = new FileDocument
        {
            FileName = uniqueFileName,
            FilePath = filePath,
            FileExtension = fileExtension,
            FileSize = file.Length,
            FileContentType = file.ContentType,
            FileCategory = fileCategory,
            OriginalFileName = file.FileName,
            FileHash = fileHash,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Save to database
        return await _fileDocumentRepository.AddFileDocumentAsync(fileDocument, cancellationToken);
    }

    public async Task<FileDocument> UpdateFileContentAsync(int fileId, IFormFile newFile, CancellationToken cancellationToken = default)
    {
        // Validate new file
        if (newFile == null || newFile.Length == 0)
        {
            throw new InvalidOperationException("No file provided");
        }

        ValidateFile(newFile);

        // Get existing file document
        var existingFile = await _fileDocumentRepository.GetByIdAsync(fileId, cancellationToken);
        if (existingFile == null)
        {
            throw new FileNotFoundException($"File with ID {fileId} not found");
        }

        // Delete old file from local storage
        if (!string.IsNullOrEmpty(existingFile.FilePath))
        {
            await _fileStorageService.DeleteFileAsync(existingFile.FilePath, cancellationToken);
        }

        // Determine new file category and generate unique name
        var fileCategory = _fileStorageService.GetFileCategory(newFile.ContentType);
        var fileExtension = Path.GetExtension(newFile.FileName);
        var uniqueFileName = _fileStorageService.GenerateUniqueFileName(newFile.FileName, fileExtension);
        var fileHash = await _fileStorageService.CalculateFileHashAsync(newFile, cancellationToken);

        // Save new file to local file system
        var newFilePath = await _fileStorageService.SaveFileAsync(newFile, fileCategory, cancellationToken);

        // Update file document
        existingFile.FileName = uniqueFileName;
        existingFile.FilePath = newFilePath;
        existingFile.FileExtension = fileExtension;
        existingFile.FileSize = newFile.Length;
        existingFile.FileContentType = newFile.ContentType;
        existingFile.FileCategory = fileCategory;
        existingFile.OriginalFileName = newFile.FileName;
        existingFile.FileHash = fileHash;
        existingFile.UpdatedAt = DateTime.UtcNow;

        // Save updated document to database
        return await _fileDocumentRepository.UpdateFileDocumentAsync(existingFile, cancellationToken);
    }

    #region Private Methods

    private async Task<bool> ValidateFileAsync(IFormFile file, string uploadId)
    {
        try
        {
            ValidateFile(file);
            return true;
        }
        catch (InvalidOperationException ex)
        {
            await _progressService.FailUploadAsync(uploadId, ex.Message);
            return false;
        }
    }

    private void ValidateFile(IFormFile file)
    {
        ValidateFileName(file.FileName);

        var fileExtension = Path.GetExtension(file.FileName);
        ValidateFileExtension(fileExtension);
        ValidateFileSize(file.Length);

        // TODO: disable it temporarily
        //ValidateFileSignature(file.OpenReadStream(), fileExtension);
    }

    private void ValidateFileName(string? fileName)
    {
        if (string.IsNullOrEmpty(fileName))
        {
            throw new InvalidOperationException("Invalid file name");
        }
    }

    private void ValidateFileExtension(string? fileExtension)
    {
        if (string.IsNullOrEmpty(fileExtension))
        {
            throw new InvalidOperationException("Invalid file extension");
        }
    }

    private void ValidateFileSize(long fileSize)
    {
        if (!_documentCheckService.IsValidSize(fileSize))
        {
            throw new InvalidOperationException("File size is too large");
        }
    }

    private void ValidateFileSignature(Stream fileStream, string fileExtension)
    {
        if (!_documentCheckService.IsValidTypeSignature(fileStream, fileExtension))
        {
            throw new InvalidOperationException("Invalid file type signature");
        }
    }


    private async Task UpdateProgressAsync(string uploadId, string fileName, long fileSize, long processedBytes, DateTime startTime, DateTime currentTime)
    {
        // Calculate elapsed time
        var elapsed = currentTime - startTime;
        var speedMBps = elapsed.TotalSeconds > 0 ? processedBytes / 1024.0 / 1024.0 / elapsed.TotalSeconds : 0;
        var estimatedTimeRemaining = speedMBps > 0 ? TimeSpan.FromSeconds((fileSize - processedBytes) / 1024.0 / 1024.0 / speedMBps) : TimeSpan.Zero;

        // Create progress
        var progress = new UploadProgress
        {
            UploadId = uploadId,
            FileName = fileName,
            ProgressPercentage = (double)processedBytes / fileSize * 100,
            ProcessedBytes = processedBytes,
            TotalBytes = fileSize,
            SpeedMBps = speedMBps,
            EstimatedTimeRemaining = estimatedTimeRemaining,
            StartTime = startTime,
            Status = UploadStatus.InProgress
        };

        // Update progress
        await _progressService.UpdateProgressAsync(uploadId, progress);
    }

    #endregion
}