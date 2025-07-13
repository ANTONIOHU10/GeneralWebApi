using System.Security.Claims;

namespace GeneralWebApi.Identity.Services;

public interface IJwtService
{
    string GenerateAccessToken(IEnumerable<Claim> claims);
    string GenerateRefreshToken();
    ClaimsPrincipal? ValidateToken(string token);
    bool IsTokenExpired(string token);
}