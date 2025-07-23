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

namespace GeneralWebApi.Controllers.v1;

[ApiVersion("1.0")]
public class DocumentController : BaseController
{
    private readonly ILoggingService _log;
    private readonly IFileUploadService _fileUploadService;

    public DocumentController(ILoggingService log, IFileUploadService fileUploadService)
    {
        _log = log;
        _fileUploadService = fileUploadService;
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

            // use the file upload service to upload the file
            var filePath = await _fileUploadService.UploadFileWithProgressAsync(file, uploadId);

            if (string.IsNullOrEmpty(filePath))
            {
                return BadRequest(DocumentResponse.UploadFailed("Upload failed"));
            }

            return Ok(DocumentResponse.UploadSuccess(filePath, file.FileName, file.Length));
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
            // 使用FileUploadService进行流式上传
            var savedFilePath = await _fileUploadService.StreamUploadAsync(HttpContext, cancellationToken);

            return Ok(DocumentResponse.UploadSuccess(savedFilePath, Path.GetFileName(savedFilePath), new FileInfo(savedFilePath).Length));
        }
        catch (Exception ex)
        {
            _log.LogError("Error during stream upload: {Message}", ex.Message);
            return BadRequest(DocumentResponse.UploadFailed(ex.Message));
        }
    }
}



