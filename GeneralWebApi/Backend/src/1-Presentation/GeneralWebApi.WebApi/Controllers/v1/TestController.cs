using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Logging.Services;
using GeneralWebApi.Logging.Templates;
using GeneralWebApi.Controllers.Base;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GeneralWebApi.Contracts.Responses;
using GeneralWebApi.Middleware;

namespace GeneralWebApi.Controllers.v1;

[ApiController]
[Route("api/v1/[controller]")]
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
        _log.LogDebug(LogTemplates.TestEndpointWorking, "v1");
        //_log.LogWarning("Test endpoint is working");
        //_log.LogError("Test endpoint is working");
        //_log.LogCritical(new Exception("Test endpoint is working"), "Test endpoint is working");
        //_log.LogDebug(new Exception("Test endpoint is working"), "Test endpoint is working");

        return Ok(DocumentResponse.TestSuccess());
    }

        [HttpGet("throw-validation")]
        [AllowAnonymous]
        [ApiExplorerSettings(IgnoreApi = true)]
        public IActionResult ThrowValidationException()
        {
            throw new ValidationException("One or more validation errors occurred");
        }

        [HttpGet("throw-business")]
        [AllowAnonymous]
        [ApiExplorerSettings(IgnoreApi = true)]
        public IActionResult ThrowBusinessException()
        {
            var details = new List<string>
            {
                "The operation violates a business rule"
            };

            throw new BusinessException("Business rule violation", "Business rule violation", details);
        }

        [HttpGet("throw-unhandled")]
        [AllowAnonymous]
        [ApiExplorerSettings(IgnoreApi = true)]
        public IActionResult ThrowUnhandledException()
        {
            throw new Exception("Unexpected failure for testing global exception handling");
        }

}