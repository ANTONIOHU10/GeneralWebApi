using System.Threading;
using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Logging.Services;
using GeneralWebApi.Controllers.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using GeneralWebApi.Common.Attributes;
using GeneralWebApi.Contracts.Responses;
using GeneralWebApi.FileOperation.Services;
using GeneralWebApi.Domain.Entities;

namespace GeneralWebApi.Controllers.v1;

[ApiVersion("1.0")]
public class DocumentController : BaseController
{
    private readonly ILoggingService _log;
    private readonly IFileUploadService _fileUploadService;
    private readonly IFileCommonService _fileCommonService;

    public DocumentController(
        ILoggingService log,
        IFileUploadService fileUploadService,
        IFileCommonService fileCommonService)
    {
        _log = log;
        _fileUploadService = fileUploadService;
        _fileCommonService = fileCommonService;
    }

    [HttpPost("upload")]
    [EnableRateLimiting("Default")]
    [DisableFormValueModelBinding]
    [AllowAnonymous]
    // Upload file to local file system using multipart/form-data
    public async Task<ActionResult<ApiResponse<object>>> UploadDocumentAsync()
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
            _log.LogError("Error during file upload: {Message}", ex.Message);
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
            _log.LogError("Error during stream upload: {Message}", ex.Message);
            return BadRequest(DocumentResponse.UploadFailed(ex.Message));
        }
    }

    #region File Management Operations

    [HttpGet("files")]
    [AllowAnonymous]
    // Get all files
    public async Task<ActionResult<ApiResponse<object>>> GetAllFilesAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var files = await _fileCommonService.GetAllFilesAsync(cancellationToken);
            var totalCount = await _fileCommonService.GetFileCountAsync(cancellationToken);

            return Ok(ApiResponse<object>.SuccessResult(new
            {
                files,
                totalCount,
            }, "Files retrieved successfully"));
        }
        catch (Exception ex)
        {
            _log.LogError("Error getting files: {Message}", ex.Message);
            return BadRequest(ApiResponse<object>.ErrorResult(ex.Message));
        }
    }

    [HttpPost("files/{id}/content")]
    [EnableRateLimiting("Default")]
    [DisableFormValueModelBinding]
    [AllowAnonymous]
    // Update file content (multipart/form-data)
    public async Task<ActionResult<ApiResponse<object>>> UpdateFileContentAsync(int id, CancellationToken cancellationToken = default)
    {
        try
        {
            if (id <= 0)
            {
                return BadRequest(ApiResponse<object>.ErrorResult("Invalid file ID"));
            }

            // Get the file from multipart/form-data request
            var file = Request.Form.Files.FirstOrDefault();

            if (file == null || file.Length == 0)
            {
                return BadRequest(ApiResponse<object>.ErrorResult("No file provided"));
            }

            // Check if file exists
            var existingFile = await _fileCommonService.GetFileByIdAsync(id, cancellationToken);

            // Update file content
            var updatedFile = await _fileUploadService.UpdateFileContentAsync(id, file, cancellationToken);

            if (updatedFile == null)
            {
                return BadRequest(ApiResponse<object>.ErrorResult("File content update failed"));
            }

            return Ok(ApiResponse<object>.SuccessResult(updatedFile, "File content updated successfully"));
        }
        catch (FileNotFoundException ex)
        {
            _log.LogWarning("File not found with ID {Id}: {Message}", id, ex.Message);
            return NotFound(ApiResponse<object>.NotFound($"File with ID {id} not found"));
        }
        catch (Exception ex)
        {
            _log.LogError("Error updating file content for ID {Id}: {Message}", id, ex.Message);
            return BadRequest(ApiResponse<object>.ErrorResult(ex.Message));
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
            _log.LogWarning("File not found with ID {Id}: {Message}", id, ex.Message);
            return NotFound(ApiResponse<object>.NotFound($"File with ID {id} not found"));
        }
        catch (Exception ex)
        {
            _log.LogError("Error downloading file with ID {Id}: {Message}", id, ex.Message);
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
    public async Task<ActionResult<ApiResponse<object>>> DeleteFileByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        try
        {
            if (id <= 0)
            {
                return BadRequest(ApiResponse<object>.ErrorResult("Invalid file ID"));
            }

            var deletedFile = await _fileCommonService.DeleteFileByIdAsync(id, cancellationToken);
            return Ok(ApiResponse<object>.SuccessResult(deletedFile, "File deleted successfully"));
        }
        catch (FileNotFoundException ex)
        {
            _log.LogWarning("File not found with ID {Id}: {Message}", id, ex.Message);
            return NotFound(ApiResponse<object>.NotFound($"File with ID {id} not found"));
        }
        catch (Exception ex)
        {
            _log.LogError("Error deleting file with ID {Id}: {Message}", id, ex.Message);
            return BadRequest(ApiResponse<object>.ErrorResult(ex.Message));
        }
    }

    #endregion
}



