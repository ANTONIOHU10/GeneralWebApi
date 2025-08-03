using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Logging.Services;
using GeneralWebApi.Logging.Templates;
using GeneralWebApi.Controllers.Base;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GeneralWebApi.Contracts.Responses;

namespace GeneralWebApi.Controllers.v1;

[ApiVersion("1.0")]
public class TestController : BaseController
{
    private readonly ILoggingService _log;

    public TestController(ILoggingService log)
    {
        _log = log;
    }

    [HttpGet("test")]
    [AllowAnonymous]
    public ActionResult<ApiResponse<TestResponse>> Test()
    {
        _log.LogInformation(LogTemplates.TestEndpointWorking, "v1");
        //_log.LogWarning("Test endpoint is working");
        //_log.LogError("Test endpoint is working");
        //_log.LogCritical(new Exception("Test endpoint is working"), "Test endpoint is working");
        //_log.LogDebug(new Exception("Test endpoint is working"), "Test endpoint is working");

        return Ok(DocumentResponse.TestSuccess());
    }
}