using System.Threading;
using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Logging.Services;
using GeneralWebApi.Logging.Templates;
using GeneralWebApi.Controllers.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using GeneralWebApi.Common.Attributes;
using GeneralWebApi.Contracts.Responses;
using GeneralWebApi.FileOperation.Services;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Application.Services;

namespace GeneralWebApi.Controllers.v1;

[ApiController]
[Route("api/v1/[controller]")]
[ApiVersion("1.0")]
[Authorize] // Require authentication for document operations
public class DocumentController : BaseController
{
    private readonly ILoggingService _log;
    private readonly IFileUploadService _fileUploadService;
    private readonly IFileCommonService _fileCommonService;

    private readonly ICSVExportService _csvExportService;

    public DocumentController(
        ILoggingService log,
        IFileUploadService fileUploadService,
        IFileCommonService fileCommonService,
        ICSVExportService csvExportService)
    {
        _log = log;
        _fileUploadService = fileUploadService;
        _fileCommonService = fileCommonService;
        _csvExportService = csvExportService;
    }

    [HttpPost("upload")]
    [EnableRateLimiting("Default")]
    [DisableFormValueModelBinding]
    [AllowAnonymous]
    // Upload file to local file system using multipart/form-data
    public async Task<ActionResult<ApiResponse<FileUploadResponse>>> UploadDocumentAsync()
    {
        try
        {
            // Get the file from multipart/form-data request
            var file = Request.Form.Files.FirstOrDefault();

            if (file == null || file.Length == 0)
            {
                return BadRequest(DocumentResponse.UploadFailed("No file provided"));
            }

            // Upload file to local file system and save metadata to database
            var fileDocument = await _fileUploadService.UploadFileAsync(file);

            if (fileDocument == null)
            {
                return BadRequest(DocumentResponse.UploadFailed("Upload failed"));
            }

            return Ok(DocumentResponse.UploadSuccess(
                fileDocument.FileName,
                fileDocument.FileSize,
                fileDocument.FileContentType,
                fileDocument.Id));
        }
        catch (Exception ex)
        {
            _log.LogError(LogTemplates.DocumentController.FileUploadError, ex.Message);
            return BadRequest(DocumentResponse.UploadFailed(ex.Message));
        }
    }



    [HttpPost("streamUpload")]
    [DisableFormValueModelBinding]
    [AllowAnonymous]
    // Stream upload for large files using multipart/form-data
    public async Task<IActionResult> StreamUploadAsync(CancellationToken cancellationToken)
    {
        try
        {
            var fileDocument = await _fileUploadService.StreamUploadAsync(HttpContext, cancellationToken);

            return Ok(DocumentResponse.UploadSuccess(
                fileDocument.FileName,
                fileDocument.FileSize,
                fileDocument.FileContentType,
                fileDocument.Id));
        }
        catch (Exception ex)
        {
            _log.LogError(LogTemplates.DocumentController.StreamUploadError, ex.Message);
            return BadRequest(DocumentResponse.UploadFailed(ex.Message));
        }
    }

    #region File Management Operations

    [HttpGet("files")]
    [AllowAnonymous]
    // Get all files
    public async Task<ActionResult<ApiResponse<FileListResponse>>> GetAllFilesAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var files = await _fileCommonService.GetAllFilesAsync(cancellationToken);
            var totalCount = await _fileCommonService.GetFileCountAsync(cancellationToken);

            return Ok(DocumentResponse.FileListSuccess(files, totalCount));
        }
        catch (Exception ex)
        {
            _log.LogError(LogTemplates.DocumentController.GetFilesError, ex.Message);
            return BadRequest(ApiResponse<object>.ErrorResult(ex.Message));
        }
    }

    [HttpPost("files/{id}/content")]
    [EnableRateLimiting("Default")]
    [DisableFormValueModelBinding]
    [AllowAnonymous]
    // Update file content (multipart/form-data)
    public async Task<ActionResult<ApiResponse<FileDocument>>> UpdateFileContentAsync(int id, CancellationToken cancellationToken = default)
    {
        try
        {
            if (id <= 0)
            {
                return BadRequest(ApiResponse<FileDocument>.ErrorResult("Invalid file ID"));
            }

            // Get the file from multipart/form-data request
            var file = Request.Form.Files.FirstOrDefault();

            if (file == null || file.Length == 0)
            {
                return BadRequest(ApiResponse<FileDocument>.ErrorResult("No file provided"));
            }

            // Check if file exists
            var existingFile = await _fileCommonService.GetFileByIdAsync(id, cancellationToken);

            // Update file content
            var updatedFile = await _fileUploadService.UpdateFileContentAsync(id, file, cancellationToken);

            if (updatedFile == null)
            {
                return BadRequest(ApiResponse<FileDocument>.ErrorResult("File content update failed"));
            }

            return Ok(DocumentResponse.FileUpdateSuccess(updatedFile));
        }
        catch (FileNotFoundException ex)
        {
            _log.LogWarning(LogTemplates.DocumentController.FileNotFound, id, ex.Message);
            return NotFound(ApiResponse<FileDocument>.NotFound($"File with ID {id} not found"));
        }
        catch (Exception ex)
        {
            _log.LogError(LogTemplates.DocumentController.UpdateFileContentError, id, ex.Message);
            return BadRequest(ApiResponse<FileDocument>.ErrorResult(ex.Message));
        }
    }


    [HttpGet("files/download/{id}")]
    [AllowAnonymous]
    // Download file by ID
    public async Task<IActionResult> DownloadFileByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        try
        {
            if (id <= 0)
            {
                return BadRequest(ApiResponse<object>.ErrorResult("Invalid file ID"));
            }

            var fileDocument = await _fileCommonService.GetFileByIdAsync(id, cancellationToken);

            // Check if file exists in local storage
            if (!await _fileCommonService.FileExistsAsync(id, cancellationToken))
            {
                return NotFound(ApiResponse<object>.NotFound($"File with ID {id} not found in storage"));
            }

            var fileStream = await _fileCommonService.GetFileStreamAsync(id, cancellationToken);

            // Create a safe filename for download (handle Chinese characters)
            var safeFileName = GetSafeFileName(fileDocument.OriginalFileName);

            // Use FileStreamResult for better control
            var result = new FileStreamResult(fileStream, fileDocument.FileContentType)
            {
                FileDownloadName = safeFileName
            };

            return result;
        }
        catch (FileNotFoundException ex)
        {
            _log.LogWarning(LogTemplates.DocumentController.FileNotFound, id, ex.Message);
            return NotFound(ApiResponse<object>.NotFound($"File with ID {id} not found"));
        }
        catch (Exception ex)
        {
            _log.LogError(LogTemplates.DocumentController.DownloadFileError, id, ex.Message);
            return BadRequest(ApiResponse<object>.ErrorResult(ex.Message));
        }
    }

    private string GetSafeFileName(string originalFileName)
    {
        try
        {
            // Remove or replace problematic characters
            var safeName = originalFileName
                .Replace("\\", "_")
                .Replace("/", "_")
                .Replace(":", "_")
                .Replace("*", "_")
                .Replace("?", "_")
                .Replace("\"", "_")
                .Replace("<", "_")
                .Replace(">", "_")
                .Replace("|", "_");

            // If the filename contains Chinese characters, use a simplified approach
            if (safeName.Any(c => c > 127))
            {
                var extension = Path.GetExtension(safeName);
                var nameWithoutExt = Path.GetFileNameWithoutExtension(safeName);

                // Keep only ASCII characters and replace others with underscore
                var asciiName = new string(nameWithoutExt.Select(c => c <= 127 ? c : '_').ToArray());

                return asciiName + extension;
            }

            return safeName;
        }
        catch
        {
            // Fallback to a simple name if anything goes wrong
            return $"file_{DateTime.UtcNow:yyyyMMddHHmmss}.pdf";
        }
    }




    [HttpDelete("files/{id}")]
    [AllowAnonymous]
    // Delete file by ID (both database record and local file)
    public async Task<ActionResult<ApiResponse<FileDeleteResponse>>> DeleteFileByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        try
        {
            if (id <= 0)
            {
                return BadRequest(ApiResponse<FileDeleteResponse>.ErrorResult("Invalid file ID"));
            }

            var deletedFile = await _fileCommonService.DeleteFileByIdAsync(id, cancellationToken);
            return Ok(DocumentResponse.FileDeleteSuccess());
        }
        catch (FileNotFoundException ex)
        {
            _log.LogWarning(LogTemplates.DocumentController.FileNotFound, id, ex.Message);
            return NotFound(ApiResponse<FileDeleteResponse>.NotFound($"File with ID {id} not found"));
        }
        catch (Exception ex)
        {
            _log.LogError(LogTemplates.DocumentController.DeleteFileError, id, ex.Message);
            return BadRequest(ApiResponse<FileDeleteResponse>.ErrorResult(ex.Message));
        }
    }

    [HttpGet("export/csv/{entityType}")]
    [AllowAnonymous]
    [EnableRateLimiting("Default")]
    public async Task<IActionResult> ExportCSVAsync(string entityType, CancellationToken cancellationToken = default)
    {
        try
        {
            byte[] csvData;
            string fileName;

            // format the type to lowercase
            switch (entityType.ToLower())
            {
                case "products":
                    csvData = await _csvExportService.ExportProductsToCSVAsync(cancellationToken);
                    fileName = $"products_{DateTime.UtcNow:yyyyMMddHHmmss}.csv";
                    break;
                case "users":
                    csvData = await _csvExportService.ExportUsersToCSVAsync(cancellationToken);
                    fileName = $"users_{DateTime.UtcNow:yyyyMMddHHmmss}.csv";
                    break;
                case "filedocuments":
                    csvData = await _csvExportService.ExportFileDocumentsToCSVAsync(cancellationToken);
                    fileName = $"fileDocuments_{DateTime.UtcNow:yyyyMMddHHmmss}.csv";
                    break;
                default:
                    return BadRequest(ApiResponse<object>.ErrorResult($"Invalid entity type '{entityType}'. Supported types: products, users, fileDocuments"));
            }

            return File(csvData, "text/csv", fileName);
        }
        catch (Exception ex)
        {
            _log.LogError(LogTemplates.DocumentController.ExportCSVError, ex.Message);
            return BadRequest(ApiResponse<object>.ErrorResult(ex.Message));
        }
    }

    #endregion
}



