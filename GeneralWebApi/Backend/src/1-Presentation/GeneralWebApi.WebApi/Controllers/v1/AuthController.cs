using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Contracts.Constants;
using GeneralWebApi.Contracts.Requests;
using GeneralWebApi.Contracts.Responses;
using GeneralWebApi.Controllers.Base;
using GeneralWebApi.Identity.Services;
using GeneralWebApi.Integration.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;

namespace GeneralWebApi.Controllers.v1;
[ApiController]
[Route("api/v1/[controller]")]
[ApiVersion("1.0")]
public class AuthController(IUserService userService) : BaseController
{
    private readonly IUserService _userService = userService;

    [HttpPost("login")]
    [EnableRateLimiting("Default")]
    [AllowAnonymous]
    public async Task<ActionResult> Login([FromBody] LoginRequest request)
    {
        return await ValidateAndExecuteAsync(request, async (req) =>
        {
            var (success, accessToken, refreshToken) = await _userService.LoginAsync(request.Username, request.Password, request.RememberMe);

            if (!success)
            {
                return Unauthorized(ApiResponse<LoginResponseData>.ErrorResult(
                    ErrorTitles.Authentication.InvalidCredentials,
                    401,
                    ErrorMessages.Authentication.InvalidCredentials
                ));
            }

            // get the user claims
            var userClaims = await _userService.GetUserClaimsAsync(request.Username);
            var roles = userClaims?.Claims
                .Where(c => c.Type == ClaimTypes.Role)
                .Select(c => c.Value)
                .ToArray() ?? [];

            // Calculate refresh token expiration based on RememberMe
            // RememberMe = true: 30 days, false: 7 days
            var refreshTokenExpirationDays = request.RememberMe ? 30 : 7;

            // here we don't use the AutoMapper to map the response data
            // because the LoginResponseData is not a complex object
            var responseData = new LoginResponseData
            {
                UserId = request.Username,
                Username = request.Username,
                Email = userClaims?.FindFirst(ClaimTypes.Email)?.Value,
                Roles = roles,
                Token = new TokenInfo
                {
                    AccessToken = accessToken,
                    RefreshToken = refreshToken,
                    TokenType = "Bearer",
                    ExpiresIn = 3600, // 1 hour
                    ExpiresAt = DateTime.UtcNow.AddHours(1),
                    RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(refreshTokenExpirationDays)
                }
            };

            return Ok(ApiResponse<LoginResponseData>.SuccessResult(responseData, "Login successful"));
        });
    }

    [HttpPost("refresh")]
    [EnableRateLimiting("Default")]
    [AllowAnonymous]
    public async Task<ActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        return await ValidateAndExecuteAsync(request, async (req) =>
        {
            var (success, accessToken, refreshToken) = await _userService.RefreshTokenAsync(req.RefreshToken);

            if (!success)
            {
                return Unauthorized(ApiResponse<RefreshTokenResponseData>.ErrorResult(
                    ErrorTitles.Authentication.InvalidRefreshToken,
                    401,
                    ErrorMessages.Authentication.InvalidRefreshToken
                ));
            }

            var responseData = new RefreshTokenResponseData
            {
                Token = new TokenInfo
                {
                    AccessToken = accessToken,
                    RefreshToken = refreshToken,
                    TokenType = "Bearer",
                    ExpiresIn = 3600,
                    ExpiresAt = DateTime.UtcNow.AddHours(1),
                    RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(7)
                },
                RefreshedAt = DateTime.UtcNow
            };

            return Ok(ApiResponse<RefreshTokenResponseData>.SuccessResult(responseData, "Token refreshed successfully"));
        });
    }

    [HttpPost("logout")]
    [EnableRateLimiting("Default")]
    [Authorize(Policy = "UserOrAdmin")]
    public async Task<ActionResult> Logout([FromBody] LogoutRequest request)
    {
        return await ValidateAndExecuteAsync(request, async (req) =>
        {
            var success = await _userService.LogoutAsync(req.RefreshToken);

            if (!success)
            {
                return BadRequest(ApiResponse<LogoutResponseData>.ErrorResult(
                    ErrorTitles.Authentication.InvalidRefreshToken,
                    400,
                    ErrorMessages.Authentication.InvalidRefreshToken
                ));
            }

            return Ok(ApiResponse<LogoutResponseData>.SuccessResult(null, "Logout successful"));
        });
    }

    // add Authrorization   Bearer Token into the header
    [HttpGet("me")]
    [EnableRateLimiting("Default")]
    [Authorize(Policy = "UserOrAdmin")]
    public ActionResult<ApiResponse<LoginResponseData>> GetCurrentUser()
    {
        // check if the user is authenticated
        if (!(User?.Identity?.IsAuthenticated ?? false))
        {
            return Unauthorized(AuthResponse.UserInfoFailed("User not found"));
        }

        var roles = User.Claims
            .Where(c => c.Type == ClaimTypes.Role)
            .Select(c => c.Value)
            .ToArray();

        var responseData = new UserInfoResponseData
        {
            UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
            Username = User.FindFirst(ClaimTypes.Name)?.Value,
            Email = User.FindFirst(ClaimTypes.Email)?.Value,
            Roles = roles
        };

        return Ok(AuthResponse.UserInfoSuccess(responseData));
    }


    [HttpPost("register")]
    [EnableRateLimiting("Default")]
    [AllowAnonymous]
    public async Task<ActionResult> Register([FromBody] RegisterRequest request)
    {
        return await ValidateAndExecuteAsync(request, async (req) =>
        {
            var (success, errorMessage) = await _userService.RegisterUserAsync(req.Username, req.Password, req.Email);

            if (!success)
            {
                return BadRequest(ApiResponse<RegisterResponseData>.ErrorResult(
                    ErrorTitles.User.UserCreationFailed,
                    400,
                    errorMessage ?? ErrorMessages.User.UserCreationFailed
                ));
            }

            var responseData = new RegisterResponseData
            {
                UserId = req.Username,
                Username = req.Username,
                Email = req.Email,
                EmailConfirmed = false
            };

            return Ok(ApiResponse<RegisterResponseData>.SuccessResult(responseData, "User registered successfully"));
        });
    }

    [HttpPut("update-password")]
    [EnableRateLimiting("Default")]
    [Authorize(Policy = "UserOrAdmin")]
    public async Task<ActionResult> UpdatePassword([FromBody] UpdatePasswordRequest request)
    {
        return await ValidateAndExecuteAsync(request, async (req) =>
        {
            var result = await _userService.UpdatePasswordAsync(req.Username, req.OldPassword, req.NewPassword);

            if (!result.Success)
            {
                return BadRequest(ApiResponse<UpdatePasswordResponseData>.ErrorResult(
                    result.ErrorTitle ?? ErrorTitles.Authentication.PasswordUpdateFailed,
                    400,
                    result.ErrorMessage ?? ErrorMessages.Authentication.PasswordUpdateFailed
                ));
            }

            return Ok(ApiResponse<UpdatePasswordResponseData>.SuccessResult(null, "Password updated successfully"));
        });
    }

    [HttpPost("forgot-password")]
    [EnableRateLimiting("Default")]
    [AllowAnonymous]
    public async Task<ActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        return await ValidateAndExecuteAsync(request, async (req) =>
        {
            // Get client IP and user agent for security logging
            var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString();
            var userAgent = HttpContext.Request.Headers["User-Agent"].ToString();

            var (success, message) = await _userService.ForgotPasswordAsync(req.Email, clientIp, userAgent);

            if (!success)
            {
                return BadRequest(ApiResponse<ForgotPasswordResponseData>.ErrorResult(
                    "Password reset failed",
                    400,
                    message
                ));
            }

            // Always return success message to prevent user enumeration
            var responseData = new ForgotPasswordResponseData
            {
                Message = message
            };

            return Ok(ApiResponse<ForgotPasswordResponseData>.SuccessResult(responseData, message));
        });
    }

    [HttpPost("reset-password")]
    [EnableRateLimiting("Default")]
    [AllowAnonymous]
    public async Task<ActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        return await ValidateAndExecuteAsync(request, async (req) =>
        {
            var (success, errorMessage) = await _userService.ResetPasswordAsync(req.Token, req.NewPassword);

            if (!success)
            {
                return BadRequest(ApiResponse<ResetPasswordResponseData>.ErrorResult(
                    "Password reset failed",
                    400,
                    errorMessage ?? "Invalid or expired reset token"
                ));
            }

            var responseData = new ResetPasswordResponseData
            {
                Message = "Password reset successfully"
            };

            return Ok(ApiResponse<ResetPasswordResponseData>.SuccessResult(responseData, "Password reset successfully"));
        });
    }

    [HttpPost("verify-reset-token")]
    [EnableRateLimiting("Default")]
    [AllowAnonymous]
    public async Task<ActionResult> VerifyResetToken([FromBody] VerifyResetTokenRequest request)
    {
        return await ValidateAndExecuteAsync(request, async (req) =>
        {
            var (isValid, email) = await _userService.VerifyResetTokenAsync(req.Token);

            var responseData = new VerifyResetTokenResponseData
            {
                IsValid = isValid,
                Email = email
            };

            if (!isValid)
            {
                return BadRequest(ApiResponse<VerifyResetTokenResponseData>.ErrorResult(
                    "Invalid token",
                    400,
                    "Invalid or expired reset token"
                ));
            }

            return Ok(ApiResponse<VerifyResetTokenResponseData>.SuccessResult(responseData, "Token is valid"));
        });
    }

}