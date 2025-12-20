using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Contracts.Constants;
using Microsoft.AspNetCore.Mvc;

namespace GeneralWebApi.Controllers.Base;

public interface IBaseController
{
    ActionResult<ApiResponse<T>> Success<T>(T data, string message = ErrorMessages.Common.OperationSuccessful);
    ActionResult<ApiResponse<T>> BadRequest<T>(string error, string? message = null);
    ActionResult<ApiResponse<T>> NotFound<T>(string error = ErrorMessages.Common.ResourceNotFound);
    ActionResult<ApiResponse<T>> Unauthorized<T>(string error = ErrorMessages.Common.UnauthorizedAccess);
    ActionResult<ApiResponse<T>> Forbidden<T>(string error = ErrorMessages.Common.AccessForbidden);
    ActionResult<ApiResponse<T>> InternalServerError<T>(string error = ErrorMessages.Common.InternalServerError);

}