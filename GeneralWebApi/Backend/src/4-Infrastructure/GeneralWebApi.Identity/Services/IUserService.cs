using System.Security.Claims;

namespace GeneralWebApi.Identity.Services;

public interface IUserService
{
    // Login with optional RememberMe parameter (defaults to false for backward compatibility)
    Task<(bool Success, string? AccessToken, string? RefreshToken)> LoginAsync(string username, string password, bool rememberMe = false);
    Task<(bool Success, string? AccessToken, string? RefreshToken)> RefreshTokenAsync(string refreshToken);
    Task<bool> LogoutAsync(string refreshToken);
    Task<ClaimsPrincipal?> GetUserClaimsAsync(string userName);
    Task<bool> ValidateUserAsync(string username, string password);
    Task<(bool Success, string ErrorMessage)> RegisterUserAsync(string username, string password, string email);
    string GeneratePasswordHash(string password);
    Task<UpdatePasswordResult> UpdatePasswordAsync(string username, string oldPassword, string newPassword);
    Task<(bool Success, string Message)> ForgotPasswordAsync(string email, string? requestedFromIp = null, string? requestedFromUserAgent = null);
    Task<(bool Success, string? ErrorMessage)> ResetPasswordAsync(string token, string newPassword);
    Task<(bool IsValid, string? Email)> VerifyResetTokenAsync(string token);

}