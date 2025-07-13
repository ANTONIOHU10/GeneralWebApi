using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using GeneralWebApi.Identity.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace GeneralWebApi.Identity.Services;

public class JwtService : IJwtService
{

    private readonly JwtSettings _jwtSettings;
    // use symmetric security key to sign the token
    private readonly SymmetricSecurityKey _signingKey;

    // Dependency injection, to get the JwtSettings from the appsettings.json file
    public JwtService(IOptions<JwtSettings> jwtSettings)
    {
        _jwtSettings = jwtSettings.Value;
        // convert the secret key to a symmetric security key
        _signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));
    }

    public string GenerateAccessToken(IEnumerable<Claim> claims)
    {
        // create a token handler
        var tokenHandler = new JwtSecurityTokenHandler();
        // create a token descriptor
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes),
            SigningCredentials = new SigningCredentials(_signingKey, SecurityAlgorithms.HmacSha256Signature),
            Issuer = _jwtSettings.Issuer,
            Audience = _jwtSettings.Audience
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        // generate a randome 64 bytes
        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    public bool IsTokenExpired(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var jwtToken = tokenHandler.ReadJwtToken(token);
        return jwtToken.ValidTo < DateTime.UtcNow;
    }

    public ClaimsPrincipal? ValidateToken(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();

        // create a validation parameters, from the appsettings.json file
        var validationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = _jwtSettings.ValidateIssuerSigningKey,
            IssuerSigningKey = _signingKey,
            ValidateIssuer = _jwtSettings.ValidateIssuer,
            ValidIssuer = _jwtSettings.Issuer,
            ValidateAudience = _jwtSettings.ValidateAudience,
            ValidAudience = _jwtSettings.Audience,
            ValidateLifetime = _jwtSettings.ValidateLifetime,
            ClockSkew = TimeSpan.Zero
        };

        try
        {
            var principal = tokenHandler.ValidateToken(token, validationParameters, out var validatedToken);
            return principal;
        }
        catch (Exception)
        {
            return null;
        }
    }
}