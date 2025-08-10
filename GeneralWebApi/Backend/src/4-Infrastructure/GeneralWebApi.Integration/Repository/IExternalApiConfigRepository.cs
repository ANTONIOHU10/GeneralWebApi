using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Integration.Repository.Base;

namespace GeneralWebApi.Integration.Repository;

public interface IExternalApiConfigRepository : IBaseRepository<ExternalApiConfig>
{
    Task<ExternalApiConfig?> GetByNameAsync(string name, CancellationToken cancellationToken = default);
}