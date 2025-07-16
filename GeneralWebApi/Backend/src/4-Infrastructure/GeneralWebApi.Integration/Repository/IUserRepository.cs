using GeneralWebApi.Domain.Entities;

namespace GeneralWebApi.Integration.Repository;

public interface IUserRepository : IBaseRepository<User>
{
    Task<User> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default);
}