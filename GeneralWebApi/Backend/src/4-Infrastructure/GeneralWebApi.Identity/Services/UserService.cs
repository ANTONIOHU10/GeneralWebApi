using System.Security.Claims;
using GeneralWebApi.Integration.Repository;
using GeneralWebApi.Logging.Services;

namespace GeneralWebApi.Identity.Services;

public class UserService : IUserService
{
    private readonly IJwtService _jwtService;
    private readonly ILoggingService _logger;

    private readonly IUserRepository _userRepository;

    // temporary refresh token storage - should use Redis or database in production
    private readonly Dictionary<string, (string UserId, DateTime Expiry)> _refreshTokens = new();

    // the registration of the UserService is in the ServiceCollectionExtensions.cs file
    public UserService(IJwtService jwtService, ILoggingService logger, IUserRepository userRepository)
    {
        _jwtService = jwtService;
        _logger = logger;
        _userRepository = userRepository;
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

    public async Task<ClaimsPrincipal?> GetUserClaimsAsync(string userName)
    {
        try
        {
            var user = await _userRepository.GetByNameAsync(userName);
            if (user == null)
            {
                return null;
            }

            // create a list of claims
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new(ClaimTypes.Name, user.Name),
                new(ClaimTypes.AuthenticationMethod, "JWT")
            };

            var identity = new ClaimsIdentity(claims, "JWT");
            return new ClaimsPrincipal(identity);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Get user claims error for {userName}: {ex.Message}");
            return null;
        }
    }

    public async Task<bool> ValidateUserAsync(string username, string password)
    {
        try
        {
            var user = await _userRepository.ValidateUserAsync(username, password);
            if (user == null)
            {
                return false;
            }
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError($"User validation error: {ex.Message}");
            return false;
        }
    }
}