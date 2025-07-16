using System.Security.Claims;
using GeneralWebApi.Logging.Services;

namespace GeneralWebApi.Identity.Services;

public class UserService : IUserService
{
    private readonly IJwtService _jwtService;
    private readonly ILoggingService _logger;
    
    // temporary user storage - should use database in production
    private readonly Dictionary<string, (string Password, List<string> Roles)> _users = new()
    {
        { "admin", ("admin123", new List<string> { "Admin", "User" }) },
        { "user", ("user123", new List<string> { "User" }) }
    };

    // temporary refresh token storage - should use Redis or database in production
    private readonly Dictionary<string, (string UserId, DateTime Expiry)> _refreshTokens = new();

    // the registration of the UserService is in the ServiceCollectionExtensions.cs file
    public UserService(IJwtService jwtService, ILoggingService logger)
    {
        _jwtService = jwtService;
        _logger = logger;
    }

    public async Task<(bool Success, string? AccessToken, string? RefreshToken)> LoginAsync(string username, string password)
    {
        try
        {
            if (!await ValidateUserAsync(username, password))
            {
                _logger.LogWarning($"Login failed for user: {username}");
                return (false, null, null);
            }

            var claims = await GetUserClaimsAsync(username);
            if (claims == null)
            {
                return (false, null, null);
            }

            var accessToken = _jwtService.GenerateAccessToken(claims.Claims);
            var refreshToken = _jwtService.GenerateRefreshToken();

            // store the refresh token
            _refreshTokens[refreshToken] = (username, DateTime.UtcNow.AddDays(7));

            _logger.LogInformation($"User {username} logged in successfully");
            return (true, accessToken, refreshToken);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Login error for user {username}: {ex.Message}");
            return (false, null, null);
        }
    }

    public async Task<(bool Success, string? AccessToken)> RefreshTokenAsync(string refreshToken)
    {
        try
        {
            if (!_refreshTokens.TryGetValue(refreshToken, out var tokenInfo) || 
                tokenInfo.Expiry < DateTime.UtcNow)
            {
                _logger.LogWarning("Invalid or expired refresh token");
                return (false, null);
            }

            var claims = await GetUserClaimsAsync(tokenInfo.UserId);
            if (claims == null)
            {
                return (false, null);
            }

            var accessToken = _jwtService.GenerateAccessToken(claims.Claims);
            _logger.LogInformation($"Token refreshed for user: {tokenInfo.UserId}");
            
            return (true, accessToken);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Token refresh error: {ex.Message}");
            return (false, null);
        }
    }

    public Task<bool> LogoutAsync(string refreshToken)
    {
        try
        {
            if (_refreshTokens.Remove(refreshToken))
            {
                _logger.LogInformation("User logged out successfully");
                return Task.FromResult(true);
            }
            return Task.FromResult(false);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Logout error: {ex.Message}");
            return Task.FromResult(false);
        }
    }

    public Task<ClaimsPrincipal?> GetUserClaimsAsync(string userId)
    {
        try
        {
            // check if the user exists
            if (!_users.TryGetValue(userId, out var userInfo))
            {
                return Task.FromResult<ClaimsPrincipal?>(null);
            }

            // create a list of claims
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, userId),
                new(ClaimTypes.Name, userId),
                new(ClaimTypes.AuthenticationMethod, "JWT")
            };

            // add the role claims
            foreach (var role in userInfo.Roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var identity = new ClaimsIdentity(claims, "JWT");
            return Task.FromResult<ClaimsPrincipal?>(new ClaimsPrincipal(identity));
        }
        catch (Exception ex)
        {
            _logger.LogError($"Get user claims error for {userId}: {ex.Message}");
            return Task.FromResult<ClaimsPrincipal?>(null);
        }
    }

    public Task<bool> ValidateUserAsync(string username, string password)
    {
        try
        {
            return Task.FromResult(_users.TryGetValue(username, out var userInfo) && 
                   userInfo.Password == password);
        }
        catch (Exception ex)
        {
            _logger.LogError($"User validation error: {ex.Message}");
            return Task.FromResult(false);
        }
    }
}