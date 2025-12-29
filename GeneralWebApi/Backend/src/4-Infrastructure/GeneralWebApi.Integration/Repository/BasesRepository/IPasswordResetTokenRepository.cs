using GeneralWebApi.Domain.Entities;

namespace GeneralWebApi.Integration.Repository.BasesRepository;

/// <summary>
/// Repository interface for PasswordResetToken operations
/// </summary>
public interface IPasswordResetTokenRepository
{
    /// <summary>
    /// Store a new password reset token in the database
    /// </summary>
    Task AddAsync(PasswordResetToken token);

    /// <summary>
    /// Get a password reset token by its value
    /// </summary>
    Task<PasswordResetToken?> GetByTokenAsync(string token);

    /// <summary>
    /// Get all password reset tokens for a specific user
    /// </summary>
    Task<List<PasswordResetToken>> GetByUserIdAsync(int userId);

    /// <summary>
    /// Get all password reset tokens for a specific email
    /// </summary>
    Task<List<PasswordResetToken>> GetByEmailAsync(string email);

    /// <summary>
    /// Update a password reset token
    /// </summary>
    Task UpdateAsync(PasswordResetToken token);

    /// <summary>
    /// Delete a password reset token
    /// </summary>
    Task DeleteAsync(PasswordResetToken token);

    /// <summary>
    /// Delete a password reset token by its value
    /// </summary>
    Task DeleteByTokenAsync(string token);

    /// <summary>
    /// Delete all password reset tokens for a specific user
    /// </summary>
    Task DeleteByUserIdAsync(int userId);

    /// <summary>
    /// Delete expired password reset tokens
    /// </summary>
    Task<int> DeleteExpiredTokensAsync();

    /// <summary>
    /// Mark a token as used
    /// </summary>
    Task<bool> MarkAsUsedAsync(string token);

    /// <summary>
    /// Check if a password reset token exists and is valid
    /// </summary>
    Task<bool> IsTokenValidAsync(string token);
}

