using GeneralWebApi.Contracts.Requests;
using GeneralWebApi.Identity.Services;
using GeneralWebApi.WebApi.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GeneralWebApi.WebApi.Controllers.v2;

/// <summary>
/// Enterprise Authentication Controller with rich error handling
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
[ApiVersion("2.0")]
public class AuthController : ControllerBase
{
    private readonly IUserService _userService;

    public AuthController(IUserService userService)
    {
        _userService = userService;
    }

    /// <summary>
    /// Enterprise login endpoint
    /// </summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var result = await _userService.LoginEnterpriseAsync(request.Username, request.Password);
        return result.ToActionResult();
    }

    /// <summary>
    /// Enterprise refresh token endpoint
    /// </summary>
    [HttpPost("refresh")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        var result = await _userService.RefreshTokenEnterpriseAsync(request.RefreshToken);
        return result.ToActionResult();
    }

    /// <summary>
    /// Enterprise logout endpoint
    /// </summary>
    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout([FromBody] LogoutRequest request)
    {
        var result = await _userService.LogoutEnterpriseAsync(request.RefreshToken);
        return result.ToActionResult();
    }

    /// <summary>
    /// Enterprise register endpoint
    /// </summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var result = await _userService.RegisterUserEnterpriseAsync(request.Username, request.Password, request.Email);
        return result.ToActionResult();
    }

    /// <summary>
    /// Get current user information
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMe()
    {
        var username = User.Identity?.Name;
        if (string.IsNullOrEmpty(username))
        {
            return BadRequest(new { success = false, error = "Unable to get user information from token" });
        }

        var result = await _userService.GetUserInfoAsync(username);
        return result.ToActionResult();
    }

    /// <summary>
    /// Update password
    /// </summary>
    [HttpPut("password")]
    [Authorize]
    public async Task<IActionResult> UpdatePassword([FromBody] UpdatePasswordRequest request)
    {
        var username = User.Identity?.Name;
        if (string.IsNullOrEmpty(username))
        {
            return BadRequest(new { success = false, error = "Unable to get user information from token" });
        }

        var result = await _userService.UpdatePasswordEnterpriseAsync(username, request.NewPassword);
        return result.ToActionResult();
    }
}