using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Integration.Context;
using Microsoft.EntityFrameworkCore;

namespace GeneralWebApi.Integration.Repository.BasesRepository;

/// <summary>
/// Repository implementation for UserSession operations
/// Provides database fallback for session management
/// </summary>
public class UserSessionRepository : IUserSessionRepository
{
    private readonly ApplicationDbContext _context;

    public UserSessionRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Create a new user session
    /// </summary>
    public async Task AddAsync(UserSession userSession)
    {
        _context.UserSessions.Add(userSession);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Get a user session by access token
    /// </summary>
    public async Task<UserSession?> GetByAccessTokenAsync(string accessToken)
    {
        return await _context.UserSessions
            .FirstOrDefaultAsync(us => us.AccessToken == accessToken &&
                                     us.IsActive &&
                                     us.ExpiresAt > DateTime.UtcNow);
    }

    /// <summary>
    /// Get a user session by refresh token
    /// </summary>
    public async Task<UserSession?> GetByRefreshTokenAsync(string refreshToken)
    {
        return await _context.UserSessions
            .FirstOrDefaultAsync(us => us.RefreshToken == refreshToken &&
                                     us.IsActive &&
                                     us.ExpiresAt > DateTime.UtcNow);
    }

    /// <summary>
    /// Get all active sessions for a specific user
    /// </summary>
    public async Task<List<UserSession>> GetActiveSessionsByUserIdAsync(int userId)
    {
        return await _context.UserSessions
            .Where(us => us.UserId == userId &&
                        us.IsActive &&
                        us.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(us => us.LastAccessedAt)
            .ToListAsync();
    }

    /// <summary>
    /// Get all active sessions for a specific username
    /// </summary>
    public async Task<List<UserSession>> GetActiveSessionsByUsernameAsync(string username)
    {
        return await _context.UserSessions
            .Where(us => us.Username == username &&
                        us.IsActive &&
                        us.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(us => us.LastAccessedAt)
            .ToListAsync();
    }

    /// <summary>
    /// Update a user session
    /// </summary>
    public async Task UpdateAsync(UserSession userSession)
    {
        _context.UserSessions.Update(userSession);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// End a user session
    /// </summary>
    public async Task<bool> EndSessionAsync(Guid sessionId, string endReason = "Manual logout")
    {
        var session = await _context.UserSessions
            .FirstOrDefaultAsync(us => us.Id == sessionId && us.IsActive);

        if (session != null)
        {
            session.IsActive = false;
            session.EndedAt = DateTime.UtcNow;
            session.EndReason = endReason;
            await UpdateAsync(session);
            return true;
        }

        return false;
    }

    /// <summary>
    /// End a user session by access token
    /// </summary>
    public async Task<bool> EndSessionByAccessTokenAsync(string accessToken, string endReason = "Manual logout")
    {
        var session = await GetByAccessTokenAsync(accessToken);
        if (session != null)
        {
            return await EndSessionAsync(session.Id, endReason);
        }
        return false;
    }

    /// <summary>
    /// End a user session by refresh token
    /// </summary>
    public async Task<bool> EndSessionByRefreshTokenAsync(string refreshToken, string endReason = "Manual logout")
    {
        var session = await GetByRefreshTokenAsync(refreshToken);
        if (session != null)
        {
            return await EndSessionAsync(session.Id, endReason);
        }
        return false;
    }

    /// <summary>
    /// End all sessions for a specific user
    /// </summary>
    public async Task<int> EndAllUserSessionsAsync(int userId, string endReason = "User logout")
    {
        var sessions = await _context.UserSessions
            .Where(us => us.UserId == userId && us.IsActive)
            .ToListAsync();

        foreach (var session in sessions)
        {
            session.IsActive = false;
            session.EndedAt = DateTime.UtcNow;
            session.EndReason = endReason;
        }

        if (sessions.Any())
        {
            _context.UserSessions.UpdateRange(sessions);
            await _context.SaveChangesAsync();
        }

        return sessions.Count;
    }

    /// <summary>
    /// End all sessions for a specific username
    /// </summary>
    public async Task<int> EndAllUserSessionsByUsernameAsync(string username, string endReason = "User logout")
    {
        var sessions = await _context.UserSessions
            .Where(us => us.Username == username && us.IsActive)
            .ToListAsync();

        foreach (var session in sessions)
        {
            session.IsActive = false;
            session.EndedAt = DateTime.UtcNow;
            session.EndReason = endReason;
        }

        if (sessions.Any())
        {
            _context.UserSessions.UpdateRange(sessions);
            await _context.SaveChangesAsync();
        }

        return sessions.Count;
    }

    /// <summary>
    /// Clean up expired sessions
    /// </summary>
    public async Task<int> CleanupExpiredSessionsAsync()
    {
        var expiredSessions = await _context.UserSessions
            .Where(us => us.ExpiresAt < DateTime.UtcNow && us.IsActive)
            .ToListAsync();

        foreach (var session in expiredSessions)
        {
            session.IsActive = false;
            session.EndedAt = DateTime.UtcNow;
            session.EndReason = "Expired";
        }

        if (expiredSessions.Any())
        {
            _context.UserSessions.UpdateRange(expiredSessions);
            await _context.SaveChangesAsync();
        }

        return expiredSessions.Count;
    }

    /// <summary>
    /// Update last accessed time for a session
    /// </summary>
    public async Task<bool> UpdateLastAccessedAsync(Guid sessionId)
    {
        var session = await _context.UserSessions
            .FirstOrDefaultAsync(us => us.Id == sessionId && us.IsActive);

        if (session != null)
        {
            session.LastAccessedAt = DateTime.UtcNow;
            await UpdateAsync(session);
            return true;
        }

        return false;
    }

    /// <summary>
    /// Check if a session is valid and active
    /// </summary>
    public async Task<bool> IsSessionValidAsync(string accessToken)
    {
        var session = await GetByAccessTokenAsync(accessToken);
        return session != null;
    }

    /// <summary>
    /// Get session count for a specific user
    /// </summary>
    public async Task<int> GetActiveSessionCountAsync(int userId)
    {
        return await _context.UserSessions
            .CountAsync(us => us.UserId == userId &&
                            us.IsActive &&
                            us.ExpiresAt > DateTime.UtcNow);
    }
}
