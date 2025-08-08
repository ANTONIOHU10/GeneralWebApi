using GeneralWebApi.Domain.Entities;

namespace GeneralWebApi.Integration.Repository;

public interface IExternalApiConfigRepository : IBaseRepository<ExternalApiConfig>
{
    Task<ExternalApiConfig?> GetByNameAsync(string name, CancellationToken cancellationToken = default);
}