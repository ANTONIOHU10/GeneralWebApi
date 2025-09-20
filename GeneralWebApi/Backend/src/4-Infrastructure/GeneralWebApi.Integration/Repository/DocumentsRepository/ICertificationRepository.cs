using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Domain.Entities.Documents;
using GeneralWebApi.Integration.Repository.Base;

namespace GeneralWebApi.Integration.Repository.DocumentsRepository;

public interface ICertificationRepository : IBaseRepository<Certification>
{
    Task<bool> ExistsByEmployeeIdAsync(int employeeId, CancellationToken cancellationToken = default);
    Task<PagedResult<Certification>> GetPagedAsync(int pageNumber, int pageSize, string? searchTerm = null, int? employeeId = null, string? sortBy = null, bool sortDescending = false, CancellationToken cancellationToken = default);
    Task<List<Certification>> GetByEmployeeIdAsync(int employeeId, CancellationToken cancellationToken = default);
    Task<List<Certification>> GetExpiringCertificationsAsync(DateTime expiryDate, CancellationToken cancellationToken = default);
}



