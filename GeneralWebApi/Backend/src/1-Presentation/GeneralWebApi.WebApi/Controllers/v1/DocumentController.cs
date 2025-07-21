using System.Threading;
using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Logging.Services;
using GeneralWebApi.WebApi.Controllers.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Net.Http.Headers;

namespace GeneralWebApi.WebApi.Controllers.v1;

[ApiVersion("1.0")]
public class DocumentController : BaseController
{
    private readonly ILoggingService _log;

    public DocumentController(ILoggingService log)
    {
        _log = log;
    }

    [HttpPost("bufferUpload")]
    [EnableRateLimiting("Default")]
    //[Authorize(Policy = "UserOrAdmin")]
    [AllowAnonymous]

    // for file with size less than 10MB
    public async Task<ActionResult<ApiResponse<object>>> UploadDocumentAsync(IFormFile file)
    {


        long fileSize = file.Length;
        string fileName = file.FileName;
        string contentType = file.ContentType;
        string fileExtension = Path.GetExtension(fileName);
        string fileSizeInMB = (fileSize / 1024 / 1024).ToString("F2");

        _log.LogInformation("Uploading document");
        _log.LogInformation("File size: {FileSize} MB", fileSizeInMB);
        _log.LogInformation("File name: {FileName}", fileName);
        _log.LogInformation("File extension: {FileExtension}", fileExtension);
        _log.LogInformation("Content type: {ContentType}", contentType);

        // save the file on the desktop
        string desktopPath = Environment.GetFolderPath(Environment.SpecialFolder.Desktop);
        string filePath = Path.Combine(desktopPath, fileName + "_" + DateTime.Now.ToString("yyyyMMddHHmmss") + fileExtension);
        using (var stream = System.IO.File.Create(filePath))
        {
            await file.CopyToAsync(stream);
        }

        return Success((object)file, "File uploaded successfully: " + filePath + " with size: " + fileSizeInMB + " MB");
    }

    [HttpPost("streamUpload")]
    [EnableRateLimiting("Default")]
    [AllowAnonymous]

    // for file with size greater than 10MB
    public async Task<ActionResult<ApiResponse<object>>> StreamUploadAsync(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("No file provided");
        }



        // save the file on the desktop
        string desktopPath = Environment.GetFolderPath(Environment.SpecialFolder.Desktop);
        string filePath = Path.Combine(desktopPath, file.FileName + "_" + DateTime.Now.ToString("yyyyMMddHHmmss") + Path.GetExtension(file.FileName));

        // use stream processing
        using (var inputStream = file.OpenReadStream())
        using (var outputStream = System.IO.File.Create(filePath))
        {
            await inputStream.CopyToAsync(outputStream, CancellationToken.None);
        }
        return Success((object)file, "File uploaded successfully");
    }
}