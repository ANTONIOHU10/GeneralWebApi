using GeneralWebApi.Contracts.Common;
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

[ApiVersion("1.0")]
public class AuthController : BaseController
{
    private readonly IUserService _userService;
    private readonly IJwtService _jwtService;
    private readonly IUserRepository _userRepository;

    public AuthController(IUserService userService, IJwtService jwtService, IUserRepository userRepository)
    {
        _userService = userService;
        _jwtService = jwtService;
        _userRepository = userRepository;
    }

    [HttpPost("login")]
    [EnableRateLimiting("Default")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<LoginResponseData>>> Login([FromBody] LoginRequest request)
    {
        var (success, accessToken, refreshToken) = await _userService.LoginAsync(request.Username, request.Password);

        if (!success)
        {
            return Unauthorized(AuthResponse.LoginFailed("Invalid username or password"));
        }

        // get the user claims
        var userClaims = await _userService.GetUserClaimsAsync(request.Username);
        var roles = userClaims?.Claims
            .Where(c => c.Type == ClaimTypes.Role)
            .Select(c => c.Value)
            .ToArray() ?? Array.Empty<string>();

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
                RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(7)
            }
        };

        return Ok(AuthResponse.LoginSuccess(responseData));
    }

    [HttpPost("refresh")]
    [EnableRateLimiting("Default")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<RefreshTokenResponseData>>> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        var (success, accessToken, refreshToken) = await _userService.RefreshTokenAsync(request.RefreshToken);

        if (!success)
        {
            return Unauthorized(AuthResponse.RefreshTokenFailed("Invalid or expired refresh token"));
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

        return Ok(AuthResponse.RefreshTokenSuccess(responseData));
    }

    [HttpPost("logout")]
    [EnableRateLimiting("Default")]
    [Authorize(Policy = "UserOrAdmin")]
    public async Task<ActionResult<ApiResponse<LogoutResponseData>>> Logout([FromBody] LogoutRequest request)
    {
        var success = await _userService.LogoutAsync(request.RefreshToken);

        if (!success)
        {
            return BadRequest(ApiResponse<LogoutResponseData>.ErrorResult("Invalid refresh token"));
        }

        return Ok(AuthResponse.LogoutSuccess());
    }

    // add Authrorization   Bearer Token into the header
    [HttpGet("me")]
    [EnableRateLimiting("Default")]
    [Authorize(Policy = "UserOrAdmin")]
    public async Task<ActionResult<ApiResponse<LoginResponseData>>> GetCurrentUser()
    {
        var userName = User.Identity?.Name;

        if (string.IsNullOrEmpty(userName))
        {
            return Unauthorized(AuthResponse.UserInfoFailed("User not found"));
        }

        var userClaims = await _userService.GetUserClaimsAsync(userName);

        if (userClaims == null)
        {
            return NotFound(AuthResponse.UserInfoFailed("User not found"));
        }

        var roles = userClaims.Claims
            .Where(c => c.Type == ClaimTypes.Role)
            .Select(c => c.Value)
            .ToArray();

        var responseData = new UserInfoResponseData
        {
            UserId = userClaims.FindFirst(ClaimTypes.NameIdentifier)?.Value,
            Username = userClaims.FindFirst(ClaimTypes.Name)?.Value,
            Email = userClaims.FindFirst(ClaimTypes.Email)?.Value,
            Roles = roles
        };

        return Ok(AuthResponse.UserInfoSuccess(responseData));
    }


    [HttpPost("register")]
    [EnableRateLimiting("Default")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<RegisterResponseData>>> Register([FromBody] RegisterRequest request)
    {
        // TODO: validate the request

        var success = await _userService.RegisterUserAsync(request.Username, request.Password, request.Email);

        if (!success)
        {
            return BadRequest(AuthResponse.RegisterFailed("User registration failed"));
        }

        return Ok(AuthResponse.RegisterSuccess(new RegisterResponseData
        {
            UserId = request.Username,
            Username = request.Username,
            Email = request.Email,
            EmailConfirmed = false
        }));

    }

    [HttpPut("update-password")]
    [EnableRateLimiting("Default")]
    [Authorize(Policy = "UserOrAdmin")]
    public async Task<ActionResult<ApiResponse<UpdatePasswordResponseData>>> UpdatePassword([FromBody] UpdatePasswordRequest request)
    {
        var success = await _userService.UpdatePasswordAsync(request.Username, request.NewPassword);

        if (!success)
        {
            return BadRequest(AuthResponse.UpdatePasswordFailed("Password update failed"));
        }
        return Ok(AuthResponse.UpdatePasswordSuccess());
    }

}