using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Logging.Services;
using GeneralWebApi.WebApi.Controllers.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace GeneralWebApi.WebApi.Controllers.v1;


public class TestController : BaseController
{
    private readonly ILoggingService _log;

    public TestController(ILoggingService log)
    {
        _log = log;
    }
    [HttpGet]
    [EnableRateLimiting("Default")]
    //[Authorize(Policy = "AdminOnly")]
    public ActionResult<ApiResponse<object>> Get()
    {
        _log.LogInformation("Test endpoint v1 is working");
        //_log.LogWarning("Test endpoint is working");
        //_log.LogError("Test endpoint is working");
        //_log.LogCritical(new Exception("Test endpoint is working"), "Test endpoint is working");
        //_log.LogDebug(new Exception("Test endpoint is working"), "Test endpoint is working");

        var data = new { };
        return Success((object)data, "Test endpoint is working");
    }


}