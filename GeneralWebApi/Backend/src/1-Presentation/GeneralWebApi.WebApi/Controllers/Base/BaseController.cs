using System.ComponentModel.DataAnnotations;
using Azure.Core;
using FluentValidation;
using GeneralWebApi.Contracts.Common;
using Microsoft.AspNetCore.Mvc;

namespace GeneralWebApi.Controllers.Base;

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

    // validation 
    // the T type will be inferred from the action parameter
    // For example:
    // 1. request = LoginRequest -> use the LoginRequestValidator to validate the request
    // 2. because of the return type of the controller endpoint is LoginResponseData
    // 3. so the compiler infers that T = LoginResponseData
    // 4. so the return type will be ActionResult<ApiResponse<LoginResponseData>>
    protected async Task<ActionResult<ApiResponse<T>>> ValidateAndExecuteAsync<TRequest, T>(
        TRequest request,
        Func<TRequest, Task<ApiResponse<T>>> action)
    {
        var validator = HttpContext.RequestServices.GetService<IValidator<TRequest>>();
        if (validator != null)
        {
            var validationResult = await validator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                return BadRequest(ApiResponse<T>.ErrorResult(string.Join(", ", errors)));
            }
        }

        return await action(request);
    }

}