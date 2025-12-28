using System.Security.Claims;

namespace GeneralWebApi.Identity.Services;

public interface IUserService
{
    // Legacy methods (for backward compatibility)
    Task<(bool Success, string? AccessToken, string? RefreshToken)> LoginAsync(string username, string password);
    Task<(bool Success, string? AccessToken, string? RefreshToken)> RefreshTokenAsync(string refreshToken);
    Task<bool> LogoutAsync(string refreshToken);
    Task<ClaimsPrincipal?> GetUserClaimsAsync(string userName);
    Task<bool> ValidateUserAsync(string username, string password);
    Task<(bool Success, string ErrorMessage)> RegisterUserAsync(string username, string password, string email);
    string GeneratePasswordHash(string password);
    Task<UpdatePasswordResult> UpdatePasswordAsync(string username, string oldPassword, string newPassword);

}