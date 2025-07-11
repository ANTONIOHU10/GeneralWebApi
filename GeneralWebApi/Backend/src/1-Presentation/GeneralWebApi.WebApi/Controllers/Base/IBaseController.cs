

using GeneralWebApi.Contracts.Common;
using Microsoft.AspNetCore.Mvc;

namespace GeneralWebApi.WebApi.Controllers.Base;

public interface IBaseController
{
    ActionResult<ApiResponse<T>> Success<T>(T data, string message = "Operation successful");
    ActionResult<ApiResponse<T>> BadRequest<T>(string error, string message = "Operation failed");
    ActionResult<ApiResponse<T>> NotFound<T>(string error = "Resource not found");
    ActionResult<ApiResponse<T>> Unauthorized<T>(string error = "Unauthorized access");
    ActionResult<ApiResponse<T>> Forbidden<T>(string error = "Access forbidden");
    ActionResult<ApiResponse<T>> InternalServerError<T>(string error = "Internal server error");
    
}