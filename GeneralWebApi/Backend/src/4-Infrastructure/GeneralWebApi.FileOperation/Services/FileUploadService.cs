using GeneralWebApi.Common.Helpers;
using GeneralWebApi.FileOperation.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Net.Http.Headers;
using System.IO;

namespace GeneralWebApi.FileOperation.Services;

public class FileUploadService : IFileUploadService
{
    private readonly IDocumentChecks _documentCheckService;
    private readonly IProgressService _progressService;
    private readonly IMultipartRequestHelper _multipartRequestHelper;

    public FileUploadService(
        IDocumentChecks documentCheckService,
        IProgressService progressService,
        IMultipartRequestHelper multipartRequestHelper)
    {
        _documentCheckService = documentCheckService;
        _progressService = progressService;
        _multipartRequestHelper = multipartRequestHelper;
    }

    public async Task<string> UploadFileWithProgressAsync(IFormFile file, string uploadId)
    {
        // get the file information
        long fileSize = file.Length;
        string fileName = file.FileName;
        string fileExtension = Path.GetExtension(fileName);

        // record the upload start
        await _progressService.StartUploadAsync(uploadId, fileName, fileSize);

        // validate the file
        if (!await ValidateFileAsync(file, uploadId))
        {
            return string.Empty;
        }

        // get the desktop path
        string desktopPath = Environment.GetFolderPath(Environment.SpecialFolder.Desktop);
        string filePath = Path.Combine(desktopPath, fileName + "_" + DateTime.Now.ToString("yyyyMMddHHmmss") + fileExtension);

        // start the upload
        var startTime = DateTime.UtcNow;
        var lastProgressUpdate = startTime;
        long processedBytes = 0;
        const int bufferSize = 8192; // 8KB buffer
        var buffer = new byte[bufferSize];

        // open the source stream and target stream
        using (var sourceStream = file.OpenReadStream())
        using (var targetStream = System.IO.File.Create(filePath))
        {
            // read the file
            int bytesRead;
            while ((bytesRead = await sourceStream.ReadAsync(buffer, 0, buffer.Length)) > 0)
            {
                // write the target stream
                await targetStream.WriteAsync(buffer, 0, bytesRead);
                processedBytes += bytesRead;

                // update the progress every 100ms
                var now = DateTime.UtcNow;
                if ((now - lastProgressUpdate).TotalMilliseconds >= 100)
                {
                    await UpdateProgressAsync(uploadId, fileName, fileSize, processedBytes, startTime, now);
                    lastProgressUpdate = now;
                }
            }
        }

        // show the 100% progress
        var finalElapsed = DateTime.UtcNow - startTime;
        var finalSpeedMBps = finalElapsed.TotalSeconds > 0 ? fileSize / 1024.0 / 1024.0 / finalElapsed.TotalSeconds : 0;

        // create the final progress
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

        // update the final progress
        await _progressService.UpdateProgressAsync(uploadId, finalProgress);

        // complete the upload
        await _progressService.CompleteUploadAsync(uploadId, filePath);

        return filePath;
    }

    public async Task<string> StreamUploadAsync(HttpContext httpContext, CancellationToken cancellationToken)
    {
        var request = httpContext.Request;

        // check if the request is a multipart/form-data request
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

        // create the reader for the multipart/form-data request
        var reader = new MultipartReader(boundary, request.Body);

        // read the first section
        var section = await reader.ReadNextSectionAsync(cancellationToken);

        string? savedFilePath = null;
        string desktopPath = Environment.GetFolderPath(Environment.SpecialFolder.Desktop);

        // read the next section
        while (section != null)
        {
            var hasContentDisposition = ContentDispositionHeaderValue.TryParse(section.ContentDisposition, out var contentDisposition);

            // if it is a file, save it to the desktop
            if (hasContentDisposition && contentDisposition != null && _multipartRequestHelper.HasFileContentDisposition(contentDisposition))
            {
                var originalFileName = Path.GetFileName(contentDisposition.FileName.Value);
                var fileExtension = Path.GetExtension(originalFileName);

                // validate the file
                if (string.IsNullOrEmpty(originalFileName))
                {
                    throw new InvalidOperationException("Invalid file name");
                }

                if (!_documentCheckService.IsValidExtension(originalFileName))
                {
                    throw new InvalidOperationException("Invalid file extension");
                }

                if (!_documentCheckService.IsValidSize(section.Body.Length))
                {
                    throw new InvalidOperationException("File size is too large");
                }

                if (string.IsNullOrEmpty(fileExtension))
                {
                    throw new InvalidOperationException("Invalid file extension");
                }

                // read the file header to validate the signature
                var headerBuffer = new byte[1024];
                var bytesRead = await section.Body.ReadAsync(headerBuffer, cancellationToken);
                if (!_documentCheckService.IsValidTypeSignature(new MemoryStream(headerBuffer, 0, bytesRead), fileExtension))
                {
                    throw new InvalidOperationException("Invalid file type signature");
                }

                var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
                var safeFileName = $"{timestamp}_{originalFileName}";
                savedFilePath = Path.Combine(desktopPath, safeFileName);

                // save the file to the desktop
                await using var targetStream = System.IO.File.Create(savedFilePath);

                // write the file header
                await targetStream.WriteAsync(headerBuffer, 0, bytesRead, cancellationToken);
                // write the rest of the file
                await section.Body.CopyToAsync(targetStream, cancellationToken);

                // only process the first file
                break;
            }

            section = await reader.ReadNextSectionAsync(cancellationToken);
        }

        if (string.IsNullOrEmpty(savedFilePath))
        {
            throw new InvalidOperationException("No file was uploaded");
        }

        return savedFilePath;
    }

    public async Task<string> UploadFileAsync(IFormFile file, string folderName)
    {
        // simple upload implementation
        if (file == null || file.Length == 0)
        {
            throw new InvalidOperationException("No file provided");
        }

        // validate the file
        if (!_documentCheckService.IsValidExtension(file.FileName))
        {
            throw new InvalidOperationException("Invalid file extension");
        }

        if (!_documentCheckService.IsValidSize(file.Length))
        {
            throw new InvalidOperationException("File size is too large");
        }

        if (!_documentCheckService.IsValidTypeSignature(file.OpenReadStream(), Path.GetExtension(file.FileName)))
        {
            throw new InvalidOperationException("Invalid file type signature");
        }

        // create the target folder
        var targetFolder = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Desktop), folderName);
        Directory.CreateDirectory(targetFolder);

        // generate the file name
        var fileName = $"{DateTime.Now:yyyyMMdd_HHmmss}_{file.FileName}";
        var filePath = Path.Combine(targetFolder, fileName);

        // 保存文件
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        return filePath;
    }

    private async Task<bool> ValidateFileAsync(IFormFile file, string uploadId)
    {
        // validate the file extension
        if (!_documentCheckService.IsValidExtension(file.FileName))
        {
            await _progressService.FailUploadAsync(uploadId, "Invalid file extension");
            return false;
        }

        // validate the file size
        if (!_documentCheckService.IsValidSize(file.Length))
        {
            await _progressService.FailUploadAsync(uploadId, "File size is too large");
            return false;
        }

        // validate the file type signature
        if (!_documentCheckService.IsValidTypeSignature(file.OpenReadStream(), Path.GetExtension(file.FileName)))
        {
            await _progressService.FailUploadAsync(uploadId, "Invalid file type signature");
            return false;
        }

        return true;
    }

    private async Task UpdateProgressAsync(string uploadId, string fileName, long fileSize, long processedBytes, DateTime startTime, DateTime currentTime)
    {
        // calculate the elapsed time
        var elapsed = currentTime - startTime;
        var speedMBps = elapsed.TotalSeconds > 0 ? processedBytes / 1024.0 / 1024.0 / elapsed.TotalSeconds : 0;
        var estimatedTimeRemaining = speedMBps > 0 ? TimeSpan.FromSeconds((fileSize - processedBytes) / 1024.0 / 1024.0 / speedMBps) : TimeSpan.Zero;

        // create the progress
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

        // update the progress
        await _progressService.UpdateProgressAsync(uploadId, progress);
    }
}