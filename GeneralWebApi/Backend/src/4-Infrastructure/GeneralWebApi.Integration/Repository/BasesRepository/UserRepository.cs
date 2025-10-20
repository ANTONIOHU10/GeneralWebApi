using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Integration.Context;
using GeneralWebApi.Integration.Repository.Base;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using GeneralWebApi.Logging.Templates;
using GeneralWebApi.DTOs.Users;

namespace GeneralWebApi.Integration.Repository.BasesRepository;

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
                _logger.LogWarning(LogTemplates.Repository.UserNotFound, username);
                throw new KeyNotFoundException($"User with username {username} not found");
            }

            return user;
        }
        catch (Exception ex) when (ex is not KeyNotFoundException)
        {
            _logger.LogError(ex, LogTemplates.Repository.UserValidationFailed, username);
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
                _logger.LogWarning(LogTemplates.Repository.UserEmailExists, user.Email);
                throw new InvalidOperationException($"User with email {user.Email} already exists");
            }

            // Use base repository method for adding
            return await AddAsync(user, cancellationToken);
        }
        catch (Exception ex) when (ex is not InvalidOperationException)
        {
            _logger.LogError(ex, LogTemplates.Repository.UserRegistrationFailed, user.Email);
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
                _logger.LogWarning(LogTemplates.Repository.UserNotFound, user.Email);
                throw new KeyNotFoundException($"User with email {user.Email} not found");
            }

            // Use base repository method for updating
            return await UpdateAsync(user, cancellationToken);
        }
        catch (Exception ex) when (ex is not KeyNotFoundException)
        {
            _logger.LogError(ex, LogTemplates.Repository.UserPasswordUpdateFailed, user.Email);
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
                _logger.LogWarning(LogTemplates.Repository.UserNotFound, email);
                throw new KeyNotFoundException($"User with email {email} not found");
            }
            return user;
        }
        catch (Exception ex) when (ex is not KeyNotFoundException)
        {
            _logger.LogError(ex, LogTemplates.Repository.UserGetByEmailFailed, email);
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
                _logger.LogWarning(LogTemplates.Repository.UserNotFound, name);
                throw new KeyNotFoundException($"User with name {name} not found");
            }
            return user;
        }
        catch (Exception ex) when (ex is not KeyNotFoundException)
        {
            _logger.LogError(ex, LogTemplates.Repository.UserGetByNameFailed, name);
            throw;
        }
    }

    #endregion

    #region User-Employee relationship methods

    public async Task<UserWithEmployeeDto?> GetUserWithEmployeeAsync(int userId, CancellationToken cancellationToken = default)
    {
        try
        {
            return await _dbSet
                .Where(u => u.Id == userId)
                .Include(u => u.Employee)
                .ThenInclude(e => e.Department)
                .Include(u => u.Employee)
                .ThenInclude(e => e.Position)
                .Select(u => new UserWithEmployeeDto
                {
                    UserId = u.Id,
                    Username = u.Name,
                    Email = u.Email,
                    PhoneNumber = u.PhoneNumber,
                    Role = u.Role,
                    EmployeeId = u.EmployeeId,
                    EmployeeName = u.Employee != null
                        ? $"{u.Employee.FirstName} {u.Employee.LastName}".Trim()
                        : null,
                    EmployeeNumber = u.Employee != null ? u.Employee.EmployeeNumber : null,
                    DepartmentName = u.Employee != null && u.Employee.Department != null
                        ? u.Employee.Department.Name
                        : null,
                    PositionName = u.Employee != null && u.Employee.Position != null
                        ? u.Employee.Position.Title
                        : null,
                    CreatedAt = u.CreatedAt
                })
                .FirstOrDefaultAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get user with employee information for user ID: {UserId}", userId);
            throw;
        }
    }

    public async Task<List<UserWithEmployeeDto>> GetUsersWithEmployeeAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            return await _dbSet
                .Include(u => u.Employee)
                .ThenInclude(e => e.Department)
                .Include(u => u.Employee)
                .ThenInclude(e => e.Position)
                .Select(u => new UserWithEmployeeDto
                {
                    UserId = u.Id,
                    Username = u.Name,
                    Email = u.Email,
                    PhoneNumber = u.PhoneNumber,
                    Role = u.Role,
                    EmployeeId = u.EmployeeId,
                    EmployeeName = u.Employee != null
                        ? $"{u.Employee.FirstName} {u.Employee.LastName}".Trim()
                        : null,
                    EmployeeNumber = u.Employee != null ? u.Employee.EmployeeNumber : null,
                    DepartmentName = u.Employee != null && u.Employee.Department != null
                        ? u.Employee.Department.Name
                        : null,
                    PositionName = u.Employee != null && u.Employee.Position != null
                        ? u.Employee.Position.Title
                        : null,
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get users with employee information");
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
