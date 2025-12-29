using System.Collections.Concurrent;
using System.Security.Claims;
using System.Security.Cryptography;
using GeneralWebApi.Caching.Services;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Domain.Enums;
using GeneralWebApi.Domain.Entities.Anagraphy;
using GeneralWebApi.Integration.Repository.BasesRepository;
using GeneralWebApi.Integration.Repository.AnagraphyRepository;
using GeneralWebApi.Logging.Services;
using GeneralWebApi.Logging.Templates;
using GeneralWebApi.Email.Services;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;

namespace GeneralWebApi.Identity.Services;

public class UserService : IUserService
{
    private readonly IJwtService _jwtService;
    private readonly ILoggingService _logger;

    private readonly IUserRepository _userRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IRedisCacheService _cacheService;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IPasswordResetTokenRepository _passwordResetTokenRepository;
    private readonly IEmailService? _emailService;

    // need to save the refresh token in static, because it's a random byte array
    // but access token is a decoded string, it contains all users' information to be validated
    // temporary refresh token storage - should use Redis or database in production
    // static to avoid multiple instances of the dictionary
    // TODO: use Redis or database in production
    private static readonly ConcurrentDictionary<string, (string UserId, DateTime Expiry)> _refreshTokens = new();

    // the registration of the UserService is in the ServiceCollectionExtensions.cs file
    public UserService(IJwtService jwtService, ILoggingService logger, IUserRepository userRepository, IEmployeeRepository employeeRepository, IRedisCacheService cacheService, IRefreshTokenRepository refreshTokenRepository, IPasswordResetTokenRepository passwordResetTokenRepository, IEmailService? emailService = null)
    {
        _jwtService = jwtService;
        _logger = logger;
        _userRepository = userRepository;
        _employeeRepository = employeeRepository;
        _cacheService = cacheService;
        _refreshTokenRepository = refreshTokenRepository;
        _passwordResetTokenRepository = passwordResetTokenRepository;
        _emailService = emailService;
    }

    public async Task<(bool Success, string? AccessToken, string? RefreshToken)> LoginAsync(string username, string password, bool rememberMe = false)
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

            // Store refresh token in both cache and database for redundancy
            // Use longer expiration for "Remember Me" (30 days) vs normal (7 days)
            await StoreRefreshTokenAsync(refreshToken, username, claims.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value ?? string.Empty, rememberMe);

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

            // Try to validate refresh token from cache first, then database
            var tokenInfo = await GetRefreshTokenInfoAsync(refreshToken);
            if (tokenInfo == null)
            {
                _logger.LogWarning(LogTemplates.Identity.InvalidRefreshToken);
                return (false, null, null);
            }

            var claims = await GetUserClaimsAsync(tokenInfo.Value.Username);
            if (claims == null)
            {
                return (false, null, null);
            }

            // Generate a new access token
            var accessToken = _jwtService.GenerateAccessToken(claims.Claims);
            _logger.LogInformation(LogTemplates.Identity.TokenRefreshSuccess, tokenInfo.Value.Username);

            // Generate a new refresh token
            var newRefreshToken = _jwtService.GenerateRefreshToken();

            // Store the new refresh token and remove the old one
            await ReplaceRefreshTokenAsync(refreshToken, newRefreshToken, tokenInfo.Value.Username, tokenInfo.Value.UserId);

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
            // Try to revoke refresh token from both cache and database
            var tokenInfo = await GetRefreshTokenInfoAsync(refreshToken);
            if (tokenInfo != null)
            {
                // Remove from cache if available
                if (_cacheService.IsCacheAvailable())
                {
                    try
                    {
                        await _cacheService.RemoveAsync($"refreshToken:{refreshToken}");
                    }
                    catch (Exception cacheEx)
                    {
                        _logger.LogWarning("Failed to remove refresh token from cache: {Error}", cacheEx.Message);
                    }
                }

                // Revoke from database
                await _refreshTokenRepository.RevokeTokenAsync(refreshToken);
                _logger.LogInformation(LogTemplates.Identity.UserLogout, tokenInfo.Value.Username);
                return true;
            }

            _logger.LogWarning("Refresh token not found for logout: {Token}", refreshToken);
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

            // Try to get cached user info first (only if cache is available)
            if (_cacheService.IsCacheAvailable())
            {
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
            }
            else
            {
                _logger.LogWarning("Cache is not available, falling back to database for user claims: {UserName}", userName);
            }

            // Get user from database (fallback when cache is unavailable or cache miss)
            _logger.LogInformation(LogTemplates.Identity.GetUserClaimsFromDatabase, userName);
            var user = await _userRepository.GetByNameAsync(userName);
            if (user == null)
            {
                _logger.LogWarning("User not found in database: {UserName}", userName);
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

            // Try to cache the user info (only if cache is available)
            if (_cacheService.IsCacheAvailable())
            {
                try
                {
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
                }
                catch (Exception cacheEx)
                {
                    _logger.LogWarning("Failed to cache user claims for {UserName}: {Error}", userName, cacheEx.Message);
                    // Continue without caching - this is not a critical failure
                }
            }

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

            // Check if email already exists in User table
            _logger.LogInformation(LogTemplates.Identity.CheckingEmailExists, email);
            var userEmailExists = await _userRepository.ExistsByEmailAsync(email);
            _logger.LogInformation(LogTemplates.Identity.EmailExistsResult, email, userEmailExists);

            // Check if email already exists in Employee table
            var employeeEmailExists = await _employeeRepository.ExistsByEmailAsync(email);
            _logger.LogInformation("Checking if email exists in Employee table: {Email}, Exists: {Exists}", email, employeeEmailExists);

            // Check if username already exists
            _logger.LogInformation(LogTemplates.Identity.CheckingUsernameExists, username);
            var usernameExists = await _userRepository.ExistsByNameAsync(username);
            _logger.LogInformation(LogTemplates.Identity.UsernameExistsResult, username, usernameExists);

            // Check if email exists in either User or Employee table
            var emailExists = userEmailExists || employeeEmailExists;

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

            // Generate unique employee number
            var employeeNumber = await GenerateUniqueEmployeeNumberAsync();

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

            // Save user to database
            await _userRepository.RegisterUserAsync(user);

            // Create basic Employee record
            var employee = new Employee
            {
                FirstName = username, // Use username as default first name
                LastName = "", // Can be updated later
                Email = email,
                EmployeeNumber = employeeNumber,
                HireDate = DateTime.UtcNow,
                EmploymentStatus = "Active",
                EmploymentType = "FullTime",
                CreatedBy = "System"
            };

            // Save Employee to database
            await _employeeRepository.AddAsync(employee);

            // Update User with EmployeeId
            user.EmployeeId = employee.Id;
            await _userRepository.UpdateAsync(user);

            // Log successful completion
            _logger.LogInformation(LogTemplates.Identity.UserCreationCompleted, username, user.Id);
            _logger.LogInformation(LogTemplates.Identity.UserRegistration, username);

            return (true, "User registered successfully with basic employee information");
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

    /// <summary>
    /// Generate unique employee number using fixed prefix + GUID
    /// </summary>
    private string GenerateEmployeeNumber()
    {
        // Use fixed prefix "EMP" + first 8 characters of GUID (uppercase)
        return $"EMP{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
    }

    /// <summary>
    /// Generate unique employee number with collision checking
    /// Using GUID-based generation, collisions are extremely unlikely but we keep the check as safety measure
    /// </summary>
    private async Task<string> GenerateUniqueEmployeeNumberAsync()
    {
        string employeeNumber;
        bool exists;
        int attempts = 0;
        const int maxAttempts = 5; // Reduced attempts since GUID collision is extremely rare

        do
        {
            employeeNumber = GenerateEmployeeNumber();
            exists = await _employeeRepository.ExistsByEmployeeNumberAsync(employeeNumber);
            attempts++;

            if (attempts >= maxAttempts)
            {
                throw new InvalidOperationException("Unable to generate unique employee number after maximum attempts");
            }

            // No delay needed with GUID-based generation
        } while (exists);

        return employeeNumber;
    }

    public async Task<UpdatePasswordResult> UpdatePasswordAsync(string username, string oldPassword, string newPassword)
    {
        try
        {
            // Validate old password first
            if (!await ValidateUserAsync(username, oldPassword))
            {
                _logger.LogWarning(LogTemplates.Identity.UserLoginFailed, username, "Old password is incorrect");
                return UpdatePasswordResult.CreateError(
                    "Old password incorrect",
                    "The current password you entered is incorrect. Please check and try again"
                );
            }

            var user = await _userRepository.GetByNameAsync(username);
            if (user == null)
            {
                _logger.LogWarning(LogTemplates.Identity.UserLoginFailed, username, "User not found");
                return UpdatePasswordResult.CreateError(
                    "User not found",
                    "The specified user could not be found"
                );
            }

            user.PasswordHash = GeneratePasswordHash(newPassword);
            // add the helper fields
            user.UpdatedBy = "User";
            user.UpdatedAt = DateTime.UtcNow;
            user.Version = user.Version + 1;

            await _userRepository.UpdatePasswordAsync(user);

            _logger.LogInformation(LogTemplates.Identity.PasswordUpdate, username);
            return UpdatePasswordResult.CreateSuccess();
        }
        catch (Exception ex)
        {
            _logger.LogError(LogTemplates.Identity.PasswordUpdateError, ex.Message);
            return UpdatePasswordResult.CreateError(
                "Password update failed",
                "Failed to update password. Please ensure your new password meets the requirements"
            );
        }
    }

    /// <summary>
    /// Store refresh token in both cache and database for redundancy
    /// </summary>
    private async Task StoreRefreshTokenAsync(string refreshToken, string username, string userId, bool rememberMe = false)
    {
        // Use longer expiration for "Remember Me" (30 days) vs normal (7 days)
        var expirationDays = rememberMe ? 30 : 7;
        var expiresAt = DateTime.UtcNow.AddDays(expirationDays);

        // Store in database
        var refreshTokenEntity = new RefreshToken
        {
            Id = Guid.NewGuid(),
            Token = refreshToken,
            UserId = int.Parse(userId),
            Username = username,
            ExpiresAt = expiresAt,
            CreatedAt = DateTime.UtcNow,
            LastUsedAt = DateTime.UtcNow
        };

        await _refreshTokenRepository.AddAsync(refreshTokenEntity);

        // Store in cache if available
        if (_cacheService.IsCacheAvailable())
        {
            try
            {
                await _cacheService.SetAsync($"refreshToken:{refreshToken}", username, TimeSpan.FromDays(expirationDays));
            }
            catch (Exception cacheEx)
            {
                _logger.LogWarning("Failed to store refresh token in cache: {Error}", cacheEx.Message);
            }
        }
    }

    /// <summary>
    /// Get refresh token information from cache or database
    /// </summary>
    private async Task<(string Username, string UserId)?> GetRefreshTokenInfoAsync(string refreshToken)
    {
        // Try cache first if available
        if (_cacheService.IsCacheAvailable())
        {
            try
            {
                var username = await _cacheService.GetAsync<string>($"refreshToken:{refreshToken}");
                if (!string.IsNullOrEmpty(username))
                {
                    // Get user ID from database
                    var user = await _userRepository.GetByNameAsync(username);
                    if (user != null)
                    {
                        return (username, user.Id.ToString());
                    }
                }
            }
            catch (Exception cacheEx)
            {
                _logger.LogWarning("Failed to get refresh token from cache: {Error}", cacheEx.Message);
            }
        }

        // Fallback to database
        var tokenEntity = await _refreshTokenRepository.GetByTokenAsync(refreshToken);
        if (tokenEntity != null && tokenEntity.ExpiresAt > DateTime.UtcNow && !tokenEntity.IsRevoked)
        {
            // Update last used time
            tokenEntity.LastUsedAt = DateTime.UtcNow;
            await _refreshTokenRepository.UpdateAsync(tokenEntity);

            return (tokenEntity.Username, tokenEntity.UserId.ToString());
        }

        return null;
    }

    /// <summary>
    /// Replace old refresh token with new one in both cache and database
    /// </summary>
    private async Task ReplaceRefreshTokenAsync(string oldToken, string newToken, string username, string userId)
    {
        var expiresAt = DateTime.UtcNow.AddDays(7);

        // Update database
        var oldTokenEntity = await _refreshTokenRepository.GetByTokenAsync(oldToken);
        if (oldTokenEntity != null)
        {
            // Revoke old token
            await _refreshTokenRepository.RevokeTokenAsync(oldToken);

            // Add new token
            var newTokenEntity = new RefreshToken
            {
                Id = Guid.NewGuid(),
                Token = newToken,
                UserId = int.Parse(userId),
                Username = username,
                ExpiresAt = expiresAt,
                CreatedAt = DateTime.UtcNow,
                LastUsedAt = DateTime.UtcNow
            };

            await _refreshTokenRepository.AddAsync(newTokenEntity);
        }

        // Update cache if available
        if (_cacheService.IsCacheAvailable())
        {
            try
            {
                // Remove old token from cache
                await _cacheService.RemoveAsync($"refreshToken:{oldToken}");
                // Add new token to cache
                await _cacheService.SetAsync($"refreshToken:{newToken}", username, TimeSpan.FromDays(7));
            }
            catch (Exception cacheEx)
            {
                _logger.LogWarning("Failed to update refresh token in cache: {Error}", cacheEx.Message);
            }
        }
    }

    /// <summary>
    /// Generate a password reset token and send reset email
    /// </summary>
    public async Task<(bool Success, string Message)> ForgotPasswordAsync(string email, string? requestedFromIp = null, string? requestedFromUserAgent = null)
    {
        try
        {
            _logger.LogInformation("Password reset requested for email: {Email}", email);

            // Find user by email
            var user = await _userRepository.GetByEmailAsync(email);
            
            // Always return success message to prevent user enumeration
            // Don't reveal whether the email exists or not
            if (user == null)
            {
                _logger.LogWarning("Password reset requested for non-existent email: {Email}", email);
                // Return success message even if user doesn't exist (security best practice)
                return (true, "If the email exists, a password reset link has been sent.");
            }

            // Generate secure reset token
            var tokenBytes = RandomNumberGenerator.GetBytes(32);
            var token = Convert.ToBase64String(tokenBytes)
                .Replace("+", "-")
                .Replace("/", "_")
                .Replace("=", "");

            // Hash the token before storing (security best practice)
            var tokenHash = Convert.ToBase64String(SHA256.HashData(tokenBytes));

            // Create password reset token entity
            var resetToken = new PasswordResetToken
            {
                Id = Guid.NewGuid(),
                Token = tokenHash, // Store hashed token
                UserId = user.Id,
                Email = user.Email,
                ExpiresAt = DateTime.UtcNow.AddMinutes(30), // Token expires in 30 minutes
                CreatedAt = DateTime.UtcNow,
                IsUsed = false,
                RequestedFromIp = requestedFromIp,
                RequestedFromUserAgent = requestedFromUserAgent
            };

            // Save token to database
            await _passwordResetTokenRepository.AddAsync(resetToken);

            // Send email with reset link
            if (_emailService != null)
            {
                var emailSent = await _emailService.SendPasswordResetEmailAsync(user.Email, user.Name, token);
                if (emailSent)
                {
                    _logger.LogInformation("Password reset email sent successfully to: {Email}", email);
                }
                else
                {
                    _logger.LogWarning("Failed to send password reset email to: {Email}, but token was saved. Token: {Token}", email, token);
                }
            }
            else
            {
                // Fallback: log the token if email service is not available (for development)
                _logger.LogInformation("Email service not available. Password reset token generated for user: {Username}, Token: {Token}", user.Name, token);
            }

            return (true, "If the email exists, a password reset link has been sent.");
        }
        catch (Exception ex)
        {
            _logger.LogError("Error processing password reset request for email: {Email}, Error: {Error}", email, ex.Message);
            // Still return success to prevent user enumeration
            return (true, "If the email exists, a password reset link has been sent.");
        }
    }

    /// <summary>
    /// Reset password using a valid reset token
    /// </summary>
    public async Task<(bool Success, string? ErrorMessage)> ResetPasswordAsync(string token, string newPassword)
    {
        try
        {
            _logger.LogInformation("Password reset attempt with token");

            // Convert URL-safe token back to base64
            var base64Token = token.Replace("-", "+").Replace("_", "/");
            var padding = 4 - (base64Token.Length % 4);
            if (padding != 4) base64Token += new string('=', padding);
            
            var tokenBytes = Convert.FromBase64String(base64Token);
            var tokenHash = Convert.ToBase64String(SHA256.HashData(tokenBytes));

            // Find token in database
            var resetToken = await _passwordResetTokenRepository.GetByTokenAsync(tokenHash);

            if (resetToken == null)
            {
                _logger.LogWarning("Invalid password reset token");
                return (false, "Invalid or expired reset token.");
            }

            // Check if token is expired
            if (resetToken.ExpiresAt < DateTime.UtcNow)
            {
                _logger.LogWarning("Expired password reset token for user: {UserId}", resetToken.UserId);
                return (false, "Reset token has expired. Please request a new one.");
            }

            // Check if token is already used
            if (resetToken.IsUsed)
            {
                _logger.LogWarning("Already used password reset token for user: {UserId}", resetToken.UserId);
                return (false, "Reset token has already been used. Please request a new one.");
            }

            // Get user
            var user = await _userRepository.GetByIdAsync(resetToken.UserId);
            if (user == null)
            {
                _logger.LogWarning("User not found for password reset token: {UserId}", resetToken.UserId);
                return (false, "User not found.");
            }

            // Validate new password (add your password requirements here)
            if (string.IsNullOrWhiteSpace(newPassword) || newPassword.Length < 6)
            {
                return (false, "Password must be at least 6 characters long.");
            }

            // Generate new password hash
            var passwordHash = GeneratePasswordHash(newPassword);

            // Update user password
            user.PasswordHash = passwordHash;
            user.UpdatedBy = "System";
            user.UpdatedAt = DateTime.UtcNow;
            user.Version = user.Version + 1;

            await _userRepository.UpdatePasswordAsync(user);

            // Mark token as used
            await _passwordResetTokenRepository.MarkAsUsedAsync(tokenHash);

            // Revoke all refresh tokens for security
            await _refreshTokenRepository.RevokeUserTokensAsync(user.Id);

            _logger.LogInformation("Password reset successful for user: {Username}", user.Name);
            return (true, null);
        }
        catch (Exception ex)
        {
            _logger.LogError("Error resetting password: {Error}", ex.Message);
            return (false, "An error occurred while resetting your password. Please try again.");
        }
    }

    /// <summary>
    /// Verify if a reset token is valid
    /// </summary>
    public async Task<(bool IsValid, string? Email)> VerifyResetTokenAsync(string token)
    {
        try
        {
            // Convert URL-safe token back to base64
            var base64Token = token.Replace("-", "+").Replace("_", "/");
            var padding = 4 - (base64Token.Length % 4);
            if (padding != 4) base64Token += new string('=', padding);
            
            var tokenBytes = Convert.FromBase64String(base64Token);
            var tokenHash = Convert.ToBase64String(SHA256.HashData(tokenBytes));

            // Check if token is valid
            var isValid = await _passwordResetTokenRepository.IsTokenValidAsync(tokenHash);

            if (!isValid)
            {
                return (false, null);
            }

            // Get token to retrieve email
            var resetToken = await _passwordResetTokenRepository.GetByTokenAsync(tokenHash);
            return (true, resetToken?.Email);
        }
        catch
        {
            return (false, null);
        }
    }
}

// 新增简化的用户信息类
public class CachedUserInfo
{
    public string UserId { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}