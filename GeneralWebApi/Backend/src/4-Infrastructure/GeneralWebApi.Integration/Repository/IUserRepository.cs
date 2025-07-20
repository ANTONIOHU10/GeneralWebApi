using GeneralWebApi.Domain.Entities;

namespace GeneralWebApi.Integration.Repository;

public interface IUserRepository : IBaseRepository<User>
{
    Task<User> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<User> GetByNameAsync(string name, CancellationToken cancellationToken = default);
    Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<bool> ExistsByNameAsync(string name, CancellationToken cancellationToken = default);
    Task<User> ValidateUserAsync(string username, string password, CancellationToken cancellationToken = default);
    Task<User> RegisterUserAsync(User user, CancellationToken cancellationToken = default);
    Task<User> UpdatePasswordAsync(User user, CancellationToken cancellationToken = default);
}