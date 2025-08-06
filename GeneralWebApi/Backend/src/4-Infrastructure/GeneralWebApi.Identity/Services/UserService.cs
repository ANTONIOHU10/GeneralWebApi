using System.Collections.Concurrent;
using System.Security.Claims;
using System.Security.Cryptography;
using GeneralWebApi.Application.Common.Models;
using GeneralWebApi.Caching.Services;
using GeneralWebApi.Contracts.Responses;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Domain.Enums;
using GeneralWebApi.Domain.Shared.Constants;
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
    private readonly IRedisCacheService _cacheService;

    // need to save the refresh token in static, because it's a random byte array
    // but access token is a decoded string, it contains all users' information to be validated
    // temporary refresh token storage - should use Redis or database in production
    // static to avoid multiple instances of the dictionary
    // TODO: use Redis or database in production
    private static readonly ConcurrentDictionary<string, (string UserId, DateTime Expiry)> _refreshTokens = new();

    // the registration of the UserService is in the ServiceCollectionExtensions.cs file
    public UserService(IJwtService jwtService, ILoggingService logger, IUserRepository userRepository, IRedisCacheService cacheService)
    {
        _jwtService = jwtService;
        _logger = logger;
        _userRepository = userRepository;
        _cacheService = cacheService;
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
            //_refreshTokens.TryAdd(refreshToken, (username, DateTime.UtcNow.AddDays(7)));

            await _cacheService.SetAsync($"refreshToken:{refreshToken}", username, TimeSpan.FromDays(7));

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

            // 从 Redis 获取 refresh token 信息
            var userId = await _cacheService.GetAsync<string>($"refreshToken:{refreshToken}");
            if (string.IsNullOrEmpty(userId))
            {
                _logger.LogWarning(LogTemplates.Identity.InvalidRefreshToken);
                return (false, null, null);
            }

            var claims = await GetUserClaimsAsync(userId);
            if (claims == null)
            {
                return (false, null, null);
            }

            // generate a new access token
            var accessToken = _jwtService.GenerateAccessToken(claims.Claims);
            _logger.LogInformation(LogTemplates.Identity.TokenRefreshSuccess, userId);

            // update the refresh token
            var newRefreshToken = _jwtService.GenerateRefreshToken();

            // remove the old refresh token
            await _cacheService.RemoveAsync($"refreshToken:{refreshToken}");

            // store the new refresh token
            await _cacheService.SetAsync($"refreshToken:{newRefreshToken}", userId, TimeSpan.FromDays(7));

            return (true, accessToken, newRefreshToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(LogTemplates.Identity.TokenRefreshFailed, ex.Message);
            return (false, null, null);
        }
    }

    public async Task<bool> LogoutAsync(string refreshToken)
    {
        try
        {
            // first check if the refresh token is in the cache
            var userId = await _cacheService.GetAsync<string>($"refreshToken:{refreshToken}");
            if (userId != null)
            {
                // remove the refresh token from the cache
                await _cacheService.RemoveAsync($"refreshToken:{refreshToken}");
                _logger.LogInformation(LogTemplates.Identity.UserLogout, userId);
                return true;
            }
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(LogTemplates.Identity.LogoutError, ex.Message);
            return false;
        }
    }

    // Get user claims with improved caching and logging
    public async Task<ClaimsPrincipal?> GetUserClaimsAsync(string userName)
    {
        try
        {
            _logger.LogInformation(LogTemplates.Identity.GetUserClaimsAttempt, userName);

            // Try to get cached user info first
            var cachedUserInfo = await _cacheService.GetAsync<CachedUserInfo>($"user_info:{userName}");
            if (cachedUserInfo != null)
            {
                _logger.LogInformation(LogTemplates.Identity.GetUserClaimsFromCache, userName);

                // Rebuild ClaimsPrincipal from cached info
                var cachedClaims = new List<Claim>
                {
                    new(ClaimTypes.NameIdentifier, cachedUserInfo.UserId),
                    new(ClaimTypes.Name, cachedUserInfo.Username),
                    new(ClaimTypes.Email, cachedUserInfo.Email),
                    new(ClaimTypes.AuthenticationMethod, "JWT"),
                    new(ClaimTypes.Role, cachedUserInfo.Role)
                };

                var cachedIdentity = new ClaimsIdentity(cachedClaims, "JWT");
                return new ClaimsPrincipal(cachedIdentity);
            }

            // Get user from database
            _logger.LogInformation(LogTemplates.Identity.GetUserClaimsFromDatabase, userName);
            var user = await _userRepository.GetByNameAsync(userName);
            if (user == null)
            {
                return null;
            }

            // Create claims list
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new(ClaimTypes.Name, user.Name),
                new(ClaimTypes.Email, user.Email),
                new(ClaimTypes.AuthenticationMethod, "JWT"),
                new(ClaimTypes.Role, user.Role)
            };

            var identity = new ClaimsIdentity(claims, "JWT");
            var claimsPrincipal = new ClaimsPrincipal(identity);

            // Cache simplified user info (not ClaimsPrincipal to avoid circular reference)
            var userInfoToCache = new CachedUserInfo
            {
                UserId = user.Id.ToString(),
                Username = user.Name,
                Email = user.Email,
                Role = user.Role
            };

            const int cacheExpiryMinutes = 60;
            await _cacheService.SetAsync($"user_info:{userName}", userInfoToCache, TimeSpan.FromMinutes(cacheExpiryMinutes));
            _logger.LogInformation(LogTemplates.Identity.UserClaimsCached, userName, cacheExpiryMinutes);

            return claimsPrincipal;
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
            _logger.LogInformation(LogTemplates.Identity.UserValidationAttempt, username);

            var user = await _userRepository.ValidateUserAsync(username, password);
            if (user == null)
            {
                _logger.LogWarning(LogTemplates.Identity.UserValidationFailed, username);
                return false;
            }

            // Check if the password is correct
            var passwordHash = user.PasswordHash.Split(':');
            var salt = Convert.FromBase64String(passwordHash[0]);
            var hashedUserPassword = passwordHash[1];

            // Verify the password using the same hashing algorithm and salt
            var computedInputPasswordHash = Convert.ToBase64String(KeyDerivation.Pbkdf2(
                password: password,
                salt: salt,
                prf: KeyDerivationPrf.HMACSHA256,
                iterationCount: 100000,
                numBytesRequested: 256 / 8
            ));

            // Compare the computed hash with the hashed user password
            var isValid = computedInputPasswordHash == hashedUserPassword;

            if (isValid)
            {
                _logger.LogInformation(LogTemplates.Identity.UserValidationSuccess, username);
            }
            else
            {
                _logger.LogWarning(LogTemplates.Identity.UserValidationFailed, username);
            }

            return isValid;
        }
        catch (Exception ex)
        {
            _logger.LogError(LogTemplates.Identity.UserValidationError, ex.Message);
            return false;
        }
    }

    public async Task<(bool Success, string ErrorMessage)> RegisterUserAsync(string username, string password, string email)
    {
        try
        {
            // Log registration attempt
            _logger.LogInformation(LogTemplates.Identity.UserRegistrationAttempt, username, email);

            // Check if email already exists
            _logger.LogInformation(LogTemplates.Identity.CheckingEmailExists, email);
            var emailExists = await _userRepository.ExistsByEmailAsync(email);
            _logger.LogInformation(LogTemplates.Identity.EmailExistsResult, email, emailExists);

            // Check if username already exists
            _logger.LogInformation(LogTemplates.Identity.CheckingUsernameExists, username);
            var usernameExists = await _userRepository.ExistsByNameAsync(username);
            _logger.LogInformation(LogTemplates.Identity.UsernameExistsResult, username, usernameExists);

            // Handle different existence scenarios with specific logging and error messages
            if (emailExists && usernameExists)
            {
                _logger.LogWarning(LogTemplates.Identity.UserAndEmailAlreadyExist, username, email);
                return (false, "Both username and email are already in use. Please choose different credentials.");
            }

            if (emailExists)
            {
                _logger.LogWarning(LogTemplates.Identity.EmailAlreadyExists, email);
                return (false, "This email address is already registered. Please use a different email or try logging in.");
            }

            if (usernameExists)
            {
                _logger.LogWarning(LogTemplates.Identity.UsernameAlreadyExists, username);
                return (false, "This username is already taken. Please choose a different username.");
            }

            // Validation passed
            _logger.LogInformation(LogTemplates.Identity.UserRegistrationValidationPassed, username, email);

            // Generate password hash
            _logger.LogInformation(LogTemplates.Identity.PasswordHashGenerated, username);
            var passwordHash = GeneratePasswordHash(password);

            // Create user object
            var user = new User
            {
                Name = username,
                Email = email,
                PasswordHash = passwordHash,
                CreatedBy = "System",
                Role = Role.User.ToString()
            };

            // Log user creation start
            _logger.LogInformation(LogTemplates.Identity.UserCreationStarted, username, email, user.Role);

            // Save to database
            await _userRepository.RegisterUserAsync(user);

            // Log successful completion
            _logger.LogInformation(LogTemplates.Identity.UserCreationCompleted, username, user.Id);
            _logger.LogInformation(LogTemplates.Identity.UserRegistration, username);

            return (true, "User registered successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(LogTemplates.Identity.UserRegistrationError, ex.Message);
            return (false, $"Registration failed due to a system error: {ex.Message}");
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

    #region Enterprise Methods (Recommended for new development)

    /// <summary>
    /// Enterprise login method with rich error handling
    /// </summary>
    public async Task<AuthResult> LoginEnterpriseAsync(string username, string password)
    {
        try
        {
            var validationResult = await ValidateUserEnterpriseAsync(username, password);
            if (!validationResult.IsSuccess)
            {
                return AuthResult.Failure("Invalid username or password", ErrorCodes.Authentication.InvalidCredentials);
            }

            var claimsResult = await GetUserClaimsEnterpriseAsync(username);
            if (!claimsResult.IsSuccess || claimsResult.Data == null)
            {
                return AuthResult.Failure("Failed to get user claims", ErrorCodes.Authentication.ClaimsGenerationFailed);
            }

            var accessToken = _jwtService.GenerateAccessToken(claimsResult.Data.Claims);
            var refreshToken = _jwtService.GenerateRefreshToken();
            var expiresAt = DateTime.UtcNow.AddHours(1);

            await _cacheService.SetAsync($"refreshToken:{refreshToken}", username, TimeSpan.FromDays(7));

            var userInfo = new UserInfoResponse
            {
                Id = claimsResult.Data.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "",
                Username = claimsResult.Data.FindFirst(ClaimTypes.Name)?.Value ?? "",
                Email = claimsResult.Data.FindFirst(ClaimTypes.Email)?.Value ?? "",
                Role = claimsResult.Data.FindFirst(ClaimTypes.Role)?.Value ?? "",
                Permissions = GetUserPermissions(claimsResult.Data)
            };

            _logger.LogInformation(LogTemplates.Identity.UserLoginSuccess, username);
            return AuthResult.Success(accessToken, refreshToken, expiresAt, userInfo);
        }
        catch (Exception ex)
        {
            _logger.LogError(LogTemplates.Identity.UserLoginFailed, username, ex.Message);
            return AuthResult.Failure("An error occurred during login", ErrorCodes.System.InternalError);
        }
    }

    /// <summary>
    /// Enterprise refresh token method
    /// </summary>
    public async Task<AuthResult> RefreshTokenEnterpriseAsync(string refreshToken)
    {
        try
        {
            var userId = await _cacheService.GetAsync<string>($"refreshToken:{refreshToken}");
            if (string.IsNullOrEmpty(userId))
            {
                return AuthResult.Failure("Invalid refresh token", ErrorCodes.Authentication.InvalidRefreshToken);
            }

            var claimsResult = await GetUserClaimsEnterpriseAsync(userId);
            if (!claimsResult.IsSuccess || claimsResult.Data == null)
            {
                return AuthResult.Failure("Failed to get user claims for refresh", ErrorCodes.Authentication.UserNotFound);
            }

            var accessToken = _jwtService.GenerateAccessToken(claimsResult.Data.Claims);
            var newRefreshToken = _jwtService.GenerateRefreshToken();
            var expiresAt = DateTime.UtcNow.AddHours(1);

            await _cacheService.RemoveAsync($"refreshToken:{refreshToken}");
            await _cacheService.SetAsync($"refreshToken:{newRefreshToken}", userId, TimeSpan.FromDays(7));

            return AuthResult.Success(accessToken, newRefreshToken, expiresAt);
        }
        catch (Exception ex)
        {
            _logger.LogError(LogTemplates.Identity.TokenRefreshFailed, ex.Message);
            return AuthResult.Failure("An error occurred during token refresh", ErrorCodes.System.InternalError);
        }
    }

    /// <summary>
    /// Enterprise logout method
    /// </summary>
    public async Task<ServiceResult> LogoutEnterpriseAsync(string refreshToken)
    {
        try
        {
            var userId = await _cacheService.GetAsync<string>($"refreshToken:{refreshToken}");
            if (userId != null)
            {
                await _cacheService.RemoveAsync($"refreshToken:{refreshToken}");
                _logger.LogInformation(LogTemplates.Identity.UserLogout, userId);
                return ServiceResult.Success();
            }
            return ServiceResult.Failure("Refresh token not found", ErrorCodes.Authentication.InvalidRefreshToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(LogTemplates.Identity.LogoutError, ex.Message);
            return ServiceResult.Failure("An error occurred during logout", ErrorCodes.System.InternalError);
        }
    }

    /// <summary>
    /// Enterprise get user claims method
    /// </summary>
    public async Task<ServiceResult<ClaimsPrincipal>> GetUserClaimsEnterpriseAsync(string userName)
    {
        try
        {
            var claimsPrincipal = await GetUserClaimsAsync(userName); // Reuse existing logic
            if (claimsPrincipal == null)
            {
                return ServiceResult<ClaimsPrincipal>.Failure("User not found", ErrorCodes.Authentication.UserNotFound);
            }
            return ServiceResult<ClaimsPrincipal>.Success(claimsPrincipal);
        }
        catch (Exception ex)
        {
            _logger.LogError(LogTemplates.Identity.GetUserClaimsError, userName, ex.Message);
            return ServiceResult<ClaimsPrincipal>.Failure("An error occurred while getting user claims", ErrorCodes.System.InternalError);
        }
    }

    /// <summary>
    /// Enterprise validate user method
    /// </summary>
    public async Task<ServiceResult<bool>> ValidateUserEnterpriseAsync(string username, string password)
    {
        try
        {
            var isValid = await ValidateUserAsync(username, password); // Reuse existing logic
            return ServiceResult<bool>.Success(isValid);
        }
        catch (Exception ex)
        {
            _logger.LogError(LogTemplates.Identity.UserValidationError, ex.Message);
            return ServiceResult<bool>.Failure("An error occurred during user validation", ErrorCodes.System.InternalError);
        }
    }

    /// <summary>
    /// Enterprise register user method
    /// </summary>
    public async Task<ServiceResult<string>> RegisterUserEnterpriseAsync(string username, string password, string email)
    {
        try
        {
            var emailExists = await _userRepository.ExistsByEmailAsync(email);
            var usernameExists = await _userRepository.ExistsByNameAsync(username);

            if (emailExists && usernameExists)
            {
                return ServiceResult<string>.Failure("Both username and email are already in use", ErrorCodes.User.UsernameAlreadyExists);
            }

            if (emailExists)
            {
                return ServiceResult<string>.Failure("Email already exists", ErrorCodes.User.EmailAlreadyExists);
            }

            if (usernameExists)
            {
                return ServiceResult<string>.Failure("Username already exists", ErrorCodes.User.UsernameAlreadyExists);
            }

            var passwordHash = GeneratePasswordHash(password);
            var user = new User
            {
                Name = username,
                Email = email,
                PasswordHash = passwordHash,
                CreatedBy = "System",
                Role = Role.User.ToString()
            };

            await _userRepository.RegisterUserAsync(user);
            _logger.LogInformation(LogTemplates.Identity.UserRegistration, username);

            return ServiceResult<string>.Success(user.Id.ToString());
        }
        catch (Exception ex)
        {
            _logger.LogError(LogTemplates.Identity.UserRegistrationError, ex.Message);
            return ServiceResult<string>.Failure("Registration failed", ErrorCodes.User.UserCreationFailed);
        }
    }

    /// <summary>
    /// Enterprise update password method
    /// </summary>
    public async Task<ServiceResult> UpdatePasswordEnterpriseAsync(string username, string newPassword)
    {
        try
        {
            var success = await UpdatePasswordAsync(username, newPassword); // Reuse existing logic
            if (success)
            {
                return ServiceResult.Success();
            }
            return ServiceResult.Failure("Failed to update password", ErrorCodes.User.PasswordUpdateFailed);
        }
        catch (Exception ex)
        {
            _logger.LogError(LogTemplates.Identity.PasswordUpdateError, ex.Message);
            return ServiceResult.Failure("An error occurred during password update", ErrorCodes.System.InternalError);
        }
    }

    /// <summary>
    /// Get user information
    /// </summary>
    public async Task<ServiceResult<UserInfoResponse>> GetUserInfoAsync(string username)
    {
        try
        {
            var claimsResult = await GetUserClaimsEnterpriseAsync(username);
            if (!claimsResult.IsSuccess || claimsResult.Data == null)
            {
                return ServiceResult<UserInfoResponse>.Failure("Failed to get user claims", ErrorCodes.Authentication.UserNotFound);
            }

            var userInfo = new UserInfoResponse
            {
                Id = claimsResult.Data.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "",
                Username = claimsResult.Data.FindFirst(ClaimTypes.Name)?.Value ?? "",
                Email = claimsResult.Data.FindFirst(ClaimTypes.Email)?.Value ?? "",
                Role = claimsResult.Data.FindFirst(ClaimTypes.Role)?.Value ?? "",
                Permissions = GetUserPermissions(claimsResult.Data)
            };

            return ServiceResult<UserInfoResponse>.Success(userInfo);
        }
        catch (Exception ex)
        {
            _logger.LogError(LogTemplates.Identity.GetUserClaimsError, username, ex.Message);
            return ServiceResult<UserInfoResponse>.Failure("An error occurred while getting user info", ErrorCodes.System.InternalError);
        }
    }

    private List<string> GetUserPermissions(ClaimsPrincipal claimsPrincipal)
    {
        var permissions = new List<string>();
        var role = claimsPrincipal.FindFirst(ClaimTypes.Role)?.Value;

        if (!string.IsNullOrEmpty(role))
        {
            // Add role-based permissions
            permissions.Add($"role:{role.ToLower()}");

            // Add specific permissions based on role
            switch (role.ToLower())
            {
                case "admin":
                    permissions.AddRange(new[] { "users:read", "users:write", "users:delete", "files:read", "files:write", "files:delete" });
                    break;
                case "user":
                    permissions.AddRange(new[] { "files:read", "files:write" });
                    break;
            }
        }

        return permissions;
    }

    #endregion
}

// 新增简化的用户信息类
public class CachedUserInfo
{
    public string UserId { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}