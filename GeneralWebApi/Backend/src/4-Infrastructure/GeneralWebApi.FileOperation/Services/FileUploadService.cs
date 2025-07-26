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

    public FileUploadService(
        IDocumentChecks documentCheckService,
        IProgressService progressService,
        IMultipartRequestHelper multipartRequestHelper,
        IFileDocumentRepository fileDocumentRepository)
    {
        _documentCheckService = documentCheckService;
        _progressService = progressService;
        _multipartRequestHelper = multipartRequestHelper;
        _fileDocumentRepository = fileDocumentRepository;
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

        // Read file content to memory with progress tracking
        using (var sourceStream = file.OpenReadStream())
        using (var memoryStream = new MemoryStream())
        {
            // Read file
            int bytesRead;
            while ((bytesRead = await sourceStream.ReadAsync(buffer, 0, buffer.Length)) > 0)
            {
                // Write to memory stream
                await memoryStream.WriteAsync(buffer, 0, bytesRead);
                processedBytes += bytesRead;

                // Update progress every 100ms
                var now = DateTime.UtcNow;
                if ((now - lastProgressUpdate).TotalMilliseconds >= 100)
                {
                    await UpdateProgressAsync(uploadId, fileName, fileSize, processedBytes, startTime, now);
                    lastProgressUpdate = now;
                }
            }

            // Get file content
            var fileContent = memoryStream.ToArray();

            // Generate unique filename
            var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
            var uniqueFileName = $"{timestamp}_{file.FileName}";
            var fileExtension = Path.GetExtension(file.FileName);

            // Add to database
            var fileDocument = await _fileDocumentRepository.AddFileDocumentWithContentAsync(
                uniqueFileName,
                fileContent,
                fileExtension,
                file.ContentType);

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
            await _progressService.CompleteUploadAsync(uploadId, fileDocument.FileName);

            return fileDocument;
        }
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

            // If it's a file, save it to database
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
                if (fileExtension != null)
                {
                    ValidateFileSignature(new MemoryStream(headerBuffer, 0, bytesRead), fileExtension);
                }
                else
                {
                    throw new InvalidOperationException("Invalid file extension");
                }

                var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
                var safeFileName = $"{timestamp}_{originalFileName}";

                // Read the rest of the file content
                using var memoryStream = new MemoryStream();
                await memoryStream.WriteAsync(headerBuffer, 0, bytesRead, cancellationToken);
                await section.Body.CopyToAsync(memoryStream, cancellationToken);
                var fileContent = memoryStream.ToArray();

                // Save to database
                savedFileDocument = await _fileDocumentRepository.AddFileDocumentWithContentAsync(
                    safeFileName,
                    fileContent,
                    fileExtension,
                    "application/octet-stream", // Default content type for stream upload
                    cancellationToken);

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

    public async Task<string> UploadFileAsync(IFormFile file, string folderName)
    {
        // Simple upload implementation
        if (file == null || file.Length == 0)
        {
            throw new InvalidOperationException("No file provided");
        }

        // Validate file
        ValidateFile(file);

        // Generate file name
        var fileName = $"{DateTime.Now:yyyyMMdd_HHmmss}_{file.FileName}";
        var filePath = fileName;

        // Save file content to memory (for demonstration)
        using var memoryStream = new MemoryStream();
        await file.CopyToAsync(memoryStream);
        var fileContent = memoryStream.ToArray();

        return filePath;
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
        ValidateFileSignature(file.OpenReadStream(), fileExtension);
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

    private string GenerateFilePath(string fileName)
    {
        string fileExtension = Path.GetExtension(fileName);
        return fileName + "_" + DateTime.Now.ToString("yyyyMMddHHmmss") + fileExtension;
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

    public async Task<FileDocument> UploadFileToDatabaseAsync(IFormFile file, CancellationToken cancellationToken = default)
    {
        // Validate file
        if (file == null || file.Length == 0)
        {
            throw new InvalidOperationException("No file provided");
        }

        ValidateFile(file);

        // Read file content
        using var memoryStream = new MemoryStream();
        await file.CopyToAsync(memoryStream, cancellationToken);
        var fileContent = memoryStream.ToArray();

        // Generate unique filename
        var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
        var fileName = $"{timestamp}_{file.FileName}";
        var fileExtension = Path.GetExtension(file.FileName);

        // Add to database
        return await _fileDocumentRepository.AddFileDocumentWithContentAsync(
            fileName,
            fileContent,
            fileExtension,
            file.ContentType,
            cancellationToken);
    }

    public async Task<byte[]> GetFileContentFromDatabaseAsync(string fileName, CancellationToken cancellationToken = default)
    {
        return await _fileDocumentRepository.GetFileContentAsync(fileName, cancellationToken);
    }



    #endregion
}