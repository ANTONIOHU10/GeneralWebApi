using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Domain.Entities.Documents;
using GeneralWebApi.Integration.Repository.Base;

namespace GeneralWebApi.Integration.Repository.DocumentsRepository;

public interface IContractRepository : IBaseRepository<Contract>
{
    Task<bool> ExistsByEmployeeIdAsync(int employeeId, CancellationToken cancellationToken = default);
    Task<PagedResult<Contract>> GetPagedAsync(int pageNumber, int pageSize, string? searchTerm = null, int? employeeId = null, string? contractType = null, string? status = null, string? sortBy = null, bool sortDescending = false, CancellationToken cancellationToken = default);
    Task<List<Contract>> GetByEmployeeIdAsync(int employeeId, CancellationToken cancellationToken = default);
    Task<List<Contract>> GetExpiringContractsAsync(DateTime expiryDate, CancellationToken cancellationToken = default);
    Task<List<Contract>> GetContractsByStatusAsync(string status, CancellationToken cancellationToken = default);
}



