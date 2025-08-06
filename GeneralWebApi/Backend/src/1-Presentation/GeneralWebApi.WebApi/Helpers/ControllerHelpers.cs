using GeneralWebApi.Application.Common.Models;
using GeneralWebApi.Contracts.Responses;
using Microsoft.AspNetCore.Mvc;

namespace GeneralWebApi.WebApi.Helpers;

/// <summary>
/// Helper methods for controllers to handle service results
/// </summary>
public static class ControllerHelpers
{
    /// <summary>
    /// Convert ServiceResult to IActionResult
    /// </summary>
    public static IActionResult ToActionResult<T>(this ServiceResult<T> result)
    {
        if (result.IsSuccess)
        {
            return new OkObjectResult(new
            {
                success = true,
                data = result.Data
            });
        }

        var statusCode = GetStatusCodeFromErrorCode(result.ErrorCode);
        return new ObjectResult(new
        {
            success = false,
            error = result.ErrorMessage,
            errorCode = result.ErrorCode,
            errors = result.Errors
        })
        {
            StatusCode = statusCode
        };
    }

    /// <summary>
    /// Convert ServiceResult to IActionResult
    /// </summary>
    public static IActionResult ToActionResult(this ServiceResult result)
    {
        if (result.IsSuccess)
        {
            return new OkObjectResult(new
            {
                success = true,
                message = "Operation completed successfully"
            });
        }

        var statusCode = GetStatusCodeFromErrorCode(result.ErrorCode);
        return new ObjectResult(new
        {
            success = false,
            error = result.ErrorMessage,
            errorCode = result.ErrorCode,
            errors = result.Errors
        })
        {
            StatusCode = statusCode
        };
    }

    /// <summary>
    /// Convert AuthResult to IActionResult
    /// </summary>
    public static IActionResult ToActionResult(this AuthResult result)
    {
        if (result.IsSuccess)
        {
            return new OkObjectResult(new
            {
                success = true,
                data = new
                {
                    accessToken = result.AccessToken,
                    refreshToken = result.RefreshToken,
                    tokenType = result.TokenType,
                    expiresAt = result.ExpiresAt,
                    user = result.User
                }
            });
        }

        var statusCode = GetStatusCodeFromErrorCode(result.ErrorCode);
        return new ObjectResult(new
        {
            success = false,
            error = result.ErrorMessage,
            errorCode = result.ErrorCode
        })
        {
            StatusCode = statusCode
        };
    }

    /// <summary>
    /// Handle tuple results (for backward compatibility)
    /// </summary>
    public static IActionResult ToActionResult(this (bool Success, string? AccessToken, string? RefreshToken) result, string? errorMessage = null)
    {
        if (result.Success)
        {
            return new OkObjectResult(new
            {
                success = true,
                data = new
                {
                    accessToken = result.AccessToken,
                    refreshToken = result.RefreshToken,
                    tokenType = "Bearer"
                }
            });
        }

        return new BadRequestObjectResult(new
        {
            success = false,
            error = errorMessage ?? "Operation failed"
        });
    }

    /// <summary>
    /// Handle tuple results with error message
    /// </summary>
    public static IActionResult ToActionResult(this (bool Success, string ErrorMessage) result)
    {
        if (result.Success)
        {
            return new OkObjectResult(new
            {
                success = true,
                message = result.ErrorMessage // In success case, this might be a success message
            });
        }

        return new BadRequestObjectResult(new
        {
            success = false,
            error = result.ErrorMessage
        });
    }

    /// <summary>
    /// Handle boolean results
    /// </summary>
    public static IActionResult ToActionResult(this bool result, string? successMessage = null, string? errorMessage = null)
    {
        if (result)
        {
            return new OkObjectResult(new
            {
                success = true,
                message = successMessage ?? "Operation completed successfully"
            });
        }

        return new BadRequestObjectResult(new
        {
            success = false,
            error = errorMessage ?? "Operation failed"
        });
    }

    private static int GetStatusCodeFromErrorCode(string? errorCode)
    {
        return errorCode switch
        {
            // Authentication errors
            var code when code?.StartsWith("AUTH_") == true => 401,

            // User errors
            "USER_001" or "USER_002" => 409, // Conflict
            "USER_005" => 404, // Not Found

            // Validation errors
            var code when code?.StartsWith("VAL_") == true => 400,

            // System errors
            var code when code?.StartsWith("SYS_") == true => 500,

            // File errors
            "FILE_001" => 404,
            var code when code?.StartsWith("FILE_") == true => 400,

            // Default
            _ => 400
        };
    }
}