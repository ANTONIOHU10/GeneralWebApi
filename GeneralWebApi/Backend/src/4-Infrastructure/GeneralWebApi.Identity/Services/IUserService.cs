using System.Security.Claims;

namespace GeneralWebApi.Identity.Services;

public interface IUserService
{
    Task<(bool Success, string? AccessToken, string? RefreshToken)> LoginAsync(string username, string password);
    Task<(bool Success, string? AccessToken, string? RefreshToken)> RefreshTokenAsync(string refreshToken);
    Task<bool> LogoutAsync(string refreshToken);
    Task<ClaimsPrincipal?> GetUserClaimsAsync(string userName);
    Task<bool> ValidateUserAsync(string username, string password);
    Task<bool> RegisterUserAsync(string username, string password, string email);
    string GeneratePasswordHash(string password);
    Task<bool> UpdatePasswordAsync(string username, string newPassword);
}