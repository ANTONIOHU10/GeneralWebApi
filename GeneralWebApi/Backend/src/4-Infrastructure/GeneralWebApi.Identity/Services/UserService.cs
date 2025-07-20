using System.Collections.Concurrent;
using System.Security.Claims;
using System.Security.Cryptography;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Domain.Enums;
using GeneralWebApi.Integration.Repository;
using GeneralWebApi.Logging.Services;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;

namespace GeneralWebApi.Identity.Services;

public class UserService : IUserService
{
    private readonly IJwtService _jwtService;
    private readonly ILoggingService _logger;

    private readonly IUserRepository _userRepository;

    // need to save the refresh token in static, because it's a random byte array
    // but access token is a decoded string, it contains all users' information to be validated
    // temporary refresh token storage - should use Redis or database in production
    // static to avoid multiple instances of the dictionary
    // TODO: use Redis or database in production
    private static readonly ConcurrentDictionary<string, (string UserId, DateTime Expiry)> _refreshTokens = new();

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
            _refreshTokens.TryAdd(refreshToken, (username, DateTime.UtcNow.AddDays(7)));

            if (_refreshTokens.ContainsKey(refreshToken))
            {
                _logger.LogInformation($"Refresh token saved for user: {username}");
                _logger.LogInformation($"Refresh tokens: {string.Join(", ", _refreshTokens.Keys)}");
            }

            _logger.LogInformation($"User {username} logged in successfully");
            return (true, accessToken, refreshToken);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Login error for user {username}: {ex.Message}");
            return (false, null, null);
        }
    }

    public async Task<(bool Success, string? AccessToken, string? RefreshToken)> RefreshTokenAsync(string refreshToken)
    {
        try
        {
            _logger.LogInformation($"Attempting to refresh token: {refreshToken}");
            _logger.LogInformation($"Current refresh tokens count: {_refreshTokens.Count}");

            if (!_refreshTokens.TryGetValue(refreshToken, out var tokenInfo))
            {
                _logger.LogWarning("Invalid refresh token");
                return (false, null, null);
            }

            if (tokenInfo.Expiry < DateTime.UtcNow)
            {
                // remove the expired refresh token
                _refreshTokens.TryRemove(refreshToken, out _);
                _logger.LogWarning("Expired refresh token");
                return (false, null, null);
            }

            var claims = await GetUserClaimsAsync(tokenInfo.UserId);
            if (claims == null)
            {
                return (false, null, null);
            }

            // generate a new access token
            var accessToken = _jwtService.GenerateAccessToken(claims.Claims);
            _logger.LogInformation($"Token refreshed for user: {tokenInfo.UserId}");

            // update the refresh token
            var newRefreshToken = _jwtService.GenerateRefreshToken();

            // remove the old refresh token
            _refreshTokens.TryRemove(refreshToken, out _);

            // store the new refresh token
            _refreshTokens[newRefreshToken] = (tokenInfo.UserId, DateTime.UtcNow.AddDays(7));
            _logger.LogInformation($"New refresh token generated for user: {tokenInfo.UserId}");

            return (true, accessToken, newRefreshToken);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Token refresh error: {ex.Message}");
            return (false, null, null);
        }
    }

    public Task<bool> LogoutAsync(string refreshToken)
    {
        try
        {
            if (_refreshTokens.TryRemove(refreshToken, out _))
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
                new(ClaimTypes.Email, user.Email),
                new(ClaimTypes.AuthenticationMethod, "JWT"),
                new(ClaimTypes.Role, user.Role)
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

            // check if the password is correct
            var passwordHash = user.PasswordHash.Split(':');
            var salt = Convert.FromBase64String(passwordHash[0]);
            var hashedUserPassword = passwordHash[1];

            // verify the password using the same hashing algorithm and salt
            var computedInputPasswordHash = Convert.ToBase64String(KeyDerivation.Pbkdf2(
                password: password,
                salt: salt,
                prf: KeyDerivationPrf.HMACSHA256,
                iterationCount: 100000,
                numBytesRequested: 256 / 8
            ));
            Console.WriteLine("------Starting password validation------");
            Console.WriteLine($"computedInputPasswordHash: {computedInputPasswordHash}");
            Console.WriteLine($"hashedUserPassword: {hashedUserPassword}");
            Console.WriteLine("------Ending password validation------");

            // compare the computed hash with the hashed user password
            return computedInputPasswordHash == hashedUserPassword;
        }
        catch (Exception ex)
        {
            _logger.LogError($"User validation error: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> RegisterUserAsync(string username, string password, string email)
    {
        try
        {
            if (await _userRepository.ExistsByEmailAsync(email) ||
                await _userRepository.ExistsByNameAsync(username))
            {
                return false;
            }
            var user = new User
            {
                Name = username,
                Email = email,
                PasswordHash = GeneratePasswordHash(password),
                CreatedBy = "System",
                Role = Role.User.ToString()
            };
            await _userRepository.RegisterUserAsync(user);

            _logger.LogInformation($"User {username} registered successfully");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError($"User registration error: {ex.Message}");
            return false;
        }
    }

    public string GeneratePasswordHash(string password)
    {
        // generate a random salt to hash the password
        byte[] salt = RandomNumberGenerator.GetBytes(128 / 8);

        // hash the password
        string hashed = Convert.ToBase64String(KeyDerivation.Pbkdf2(
            password: password!,
            salt: salt,
            prf: KeyDerivationPrf.HMACSHA256,
            iterationCount: 100000,
            numBytesRequested: 256 / 8
        ));

        // return the salt and the hashed password together
        return $"{Convert.ToBase64String(salt)}:{hashed}";
    }

    public async Task<bool> UpdatePasswordAsync(string username, string newPassword)
    {
        try
        {
            var user = await _userRepository.GetByNameAsync(username);
            if (user == null)
            {
                return false;
            }

            user.PasswordHash = GeneratePasswordHash(newPassword);
            // add the helper fields
            user.UpdatedBy = "User";
            user.UpdatedAt = DateTime.UtcNow;
            user.Version = user.Version + 1;

            await _userRepository.UpdatePasswordAsync(user);

            _logger.LogInformation($"Password updated for user: {username}");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Password update error: {ex.Message}");
            return false;
        }
    }
}