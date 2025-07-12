using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Logging.Services;
using GeneralWebApi.WebApi.Controllers.Base;
using Microsoft.AspNetCore.Mvc;

namespace GeneralWebApi.WebApi.Controllers.v1;


public class TestController : BaseController
{
    private readonly ILoggingService _log;

    public TestController(ILoggingService log)
    {
        _log = log;
    }
    [HttpGet]
    public ActionResult<ApiResponse<object>> Get()
    {
        _log.LogInformation("Test endpoint is working");
        //_log.LogWarning("Test endpoint is working");
        //_log.LogError("Test endpoint is working");
        _log.LogCritical(new Exception("Test endpoint is working"), "Test endpoint is working");
        //_log.LogDebug(new Exception("Test endpoint is working"), "Test endpoint is working");

        var data = new {};
        return Success((object)data, "Test endpoint is working");
    }
}