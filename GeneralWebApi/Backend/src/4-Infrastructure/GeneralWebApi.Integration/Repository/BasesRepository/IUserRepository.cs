using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Integration.Repository.Base;
using GeneralWebApi.DTOs.Users;

namespace GeneralWebApi.Integration.Repository.BasesRepository;

public interface IUserRepository : IBaseRepository<User>
{
    Task<User> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<User> GetByNameAsync(string name, CancellationToken cancellationToken = default);
    Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<bool> ExistsByNameAsync(string name, CancellationToken cancellationToken = default);
    Task<User> ValidateUserAsync(string username, string password, CancellationToken cancellationToken = default);
    Task<User> RegisterUserAsync(User user, CancellationToken cancellationToken = default);
    Task<User> UpdatePasswordAsync(User user, CancellationToken cancellationToken = default);

    // New methods for User-Employee relationship
    Task<UserWithEmployeeDto?> GetUserWithEmployeeAsync(int userId, CancellationToken cancellationToken = default);
    Task<List<UserWithEmployeeDto>> GetUsersWithEmployeeAsync(CancellationToken cancellationToken = default);
}