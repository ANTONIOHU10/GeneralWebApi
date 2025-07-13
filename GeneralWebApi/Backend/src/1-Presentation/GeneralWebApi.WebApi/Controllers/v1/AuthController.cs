using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Contracts.Requests;
using GeneralWebApi.Contracts.Responses;
using GeneralWebApi.Identity.Services;
using GeneralWebApi.WebApi.Controllers.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GeneralWebApi.WebApi.Controllers.v1;

[ApiVersion("1.0")]
public class AuthController : BaseController
{
    private readonly IUserService _userService;
    private readonly IJwtService _jwtService;

    public AuthController(IUserService userService, IJwtService jwtService)
    {
        _userService = userService;
        _jwtService = jwtService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<LoginResponseData>>> Login([FromBody] LoginRequest request)
    {
        var (success, accessToken, refreshToken) = await _userService.LoginAsync(request.Username, request.Password);

        if (!success)
        {
            return Unauthorized(AuthResponse.LoginFailed("Invalid username or password"));
        }

        // 获取用户信息
        var userClaims = await _userService.GetUserClaimsAsync(request.Username);
        var roles = userClaims?.Claims
            .Where(c => c.Type == ClaimTypes.Role)
            .Select(c => c.Value)
            .ToArray() ?? Array.Empty<string>();

        var responseData = new LoginResponseData
        {
            UserId = request.Username,
            Username = request.Username,
            Email = $"{request.Username}@example.com", // 临时，实际应从数据库获取
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
    public async Task<ActionResult<ApiResponse<RefreshTokenResponseData>>> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        var (success, accessToken) = await _userService.RefreshTokenAsync(request.RefreshToken);

        if (!success)
        {
            return Unauthorized(AuthResponse.RefreshTokenFailed("Invalid or expired refresh token"));
        }

        var responseData = new RefreshTokenResponseData
        {
            Token = new TokenInfo
            {
                AccessToken = accessToken,
                RefreshToken = request.RefreshToken, // 保持原有的 refresh token
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
    [Authorize]
    public async Task<ActionResult<ApiResponse<LogoutResponseData>>> Logout([FromBody] LogoutRequest request)
    {
        var success = await _userService.LogoutAsync(request.RefreshToken);

        if (!success)
        {
            return BadRequest(ApiResponse<LogoutResponseData>.ErrorResult("Invalid refresh token"));
        }

        return Ok(AuthResponse.LogoutSuccess());
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<LoginResponseData>>> GetCurrentUser()
    {
        var userId = User.Identity?.Name;
        
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(ApiResponse<LoginResponseData>.Unauthorized("User not found"));
        }

        var userClaims = await _userService.GetUserClaimsAsync(userId);
        
        if (userClaims == null)
        {
            return NotFound(ApiResponse<LoginResponseData>.NotFound("User not found"));
        }

        var roles = userClaims.Claims
            .Where(c => c.Type == ClaimTypes.Role)
            .Select(c => c.Value)
            .ToArray();

        var responseData = new LoginResponseData
        {
            UserId = userId,
            Username = userId,
            Email = $"{userId}@example.com", // 临时，实际应从数据库获取
            Roles = roles,
            Profile = new Dictionary<string, object>
            {
                ["LastLogin"] = DateTime.UtcNow,
                ["AuthMethod"] = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.AuthenticationMethod)?.Value ?? "Unknown"
            }
            // 注意：这里不返回 Token 信息，因为这是获取用户信息的接口
        };

        return Ok(ApiResponse<LoginResponseData>.SuccessResult(responseData, "User information retrieved successfully"));
    }

    [HttpGet("validate")]
    [Authorize]
    public ActionResult<ApiResponse<object>> ValidateToken()
    {
        var tokenInfo = new
        {
            UserId = User.Identity?.Name,
            IsAuthenticated = User.Identity?.IsAuthenticated ?? false,
            AuthenticationType = User.Identity?.AuthenticationType,
            Roles = User.Claims.Where(c => c.Type == ClaimTypes.Role).Select(c => c.Value).ToArray(),
            Claims = User.Claims.Select(c => new { c.Type, c.Value }).ToArray()
        };

        return Ok(ApiResponse<object>.SuccessResult(tokenInfo, "Token is valid"));
    }
    /*
    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<RegisterResponseData>>> Register([FromBody] RegisterRequest request)
    {
        // 这里应该实现用户注册逻辑
        // 目前先返回未实现的响应
        
        return BadRequest(AuthResponse.RegisterFailed("Registration not implemented yet"));
    }
    */
}