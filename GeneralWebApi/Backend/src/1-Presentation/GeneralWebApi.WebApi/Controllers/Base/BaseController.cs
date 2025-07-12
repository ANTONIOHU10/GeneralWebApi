using GeneralWebApi.Contracts.Common;
using Microsoft.AspNetCore.Mvc;

namespace GeneralWebApi.WebApi.Controllers.Base;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Produces("application/json")]
public abstract class BaseController : ControllerBase, IBaseController
{
    public virtual ActionResult<ApiResponse<T>> Success<T>(T data, string message = "Operation successful")
    {
        var response = ApiResponse<T>.SuccessResult(data, message);
        return Ok(response);
    }

    public virtual ActionResult<ApiResponse<T>> BadRequest<T>(string error, string message = "Operation failed")
    {
        var response = ApiResponse<T>.ErrorResult(error, 400, message);
        return BadRequest(response);
    }

    public virtual ActionResult<ApiResponse<T>> NotFound<T>(string error = "Resource not found")
    {
        var response = ApiResponse<T>.NotFound(error);
        return NotFound(response);
    }

    public virtual ActionResult<ApiResponse<T>> Unauthorized<T>(string error = "Unauthorized access")
    {
        var response = ApiResponse<T>.Unauthorized(error);
        return Unauthorized(response);
    }
    public virtual ActionResult<ApiResponse<T>> Forbidden<T>(string error = "Access forbidden")
    {
        var response = ApiResponse<T>.Forbidden(error);
        return StatusCode(403, response);
    }

    public virtual ActionResult<ApiResponse<T>> InternalServerError<T>(string error = "Internal server error")
    {
        var response = ApiResponse<T>.InternalServerError(error);
        return StatusCode(500, response);
    }


}