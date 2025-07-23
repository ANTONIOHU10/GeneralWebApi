using System.Threading;
using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Logging.Services;
using GeneralWebApi.WebApi.Controllers.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Net.Http.Headers;
using GeneralWebApi.Common.Attributes;
using GeneralWebApi.Common.Helpers;
using GeneralWebApi.Contracts.Responses;
using System.Reflection.PortableExecutable;
using GeneralWebApi.RealTime;

namespace GeneralWebApi.WebApi.Controllers.v1;

[ApiVersion("1.0")]
public class DocumentController : BaseController
{
    private readonly ILoggingService _log;
    private readonly IDocumentChecks _documentChecks;
    private readonly IMultipartRequestHelper _multipartRequestHelper;
    private readonly IProgressService _progressService;

    public DocumentController(ILoggingService log, IDocumentChecks documentChecks, IMultipartRequestHelper multipartRequestHelper, IProgressService progressService)
    {
        _log = log;
        _documentChecks = documentChecks;
        _multipartRequestHelper = multipartRequestHelper;
        _progressService = progressService;
    }

    [HttpPost("bufferUpload")]
    [EnableRateLimiting("Default")]
    [DisableFormValueModelBinding]
    [AllowAnonymous]
    // for file with size less than 10MB
    //public async Task<ActionResult<ApiResponse<object>>> UploadDocumentAsync(IFormFile file)
    public async Task<ActionResult<ApiResponse<object>>> UploadDocumentAsync()
    {
        // get the file from the request
        var file = Request.Form.Files.FirstOrDefault();

        if (file == null || file.Length == 0)
        {
            return BadRequest(DocumentResponse.UploadFailed("No file provided"));
        }

        // generate the upload id
        var uploadId = Guid.NewGuid().ToString();

        // get the information of the file
        long fileSize = file.Length;
        string fileName = file.FileName;
        string contentType = file.ContentType;
        string fileExtension = Path.GetExtension(fileName);
        string fileSizeInMB = (fileSize / 1024 / 1024).ToString("F2");

        // record the upload start
        await _progressService.StartUploadAsync(uploadId, fileName, fileSize);

        // checks
        bool isValidExtension = _documentChecks.IsValidExtension(fileName);
        if (!isValidExtension)
        {
            await _progressService.FailUploadAsync(uploadId, "Invalid file extension");
            return BadRequest(DocumentResponse.UploadFailed("Invalid file extension"));
        }

        bool isValidSize = _documentChecks.IsValidSize(fileSize);
        if (!isValidSize)
        {
            await _progressService.FailUploadAsync(uploadId, "File size is too large");
            return BadRequest(DocumentResponse.UploadFailed("File size is too large"));
        }

        bool isValidTypeSignature = _documentChecks.IsValidTypeSignature(file.OpenReadStream(), fileExtension);
        if (!isValidTypeSignature)
        {
            await _progressService.FailUploadAsync(uploadId, "Invalid file type signature");
            return BadRequest(DocumentResponse.UploadFailed("Invalid file type signature"));
        }

        // save the file to the desktop with progress tracking
        string desktopPath = Environment.GetFolderPath(Environment.SpecialFolder.Desktop);
        string filePath = Path.Combine(desktopPath, fileName + "_" + DateTime.Now.ToString("yyyyMMddHHmmss") + fileExtension);

        var startTime = DateTime.UtcNow;
        var lastProgressUpdate = startTime;
        long processedBytes = 0;
        const int bufferSize = 8192; // 8KB buffer
        var buffer = new byte[bufferSize];

        using (var sourceStream = file.OpenReadStream())
        using (var targetStream = System.IO.File.Create(filePath))
        {
            int bytesRead;
            while ((bytesRead = await sourceStream.ReadAsync(buffer, 0, buffer.Length)) > 0)
            {
                await targetStream.WriteAsync(buffer, 0, bytesRead);
                processedBytes += bytesRead;

                // every 100ms update the progress
                var now = DateTime.UtcNow;
                if ((now - lastProgressUpdate).TotalMilliseconds >= 100)
                {
                    var elapsed = now - startTime;
                    var speedMBps = elapsed.TotalSeconds > 0 ? (processedBytes / 1024.0 / 1024.0) / elapsed.TotalSeconds : 0;
                    var estimatedTimeRemaining = speedMBps > 0 ? TimeSpan.FromSeconds((fileSize - processedBytes) / 1024.0 / 1024.0 / speedMBps) : TimeSpan.Zero;

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

                    await _progressService.UpdateProgressAsync(uploadId, progress);
                    lastProgressUpdate = now;
                }
            }
        }

        // 🔧 show the 100% progress
        var finalElapsed = DateTime.UtcNow - startTime;
        var finalSpeedMBps = finalElapsed.TotalSeconds > 0 ? (fileSize / 1024.0 / 1024.0) / finalElapsed.TotalSeconds : 0;

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

        await _progressService.UpdateProgressAsync(uploadId, finalProgress);

        // record the upload completed
        await _progressService.CompleteUploadAsync(uploadId, filePath);

        return Ok(DocumentResponse.UploadSuccess(filePath, file.FileName, file.Length));
    }


    [HttpPost("streamUpload")]
    [DisableFormValueModelBinding]
    [AllowAnonymous]
    // for file with size greater than 10MB
    public async Task<IActionResult> StreamUploadToDesktop(CancellationToken cancellationToken)
    {
        // check if the request is a multipart/form-data request
        if (Request.ContentType == null)
        {
            return BadRequest(DocumentResponse.UploadFailed("Content-Type is null"));
        }

        if (!_multipartRequestHelper.IsMultipartContentType(Request.ContentType))
        {
            return BadRequest(DocumentResponse.UploadFailed("Not a multipart/form-data request"));
        }

        var boundary = _multipartRequestHelper.GetBoundary(
          // limit the size of the boundary
          MediaTypeHeaderValue.Parse(Request.ContentType), 4096
      );

        // create a reader for the multipart/form-data request
        var reader = new MultipartReader(boundary, HttpContext.Request.Body);

        // read the first section
        var section = await reader.ReadNextSectionAsync(cancellationToken);

        string? savedFilePath = null;
        string desktopPath = Environment.GetFolderPath(Environment.SpecialFolder.Desktop);

        // read the next section
        while (section != null)
        {
            // content-disposition = form-data; name="file"; filename="test.txt"
            // for example, you can get "cat.jpg" from contentDisposition.FileName.Value
            var hasContentDisposition = ContentDispositionHeaderValue.TryParse(section.ContentDisposition, out var contentDisposition);

            // if it's a file, save it to the desktop
            if (hasContentDisposition && contentDisposition != null && _multipartRequestHelper.HasFileContentDisposition(contentDisposition))
            {
                var originalFileName = Path.GetFileName(contentDisposition.FileName.Value);
                var fileExtension = Path.GetExtension(originalFileName);

                // checks
                if (string.IsNullOrEmpty(originalFileName))
                {
                    return BadRequest(DocumentResponse.UploadFailed("Invalid file name"));
                }

                bool isValidExtension = _documentChecks.IsValidExtension(originalFileName);
                if (!isValidExtension)
                {
                    return BadRequest(DocumentResponse.UploadFailed("Invalid file extension"));
                }

                bool isValidSize = _documentChecks.IsValidSize(section.Body.Length);
                if (!isValidSize)
                {
                    return BadRequest(DocumentResponse.UploadFailed("File size is too large"));
                }

                if (string.IsNullOrEmpty(fileExtension))
                {
                    return BadRequest(DocumentResponse.UploadFailed("Invalid file extension"));
                }

                // to avoid reading the whole file, read the header of the file in a limited size buffer
                // the read mechanism will remain as stream
                // keep it high performance
                var headerBuffer = new byte[1024];
                var bytesRead = await section.Body.ReadAsync(headerBuffer, cancellationToken);
                bool isValidTypeSignature = _documentChecks.IsValidTypeSignature(new MemoryStream(headerBuffer, 0, bytesRead), fileExtension);
                if (!isValidTypeSignature)
                {
                    return BadRequest(DocumentResponse.UploadFailed("Invalid file type signature"));
                }

                var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
                var safeFileName = $"{timestamp}_{originalFileName}";
                savedFilePath = Path.Combine(desktopPath, safeFileName);

                // save the file to the desktop
                await using var targetStream = System.IO.File.Create(savedFilePath);

                // write the header of the file to the target stream
                await targetStream.WriteAsync(headerBuffer, 0, bytesRead, cancellationToken);
                // write the rest of the file to the target stream
                await section.Body.CopyToAsync(targetStream, cancellationToken);

                // only process the first file
                break;
            }

            section = await reader.ReadNextSectionAsync(cancellationToken);
        }

        if (string.IsNullOrEmpty(savedFilePath))
            return BadRequest(DocumentResponse.UploadFailed("No file was uploaded"));

        return Ok(DocumentResponse.UploadSuccess(savedFilePath, Path.GetFileName(savedFilePath), new FileInfo(savedFilePath).Length));
    }

}



