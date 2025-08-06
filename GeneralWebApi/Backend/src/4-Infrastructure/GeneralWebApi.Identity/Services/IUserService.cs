using System.Security.Claims;
using GeneralWebApi.Application.Common.Models;
using GeneralWebApi.Contracts.Responses;

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
    Task<bool> UpdatePasswordAsync(string username, string newPassword);

    // Enterprise methods (new recommended approach)
    Task<AuthResult> LoginEnterpriseAsync(string username, string password);
    Task<AuthResult> RefreshTokenEnterpriseAsync(string refreshToken);
    Task<ServiceResult> LogoutEnterpriseAsync(string refreshToken);
    Task<ServiceResult<ClaimsPrincipal>> GetUserClaimsEnterpriseAsync(string userName);
    Task<ServiceResult<bool>> ValidateUserEnterpriseAsync(string username, string password);
    Task<ServiceResult<string>> RegisterUserEnterpriseAsync(string username, string password, string email);
    Task<ServiceResult> UpdatePasswordEnterpriseAsync(string username, string newPassword);
    Task<ServiceResult<UserInfoResponse>> GetUserInfoAsync(string username);
}