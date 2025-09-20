using GeneralWebApi.Domain.Entities;

namespace GeneralWebApi.Integration.Repository.BasesRepository;

/// <summary>
/// Repository interface for RefreshToken operations
/// Provides database fallback for refresh token management
/// </summary>
public interface IRefreshTokenRepository
{
    /// <summary>
    /// Store a new refresh token in the database
    /// </summary>
    /// <param name="refreshToken">The refresh token entity to store</param>
    /// <returns>Task representing the async operation</returns>
    Task AddAsync(RefreshToken refreshToken);

    /// <summary>
    /// Get a refresh token by its value
    /// </summary>
    /// <param name="token">The refresh token value</param>
    /// <returns>The refresh token entity or null if not found</returns>
    Task<RefreshToken?> GetByTokenAsync(string token);

    /// <summary>
    /// Get all refresh tokens for a specific user
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <returns>List of refresh tokens for the user</returns>
    Task<List<RefreshToken>> GetByUserIdAsync(int userId);

    /// <summary>
    /// Get all refresh tokens for a specific username
    /// </summary>
    /// <param name="username">The username</param>
    /// <returns>List of refresh tokens for the user</returns>
    Task<List<RefreshToken>> GetByUsernameAsync(string username);

    /// <summary>
    /// Update a refresh token
    /// </summary>
    /// <param name="refreshToken">The refresh token entity to update</param>
    /// <returns>Task representing the async operation</returns>
    Task UpdateAsync(RefreshToken refreshToken);

    /// <summary>
    /// Delete a refresh token
    /// </summary>
    /// <param name="refreshToken">The refresh token entity to delete</param>
    /// <returns>Task representing the async operation</returns>
    Task DeleteAsync(RefreshToken refreshToken);

    /// <summary>
    /// Delete a refresh token by its value
    /// </summary>
    /// <param name="token">The refresh token value</param>
    /// <returns>Task representing the async operation</returns>
    Task DeleteByTokenAsync(string token);

    /// <summary>
    /// Delete all refresh tokens for a specific user
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <returns>Task representing the async operation</returns>
    Task DeleteByUserIdAsync(int userId);

    /// <summary>
    /// Delete all refresh tokens for a specific username
    /// </summary>
    /// <param name="username">The username</param>
    /// <returns>Task representing the async operation</returns>
    Task DeleteByUsernameAsync(string username);

    /// <summary>
    /// Delete expired refresh tokens
    /// </summary>
    /// <returns>Number of tokens deleted</returns>
    Task<int> DeleteExpiredTokensAsync();

    /// <summary>
    /// Revoke a refresh token
    /// </summary>
    /// <param name="token">The refresh token value to revoke</param>
    /// <returns>True if the token was found and revoked, false otherwise</returns>
    Task<bool> RevokeTokenAsync(string token);

    /// <summary>
    /// Revoke all refresh tokens for a specific user
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <returns>Number of tokens revoked</returns>
    Task<int> RevokeUserTokensAsync(int userId);

    /// <summary>
    /// Check if a refresh token exists and is valid
    /// </summary>
    /// <param name="token">The refresh token value</param>
    /// <returns>True if the token exists and is valid, false otherwise</returns>
    Task<bool> IsTokenValidAsync(string token);
}
