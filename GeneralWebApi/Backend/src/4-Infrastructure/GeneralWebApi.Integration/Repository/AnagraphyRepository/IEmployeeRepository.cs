using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Domain.Entities.Anagraphy;
using GeneralWebApi.Integration.Repository.Base;

namespace GeneralWebApi.Integration.Repository.AnagraphyRepository;

public interface IEmployeeRepository : IBaseRepository<Employee>
{
    Task<bool> ExistsByEmployeeNumberAsync(string employeeNumber, CancellationToken cancellationToken = default);
    Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<PagedResult<Employee>> GetPagedAsync(int pageNumber, int pageSize, string? searchTerm = null, int? departmentId = null, int? positionId = null, string? employmentStatus = null, DateTime? hireDateFrom = null, DateTime? hireDateTo = null, string? sortBy = null, bool sortDescending = false, CancellationToken cancellationToken = default);

}