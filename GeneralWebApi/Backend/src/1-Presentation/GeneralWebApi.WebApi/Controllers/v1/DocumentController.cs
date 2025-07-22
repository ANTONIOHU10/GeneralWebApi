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

namespace GeneralWebApi.WebApi.Controllers.v1;

[ApiVersion("1.0")]
public class DocumentController : BaseController
{
    private readonly ILoggingService _log;
    private readonly IDocumentChecks _documentChecks;
    private readonly IMultipartRequestHelper _multipartRequestHelper;

    public DocumentController(ILoggingService log, IDocumentChecks documentChecks, IMultipartRequestHelper multipartRequestHelper)
    {
        _log = log;
        _documentChecks = documentChecks;
        _multipartRequestHelper = multipartRequestHelper;
    }

    [HttpPost("bufferUpload")]
    [EnableRateLimiting("Default")]
    //[Authorize(Policy = "UserOrAdmin")]
    [AllowAnonymous]

    // for file with size less than 10MB
    public async Task<ActionResult<ApiResponse<object>>> UploadDocumentAsync(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(DocumentResponse.UploadFailed("No file provided"));
        }

        // get the information of the file
        long fileSize = file.Length;
        string fileName = file.FileName;
        string contentType = file.ContentType;
        string fileExtension = Path.GetExtension(fileName);
        string fileSizeInMB = (fileSize / 1024 / 1024).ToString("F2");

        // checks
        bool isValidExtension = _documentChecks.IsValidExtension(fileName);
        if (!isValidExtension)
        {
            return BadRequest(DocumentResponse.UploadFailed("Invalid file extension"));
        }

        bool isValidSize = _documentChecks.IsValidSize(fileSize);
        if (!isValidSize)
        {
            return BadRequest(DocumentResponse.UploadFailed("File size is too large"));
        }

        bool isValidTypeSignature = _documentChecks.IsValidTypeSignature(file.OpenReadStream(), fileExtension);
        if (!isValidTypeSignature)
        {
            return BadRequest(DocumentResponse.UploadFailed("Invalid file type signature"));
        }

        // save the file on the desktop
        string desktopPath = Environment.GetFolderPath(Environment.SpecialFolder.Desktop);
        string filePath = Path.Combine(desktopPath, fileName + "_" + DateTime.Now.ToString("yyyyMMddHHmmss") + fileExtension);
        using (var stream = System.IO.File.Create(filePath))
        {
            await file.CopyToAsync(stream);
        }

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



