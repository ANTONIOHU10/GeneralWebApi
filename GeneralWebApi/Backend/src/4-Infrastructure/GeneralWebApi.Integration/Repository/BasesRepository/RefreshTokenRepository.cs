using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Integration.Context;
using Microsoft.EntityFrameworkCore;

namespace GeneralWebApi.Integration.Repository.BasesRepository;

/// <summary>
/// Repository implementation for RefreshToken operations
/// Provides database fallback for refresh token management
/// </summary>
public class RefreshTokenRepository : IRefreshTokenRepository
{
    private readonly ApplicationDbContext _context;

    public RefreshTokenRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Store a new refresh token in the database
    /// </summary>
    public async Task AddAsync(RefreshToken refreshToken)
    {
        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Get a refresh token by its value
    /// </summary>
    public async Task<RefreshToken?> GetByTokenAsync(string token)
    {
        return await _context.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Token == token && !rt.IsRevoked);
    }

    /// <summary>
    /// Get all refresh tokens for a specific user
    /// </summary>
    public async Task<List<RefreshToken>> GetByUserIdAsync(int userId)
    {
        return await _context.RefreshTokens
            .Where(rt => rt.UserId == userId && !rt.IsRevoked)
            .OrderByDescending(rt => rt.CreatedAt)
            .ToListAsync();
    }

    /// <summary>
    /// Get all refresh tokens for a specific username
    /// </summary>
    public async Task<List<RefreshToken>> GetByUsernameAsync(string username)
    {
        return await _context.RefreshTokens
            .Where(rt => rt.Username == username && !rt.IsRevoked)
            .OrderByDescending(rt => rt.CreatedAt)
            .ToListAsync();
    }

    /// <summary>
    /// Update a refresh token
    /// </summary>
    public async Task UpdateAsync(RefreshToken refreshToken)
    {
        _context.RefreshTokens.Update(refreshToken);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Delete a refresh token
    /// </summary>
    public async Task DeleteAsync(RefreshToken refreshToken)
    {
        _context.RefreshTokens.Remove(refreshToken);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Delete a refresh token by its value
    /// </summary>
    public async Task DeleteByTokenAsync(string token)
    {
        var refreshToken = await GetByTokenAsync(token);
        if (refreshToken != null)
        {
            await DeleteAsync(refreshToken);
        }
    }

    /// <summary>
    /// Delete all refresh tokens for a specific user
    /// </summary>
    public async Task DeleteByUserIdAsync(int userId)
    {
        var tokens = await _context.RefreshTokens
            .Where(rt => rt.UserId == userId)
            .ToListAsync();

        _context.RefreshTokens.RemoveRange(tokens);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Delete all refresh tokens for a specific username
    /// </summary>
    public async Task DeleteByUsernameAsync(string username)
    {
        var tokens = await _context.RefreshTokens
            .Where(rt => rt.Username == username)
            .ToListAsync();

        _context.RefreshTokens.RemoveRange(tokens);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Delete expired refresh tokens
    /// </summary>
    public async Task<int> DeleteExpiredTokensAsync()
    {
        var expiredTokens = await _context.RefreshTokens
            .Where(rt => rt.ExpiresAt < DateTime.UtcNow)
            .ToListAsync();

        _context.RefreshTokens.RemoveRange(expiredTokens);
        await _context.SaveChangesAsync();
        return expiredTokens.Count;
    }

    /// <summary>
    /// Revoke a refresh token
    /// </summary>
    public async Task<bool> RevokeTokenAsync(string token)
    {
        var refreshToken = await GetByTokenAsync(token);
        if (refreshToken != null)
        {
            refreshToken.IsRevoked = true;
            await UpdateAsync(refreshToken);
            return true;
        }
        return false;
    }

    /// <summary>
    /// Revoke all refresh tokens for a specific user
    /// </summary>
    public async Task<int> RevokeUserTokensAsync(int userId)
    {
        var tokens = await _context.RefreshTokens
            .Where(rt => rt.UserId == userId && !rt.IsRevoked)
            .ToListAsync();

        foreach (var token in tokens)
        {
            token.IsRevoked = true;
        }

        if (tokens.Any())
        {
            _context.RefreshTokens.UpdateRange(tokens);
            await _context.SaveChangesAsync();
        }

        return tokens.Count;
    }

    /// <summary>
    /// Check if a refresh token exists and is valid
    /// </summary>
    public async Task<bool> IsTokenValidAsync(string token)
    {
        var refreshToken = await _context.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Token == token &&
                                     !rt.IsRevoked &&
                                     rt.ExpiresAt > DateTime.UtcNow);

        return refreshToken != null;
    }
}
