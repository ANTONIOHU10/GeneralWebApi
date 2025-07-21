using System.Threading;
using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Logging.Services;
using GeneralWebApi.WebApi.Controllers.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Net.Http.Headers;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.ModelBinding;

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

    [HttpPost("streamUploadToDesktop")]
    [DisableFormValueModelBinding]
    [AllowAnonymous]
    public async Task<IActionResult> StreamUploadToDesktop(CancellationToken cancellationToken)
    {
        if (!MultipartRequestHelper.IsMultipartContentType(Request.ContentType))
            return BadRequest("不是 multipart/form-data 请求");

        var boundary = MultipartRequestHelper.GetBoundary(
            MediaTypeHeaderValue.Parse(Request.ContentType), 4096);

        var reader = new MultipartReader(boundary, HttpContext.Request.Body);
        var section = await reader.ReadNextSectionAsync();

        string savedFilePath = null;
        string desktopPath = Environment.GetFolderPath(Environment.SpecialFolder.Desktop);

        while (section != null)
        {
            var hasContentDisposition =
                ContentDispositionHeaderValue.TryParse(section.ContentDisposition, out var contentDisposition);

            if (hasContentDisposition && MultipartRequestHelper.HasFileContentDisposition(contentDisposition))
            {
                var originalFileName = Path.GetFileName(contentDisposition.FileName.Value);
                var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
                var safeFileName = $"{timestamp}_{originalFileName}";
                savedFilePath = Path.Combine(desktopPath, safeFileName);

                // 直接把上传内容保存为文件
                await using var targetStream = System.IO.File.Create(savedFilePath);
                await section.Body.CopyToAsync(targetStream, cancellationToken);

                break; // 只处理第一个文件
            }

            section = await reader.ReadNextSectionAsync();
        }

        if (string.IsNullOrEmpty(savedFilePath))
            return BadRequest("没有文件被上传");

        return Ok($"文件保存成功: {savedFilePath}");
    }

}
public static class MultipartRequestHelper
{
    public static string GetBoundary(MediaTypeHeaderValue contentType, int lengthLimit)
    {
        var boundary = HeaderUtilities.RemoveQuotes(contentType.Boundary).Value;
        if (string.IsNullOrWhiteSpace(boundary) || boundary.Length > lengthLimit)
            throw new InvalidDataException("Invalid boundary.");
        return boundary;
    }

    public static bool IsMultipartContentType(string contentType)
    {
        return !string.IsNullOrEmpty(contentType) &&
               contentType.IndexOf("multipart/", StringComparison.OrdinalIgnoreCase) >= 0;
    }

    public static bool HasFileContentDisposition(ContentDispositionHeaderValue contentDisposition)
    {
        return contentDisposition != null &&
               contentDisposition.DispositionType.Equals("form-data") &&
               !string.IsNullOrEmpty(contentDisposition.FileName.Value);
    }
}


[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class DisableFormValueModelBindingAttribute : Attribute, IResourceFilter
{
    public void OnResourceExecuting(ResourceExecutingContext context)
    {
        var factories = context.ValueProviderFactories;
        factories.RemoveType<FormValueProviderFactory>();
        factories.RemoveType<FormFileValueProviderFactory>();
        factories.RemoveType<JQueryFormValueProviderFactory>();
    }

    public void OnResourceExecuted(ResourceExecutedContext context)
    {
    }
}