using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Integration.Context;
using Microsoft.EntityFrameworkCore;

namespace GeneralWebApi.Integration.Repository;

public class UserRepository : IUserRepository
{
    private readonly ApplicationDbContext _dbContext;

    public UserRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }
    public async Task<User> AddAsync(User entity, CancellationToken cancellationToken = default)
    {
        await _dbContext.Users.AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<IEnumerable<User>> AddRangeAsync(IEnumerable<User> entities, CancellationToken cancellationToken = default)
    {
        await _dbContext.Users.AddRangeAsync(entities, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entities;
    }

    public async Task<User> DeleteAsync(object id, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users.FindAsync(id, cancellationToken);
        if (user == null)
        {
            throw new Exception("User not found");
        }
        _dbContext.Users.Remove(user);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return user;
    }

    public async Task<IEnumerable<User>> DeleteRangeAsync(IEnumerable<User> entities, CancellationToken cancellationToken = default)
    {
        _dbContext.Users.RemoveRange(entities);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entities;
    }

    public async Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Users.AnyAsync(u => u.Email == email, cancellationToken);
    }

    public async Task<IEnumerable<User>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Users.ToListAsync(cancellationToken);
    }

    public async Task<User> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
        if (user == null)
        {
            throw new Exception("User not found");
        }
        return user;
    }

    public async Task<User> GetByIdAsync(object id, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.Users.FindAsync(id, cancellationToken);
        if (user == null)
        {
            throw new Exception("User not found");
        }
        return user;
    }

    public async Task<User> UpdateAsync(User entity, CancellationToken cancellationToken = default)
    {
        _dbContext.Users.Update(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<IEnumerable<User>> UpdateRangeAsync(IEnumerable<User> entities, CancellationToken cancellationToken = default)
    {
        _dbContext.Users.UpdateRange(entities);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entities;
    }
}
