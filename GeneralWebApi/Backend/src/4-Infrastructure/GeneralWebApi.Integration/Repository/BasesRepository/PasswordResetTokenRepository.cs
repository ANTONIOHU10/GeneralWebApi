using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Integration.Context;
using Microsoft.EntityFrameworkCore;

namespace GeneralWebApi.Integration.Repository.BasesRepository;

/// <summary>
/// Repository implementation for PasswordResetToken operations
/// </summary>
public class PasswordResetTokenRepository : IPasswordResetTokenRepository
{
    private readonly ApplicationDbContext _context;

    public PasswordResetTokenRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Store a new password reset token in the database
    /// </summary>
    public async Task AddAsync(PasswordResetToken token)
    {
        _context.PasswordResetTokens.Add(token);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Get a password reset token by its value
    /// </summary>
    public async Task<PasswordResetToken?> GetByTokenAsync(string token)
    {
        return await _context.PasswordResetTokens
            .FirstOrDefaultAsync(prt => prt.Token == token && !prt.IsUsed);
    }

    /// <summary>
    /// Get all password reset tokens for a specific user
    /// </summary>
    public async Task<List<PasswordResetToken>> GetByUserIdAsync(int userId)
    {
        return await _context.PasswordResetTokens
            .Where(prt => prt.UserId == userId)
            .OrderByDescending(prt => prt.CreatedAt)
            .ToListAsync();
    }

    /// <summary>
    /// Get all password reset tokens for a specific email
    /// </summary>
    public async Task<List<PasswordResetToken>> GetByEmailAsync(string email)
    {
        return await _context.PasswordResetTokens
            .Where(prt => prt.Email == email)
            .OrderByDescending(prt => prt.CreatedAt)
            .ToListAsync();
    }

    /// <summary>
    /// Update a password reset token
    /// </summary>
    public async Task UpdateAsync(PasswordResetToken token)
    {
        _context.PasswordResetTokens.Update(token);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Delete a password reset token
    /// </summary>
    public async Task DeleteAsync(PasswordResetToken token)
    {
        _context.PasswordResetTokens.Remove(token);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Delete a password reset token by its value
    /// </summary>
    public async Task DeleteByTokenAsync(string token)
    {
        var resetToken = await GetByTokenAsync(token);
        if (resetToken != null)
        {
            await DeleteAsync(resetToken);
        }
    }

    /// <summary>
    /// Delete all password reset tokens for a specific user
    /// </summary>
    public async Task DeleteByUserIdAsync(int userId)
    {
        var tokens = await _context.PasswordResetTokens
            .Where(prt => prt.UserId == userId)
            .ToListAsync();

        _context.PasswordResetTokens.RemoveRange(tokens);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Delete expired password reset tokens
    /// </summary>
    public async Task<int> DeleteExpiredTokensAsync()
    {
        var expiredTokens = await _context.PasswordResetTokens
            .Where(prt => prt.ExpiresAt < DateTime.UtcNow || prt.IsUsed)
            .ToListAsync();

        _context.PasswordResetTokens.RemoveRange(expiredTokens);
        await _context.SaveChangesAsync();
        return expiredTokens.Count;
    }

    /// <summary>
    /// Mark a token as used
    /// </summary>
    public async Task<bool> MarkAsUsedAsync(string token)
    {
        var resetToken = await GetByTokenAsync(token);
        if (resetToken != null && !resetToken.IsUsed)
        {
            resetToken.IsUsed = true;
            resetToken.UsedAt = DateTime.UtcNow;
            await UpdateAsync(resetToken);
            return true;
        }
        return false;
    }

    /// <summary>
    /// Check if a password reset token exists and is valid
    /// </summary>
    public async Task<bool> IsTokenValidAsync(string token)
    {
        var resetToken = await _context.PasswordResetTokens
            .FirstOrDefaultAsync(prt => prt.Token == token &&
                                     !prt.IsUsed &&
                                     prt.ExpiresAt > DateTime.UtcNow);

        return resetToken != null;
    }
}

