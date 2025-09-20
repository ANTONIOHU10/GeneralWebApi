using GeneralWebApi.Domain.Entities;

namespace GeneralWebApi.Integration.Repository.BasesRepository;

/// <summary>
/// Repository interface for UserSession operations
/// Provides database fallback for session management
/// </summary>
public interface IUserSessionRepository
{
    /// <summary>
    /// Create a new user session
    /// </summary>
    /// <param name="userSession">The user session entity to create</param>
    /// <returns>Task representing the async operation</returns>
    Task AddAsync(UserSession userSession);

    /// <summary>
    /// Get a user session by access token
    /// </summary>
    /// <param name="accessToken">The access token</param>
    /// <returns>The user session entity or null if not found</returns>
    Task<UserSession?> GetByAccessTokenAsync(string accessToken);

    /// <summary>
    /// Get a user session by refresh token
    /// </summary>
    /// <param name="refreshToken">The refresh token</param>
    /// <returns>The user session entity or null if not found</returns>
    Task<UserSession?> GetByRefreshTokenAsync(string refreshToken);

    /// <summary>
    /// Get all active sessions for a specific user
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <returns>List of active user sessions</returns>
    Task<List<UserSession>> GetActiveSessionsByUserIdAsync(int userId);

    /// <summary>
    /// Get all active sessions for a specific username
    /// </summary>
    /// <param name="username">The username</param>
    /// <returns>List of active user sessions</returns>
    Task<List<UserSession>> GetActiveSessionsByUsernameAsync(string username);

    /// <summary>
    /// Update a user session
    /// </summary>
    /// <param name="userSession">The user session entity to update</param>
    /// <returns>Task representing the async operation</returns>
    Task UpdateAsync(UserSession userSession);

    /// <summary>
    /// End a user session
    /// </summary>
    /// <param name="sessionId">The session ID</param>
    /// <param name="endReason">Reason for ending the session</param>
    /// <returns>True if the session was found and ended, false otherwise</returns>
    Task<bool> EndSessionAsync(Guid sessionId, string endReason = "Manual logout");

    /// <summary>
    /// End a user session by access token
    /// </summary>
    /// <param name="accessToken">The access token</param>
    /// <param name="endReason">Reason for ending the session</param>
    /// <returns>True if the session was found and ended, false otherwise</returns>
    Task<bool> EndSessionByAccessTokenAsync(string accessToken, string endReason = "Manual logout");

    /// <summary>
    /// End a user session by refresh token
    /// </summary>
    /// <param name="refreshToken">The refresh token</param>
    /// <param name="endReason">Reason for ending the session</param>
    /// <returns>True if the session was found and ended, false otherwise</returns>
    Task<bool> EndSessionByRefreshTokenAsync(string refreshToken, string endReason = "Manual logout");

    /// <summary>
    /// End all sessions for a specific user
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <param name="endReason">Reason for ending the sessions</param>
    /// <returns>Number of sessions ended</returns>
    Task<int> EndAllUserSessionsAsync(int userId, string endReason = "User logout");

    /// <summary>
    /// End all sessions for a specific username
    /// </summary>
    /// <param name="username">The username</param>
    /// <param name="endReason">Reason for ending the sessions</param>
    /// <returns>Number of sessions ended</returns>
    Task<int> EndAllUserSessionsByUsernameAsync(string username, string endReason = "User logout");

    /// <summary>
    /// Clean up expired sessions
    /// </summary>
    /// <returns>Number of sessions cleaned up</returns>
    Task<int> CleanupExpiredSessionsAsync();

    /// <summary>
    /// Update last accessed time for a session
    /// </summary>
    /// <param name="sessionId">The session ID</param>
    /// <returns>True if the session was found and updated, false otherwise</returns>
    Task<bool> UpdateLastAccessedAsync(Guid sessionId);

    /// <summary>
    /// Check if a session is valid and active
    /// </summary>
    /// <param name="accessToken">The access token</param>
    /// <returns>True if the session is valid and active, false otherwise</returns>
    Task<bool> IsSessionValidAsync(string accessToken);

    /// <summary>
    /// Get session count for a specific user
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <returns>Number of active sessions</returns>
    Task<int> GetActiveSessionCountAsync(int userId);
}
