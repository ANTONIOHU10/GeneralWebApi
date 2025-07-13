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
    // the registration of the JwtService is in the ServiceCollectionExtensions.cs file
    public JwtService(IOptions<JwtSettings> jwtSettings)
    {
        _jwtSettings = jwtSettings.Value;
        // convert the secret key string from appsettings.json to a symmetric security key byte array
        // the symmetric security key is used to sign the token, so user cannot see the secret key
        _signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));
    }

    public string GenerateAccessToken(IEnumerable<Claim> claims)
    {
        // create a token handler
        var tokenHandler = new JwtSecurityTokenHandler();
        // create a token descriptor
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            // using the claims input to create a new ClaimsIdentity
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes),
            // specific the algorithm to use to generate the signature of the token
            SigningCredentials = new SigningCredentials(_signingKey, SecurityAlgorithms.HmacSha256Signature),
            Issuer = _jwtSettings.Issuer,
            Audience = _jwtSettings.Audience
        };
        // create a token object
        var token = tokenHandler.CreateToken(tokenDescriptor);

        // write the token to a string
        return tokenHandler.WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        // generate a randome 64 bytes
        var randomNumber = new byte[64];
        // the security random number generator
        using var rng = RandomNumberGenerator.Create();
        // fill the 64 bytes of the random number with a random number
        rng.GetBytes(randomNumber);
        // convert the random number to a base64 string
        return Convert.ToBase64String(randomNumber);
    }

    public bool IsTokenExpired(string token)
    {
        // create a token handler to transform the token string to a JwtSecurityToken object
        var tokenHandler = new JwtSecurityTokenHandler();
        // token string is a 3 part string, header.payload.signature
        // need to convert it to a JwtSecurityToken (object) by Base64 code to get a specific property
        var jwtToken = tokenHandler.ReadJwtToken(token);
        // check if the token is expired
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
            // validate the token
            // extract the signature from the token (the 3rd part of the token)
            // using the MS SHA256 algorithm to validate the token using the secret key

            var principal = tokenHandler.ValidateToken(token, validationParameters, out var validatedToken);
            // return the principal object that contains the claims of the user
            return principal;
        }
        catch (Exception)
        {
            return null;
        }
    }
}