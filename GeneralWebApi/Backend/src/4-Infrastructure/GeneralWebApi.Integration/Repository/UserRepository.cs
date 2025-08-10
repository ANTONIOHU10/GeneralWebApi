using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Integration.Context;
using GeneralWebApi.Integration.Repository.Base;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace GeneralWebApi.Integration.Repository;

public class UserRepository : BaseRepository<User>, IUserRepository
{
    public UserRepository(ApplicationDbContext context, ILogger<UserRepository> logger)
        : base(context, logger)
    {
    }

    #region User-specific business methods

    public async Task<User> ValidateUserAsync(string username, string password, CancellationToken cancellationToken = default)
    {
        try
        {
            var user = await _dbSet.FirstOrDefaultAsync(u => u.Name == username, cancellationToken);
            if (user == null)
            {
                _logger.LogWarning("User with username {Username} not found", username);
                throw new KeyNotFoundException($"User with username {username} not found");
            }

            return user;
        }
        catch (Exception ex) when (ex is not KeyNotFoundException)
        {
            _logger.LogError(ex, "Failed to validate user with username {Username}", username);
            throw;
        }
    }

    public async Task<User> RegisterUserAsync(User user, CancellationToken cancellationToken = default)
    {
        try
        {
            // Check if the user already exists
            if (await ExistsByEmailAsync(user.Email, cancellationToken))
            {
                _logger.LogWarning("User with email {Email} already exists", user.Email);
                throw new InvalidOperationException($"User with email {user.Email} already exists");
            }

            // Use base repository method for adding
            return await AddAsync(user, cancellationToken);
        }
        catch (Exception ex) when (ex is not InvalidOperationException)
        {
            _logger.LogError(ex, "Failed to register user with email {Email}", user.Email);
            throw;
        }
    }

    public async Task<User> UpdatePasswordAsync(User user, CancellationToken cancellationToken = default)
    {
        try
        {
            // Check if the user exists
            if (!await ExistsByEmailAsync(user.Email, cancellationToken))
            {
                _logger.LogWarning("User with email {Email} not found", user.Email);
                throw new KeyNotFoundException($"User with email {user.Email} not found");
            }

            // Use base repository method for updating
            return await UpdateAsync(user, cancellationToken);
        }
        catch (Exception ex) when (ex is not KeyNotFoundException)
        {
            _logger.LogError(ex, "Failed to update password for user with email {Email}", user.Email);
            throw;
        }
    }

    public async Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _dbSet.AnyAsync(u => u.Email == email, cancellationToken);
    }

    public async Task<bool> ExistsByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        return await _dbSet.AnyAsync(u => u.Name == name, cancellationToken);
    }

    public async Task<User> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        try
        {
            var user = await _dbSet.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
            if (user == null)
            {
                _logger.LogWarning("User with email {Email} not found", email);
                throw new KeyNotFoundException($"User with email {email} not found");
            }
            return user;
        }
        catch (Exception ex) when (ex is not KeyNotFoundException)
        {
            _logger.LogError(ex, "Failed to get user with email {Email}", email);
            throw;
        }
    }

    public async Task<User> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        try
        {
            var user = await _dbSet.FirstOrDefaultAsync(u => u.Name == name, cancellationToken);
            if (user == null)
            {
                _logger.LogWarning("User with name {Name} not found", name);
                throw new KeyNotFoundException($"User with name {name} not found");
            }
            return user;
        }
        catch (Exception ex) when (ex is not KeyNotFoundException)
        {
            _logger.LogError(ex, "Failed to get user with name {Name}", name);
            throw;
        }
    }

    #endregion

    #region Override base methods if needed

    // override GetActiveEntities to filter out deleted users
    protected override IQueryable<User> GetActiveEntities()
    {
        return base.GetActiveEntities().Where(u => u.IsActive);
    }

    // override GetAllAsync to only return active users
    public override async Task<IEnumerable<User>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await GetActiveEntities().ToListAsync(cancellationToken);
    }

    #endregion
}
