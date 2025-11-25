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

    /// <summary>
    /// 
    /// </summary>
    /// <typeparam name="TRequest"> this type dependes on the request type</typeparam>
    /// <param name="request"> decide the type of the request</param>
    /// <param name="action"></param>
    /// <returns></returns>
    protected async Task<ActionResult> ValidateAndExecuteAsync<TRequest>(
        TRequest request,
        Func<TRequest, Task<ActionResult>> action)
    {
        //this TRequest is the type of the request object passed from the input parameter of the method
        var validator = HttpContext.RequestServices.GetService<IValidator<TRequest>>();
        if (validator != null)
        {
            var validationResult = await validator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
                // Follow consistent error format: error = short title, message = detailed errors
                return BadRequest(ApiResponse<object>.ErrorResult(
                    "Validation failed",
                    400,
                    string.Join(", ", errors)
                ));
            }
        }

        return await action(request);
    }

}