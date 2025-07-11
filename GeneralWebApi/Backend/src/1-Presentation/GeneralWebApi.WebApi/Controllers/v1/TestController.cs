using GeneralWebApi.Contracts.Common;
using GeneralWebApi.WebApi.Controllers.Base;
using Microsoft.AspNetCore.Mvc;

namespace GeneralWebApi.WebApi.Controllers.v1;


public class TestController : BaseController
{
    [HttpGet]
    public ActionResult<ApiResponse<object>> Get()
    {
        var data = new { message = "Hello, World!" };
        return Success((object)data, "Test endpoint is working");
    }
}