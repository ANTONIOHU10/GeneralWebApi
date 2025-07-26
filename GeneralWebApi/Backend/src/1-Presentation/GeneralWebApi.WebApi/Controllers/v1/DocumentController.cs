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

    public DocumentController(ILoggingService log, IFileUploadService fileUploadService, IFileCommonService fileCommonService)
    {
        _log = log;
        _fileUploadService = fileUploadService;
        _fileCommonService = fileCommonService;
    }

    [HttpPost("bufferUpload")]
    [EnableRateLimiting("Default")]
    [DisableFormValueModelBinding]
    [AllowAnonymous]
    // for file with size less than 10MB
    public async Task<ActionResult<ApiResponse<object>>> UploadDocumentAsync()
    {
        try
        {
            // get the file from the request
            var file = Request.Form.Files.FirstOrDefault();

            if (file == null || file.Length == 0)
            {
                return BadRequest(DocumentResponse.UploadFailed("No file provided"));
            }

            // generate the upload id
            var uploadId = Guid.NewGuid().ToString();

            // upload file to database with progress tracking
            var fileDocument = await _fileUploadService.UploadFileWithProgressAsync(file, uploadId);

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
            _log.LogError("Error during buffer upload: {Message}", ex.Message);
            return BadRequest(DocumentResponse.UploadFailed(ex.Message));
        }
    }

    [HttpPost("streamUpload")]
    [DisableFormValueModelBinding]
    [AllowAnonymous]
    // for file with size greater than 10MB
    public async Task<IActionResult> StreamUploadToDesktop(CancellationToken cancellationToken)
    {
        try
        {
            // Upload file to database using stream upload
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

    [HttpGet("files/{id}")]
    [AllowAnonymous]
    // Get file by ID
    public async Task<ActionResult<ApiResponse<object>>> GetFileByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        try
        {
            var file = await _fileCommonService.GetFileByIdAsync(id, cancellationToken);
            return Ok(ApiResponse<object>.SuccessResult(file, "File retrieved successfully"));
        }
        catch (Exception ex)
        {
            _log.LogError("Error getting file by ID {Id}: {Message}", id, ex.Message);
            return BadRequest(ApiResponse<object>.ErrorResult(ex.Message));
        }
    }

    [HttpGet("files/download/{fileName}")]
    [AllowAnonymous]
    // Download file from database
    public async Task<IActionResult> DownloadFileAsync(string fileName, CancellationToken cancellationToken = default)
    {
        try
        {
            // Get file document with full content and metadata
            var fileDocument = await _fileCommonService.GetFileByFileNameAsync(fileName, cancellationToken);

            // Return file content directly as binary stream
            return new FileContentResult(fileDocument.Content, fileDocument.FileContentType)
            {
                FileDownloadName = fileDocument.FileName
            };
        }
        catch (Exception ex)
        {
            _log.LogError("Error downloading file {FileName}: {Message}", fileName, ex.Message);
            return BadRequest(ApiResponse<object>.ErrorResult(ex.Message));
        }
    }

    [HttpPut("files/{id}")]
    [AllowAnonymous]
    // Update file metadata
    public async Task<ActionResult<ApiResponse<object>>> UpdateFileMetadataAsync(int id, [FromBody] FileDocument updateModel, CancellationToken cancellationToken = default)
    {
        try
        {
            var existingFile = await _fileCommonService.GetFileByIdAsync(id, cancellationToken);

            // Update only allowed fields
            existingFile.FileName = updateModel.FileName;
            existingFile.FileContentType = updateModel.FileContentType;
            existingFile.UpdatedAt = DateTime.UtcNow;

            var updatedFile = await _fileCommonService.UpdateFileMetadataAsync(existingFile, cancellationToken);
            return Ok(ApiResponse<object>.SuccessResult(updatedFile, "File metadata updated successfully"));
        }
        catch (Exception ex)
        {
            _log.LogError("Error updating file metadata for ID {Id}: {Message}", id, ex.Message);
            return BadRequest(ApiResponse<object>.ErrorResult(ex.Message));
        }
    }

    [HttpDelete("files/{id}")]
    [AllowAnonymous]
    // Delete file by ID
    public async Task<ActionResult<ApiResponse<object>>> DeleteFileByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        try
        {
            var deletedFile = await _fileCommonService.DeleteFileByIdAsync(id, cancellationToken);
            return Ok(ApiResponse<object>.SuccessResult(deletedFile, "File deleted successfully"));
        }
        catch (Exception ex)
        {
            _log.LogError("Error deleting file with ID {Id}: {Message}", id, ex.Message);
            return BadRequest(ApiResponse<object>.ErrorResult(ex.Message));
        }
    }

    [HttpDelete("files/name/{fileName}")]
    [AllowAnonymous]
    // Delete file by file name
    public async Task<ActionResult<ApiResponse<object>>> DeleteFileByFileNameAsync(string fileName, CancellationToken cancellationToken = default)
    {
        try
        {
            var deletedFile = await _fileCommonService.DeleteFileByFileNameAsync(fileName, cancellationToken);
            return Ok(ApiResponse<object>.SuccessResult(deletedFile, "File deleted successfully"));
        }
        catch (Exception ex)
        {
            _log.LogError("Error deleting file {FileName}: {Message}", fileName, ex.Message);
            return BadRequest(ApiResponse<object>.ErrorResult(ex.Message));
        }
    }

    [HttpDelete("files/all")]
    [AllowAnonymous]
    // Delete all files
    public async Task<ActionResult<ApiResponse<object>>> DeleteAllFilesAsync(CancellationToken cancellationToken = default)
    {
        var deletedFiles = await _fileCommonService.DeleteAllFilesAsync(cancellationToken);
        return Ok(ApiResponse<object>.SuccessResult(deletedFiles, "All files deleted successfully"));
    }

    [HttpGet("files/count")]
    [AllowAnonymous]
    // Get total file count
    public async Task<ActionResult<ApiResponse<object>>> GetFileCountAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var count = await _fileCommonService.GetFileCountAsync(cancellationToken);
            return Ok(ApiResponse<object>.SuccessResult(new { count }, "File count retrieved successfully"));
        }
        catch (Exception ex)
        {
            _log.LogError("Error getting file count: {Message}", ex.Message);
            return BadRequest(ApiResponse<object>.ErrorResult(ex.Message));
        }
    }

    #endregion
}



