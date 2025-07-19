using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Contracts.Requests;
using GeneralWebApi.Contracts.Responses;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Domain.Enums;
using GeneralWebApi.Identity.Services;
using GeneralWebApi.Integration.Repository;
using GeneralWebApi.WebApi.Controllers.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;

namespace GeneralWebApi.WebApi.Controllers.v1;

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
    [EnableRateLimiting("Default")]
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
    [EnableRateLimiting("Default")]
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

    // add Authrorization   Bearer Token into the header
    [HttpGet("me")]
    [EnableRateLimiting("Default")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<LoginResponseData>>> GetCurrentUser()
    {
        var userName = User.Identity?.Name;

        if (string.IsNullOrEmpty(userName))
        {
            return Unauthorized(ApiResponse<LoginResponseData>.Unauthorized("User not found"));
        }

        var userClaims = await _userService.GetUserClaimsAsync(userName);

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
            UserId = userClaims.FindFirst(ClaimTypes.NameIdentifier)?.Value,
            Username = userClaims.FindFirst(ClaimTypes.Name)?.Value,
            Roles = roles
        };

        return Ok(ApiResponse<LoginResponseData>.SuccessResult(responseData, "User information retrieved successfully"));
    }


    [HttpPost("register")]
    [EnableRateLimiting("Default")]
    public async Task<ActionResult<ApiResponse<RegisterResponseData>>> Register([FromBody] RegisterRequest request)
    {
        // TODO: validate the request
        if (await _userRepository.ExistsByEmailAsync(request.Email) ||
            await _userRepository.ExistsByNameAsync(request.Username))
        {
            return BadRequest(AuthResponse.RegisterFailed("User already exists"));
        }
        var user = new User
        {
            Name = request.Username,
            Email = request.Email,
            PasswordHash = request.Password,
            CreatedBy = "System",
            Role = Role.User.ToString()

        };
        await _userRepository.RegisterUserAsync(user);
        return Ok(AuthResponse.RegisterSuccess(new RegisterResponseData
        {
            UserId = user.Id.ToString(),
            Username = user.Name,
            Email = user.Email,
            EmailConfirmed = false
        }));
    }
}