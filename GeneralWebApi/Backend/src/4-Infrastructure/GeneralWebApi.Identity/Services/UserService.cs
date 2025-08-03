using System.Collections.Concurrent;
using System.Security.Claims;
using System.Security.Cryptography;
using GeneralWebApi.Contracts.Responses;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Domain.Enums;
using GeneralWebApi.Integration.Repository;
using GeneralWebApi.Logging.Services;
using GeneralWebApi.Logging.Templates;
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
                _logger.LogWarning(LogTemplates.Identity.UserLoginFailed, username, "Invalid credentials");
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

            _logger.LogInformation(LogTemplates.Identity.UserLoginSuccess, username);
            return (true, accessToken, refreshToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(LogTemplates.Identity.UserLoginFailed, username, ex.Message);
            return (false, null, null);
        }
    }

    public async Task<(bool Success, string? AccessToken, string? RefreshToken)> RefreshTokenAsync(string refreshToken)
    {
        try
        {
            _logger.LogInformation(LogTemplates.Identity.TokenRefreshAttempt);

            if (!_refreshTokens.TryGetValue(refreshToken, out var tokenInfo))
            {
                _logger.LogWarning(LogTemplates.Identity.InvalidRefreshToken);
                return (false, null, null);
            }

            if (tokenInfo.Expiry < DateTime.UtcNow)
            {
                // remove the expired refresh token
                _refreshTokens.TryRemove(refreshToken, out _);
                _logger.LogWarning(LogTemplates.Identity.ExpiredRefreshToken);
                return (false, null, null);
            }

            var claims = await GetUserClaimsAsync(tokenInfo.UserId);
            if (claims == null)
            {
                return (false, null, null);
            }

            // generate a new access token
            var accessToken = _jwtService.GenerateAccessToken(claims.Claims);
            _logger.LogInformation(LogTemplates.Identity.TokenRefreshSuccess, tokenInfo.UserId);

            // update the refresh token
            var newRefreshToken = _jwtService.GenerateRefreshToken();

            // remove the old refresh token
            _refreshTokens.TryRemove(refreshToken, out _);

            // store the new refresh token
            _refreshTokens[newRefreshToken] = (tokenInfo.UserId, DateTime.UtcNow.AddDays(7));

            return (true, accessToken, newRefreshToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(LogTemplates.Identity.TokenRefreshFailed, ex.Message);
            return (false, null, null);
        }
    }

    public Task<bool> LogoutAsync(string refreshToken)
    {
        try
        {
            if (_refreshTokens.TryRemove(refreshToken, out var tokenInfo))
            {
                _logger.LogInformation(LogTemplates.Identity.UserLogout, tokenInfo.UserId);
                return Task.FromResult(true);
            }
            return Task.FromResult(false);
        }
        catch (Exception ex)
        {
            _logger.LogError(LogTemplates.Identity.LogoutError, ex.Message);
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
            _logger.LogError(LogTemplates.Identity.GetUserClaimsError, userName, ex.Message);
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

            // compare the computed hash with the hashed user password
            return computedInputPasswordHash == hashedUserPassword;
        }
        catch (Exception ex)
        {
            _logger.LogError(LogTemplates.Identity.UserValidationError, ex.Message);
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

            _logger.LogInformation(LogTemplates.Identity.UserRegistration, username);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(LogTemplates.Identity.UserRegistrationError, ex.Message);
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

            _logger.LogInformation(LogTemplates.Identity.PasswordUpdate, username);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(LogTemplates.Identity.PasswordUpdateError, ex.Message);
            return false;
        }
    }
}