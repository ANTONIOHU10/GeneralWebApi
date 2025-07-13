using System.Security.Claims;

namespace GeneralWebApi.Identity.Services;

public interface IJwtService
{
    string GenerateAccessToken(IEnumerable<Claim> claims);
    string GenerateRefreshToken();

    // ClaimsPrincipal is a class that contains the claims of the user
    ClaimsPrincipal? ValidateToken(string token);
    bool IsTokenExpired(string token);
}