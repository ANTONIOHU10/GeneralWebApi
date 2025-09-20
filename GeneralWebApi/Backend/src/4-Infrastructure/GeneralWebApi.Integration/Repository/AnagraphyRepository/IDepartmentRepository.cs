using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Domain.Entities.Anagraphy;
using GeneralWebApi.Integration.Repository.Base;

namespace GeneralWebApi.Integration.Repository.AnagraphyRepository;

public interface IDepartmentRepository : IBaseRepository<Department>
{
    Task<bool> ExistsByCodeAsync(string code, CancellationToken cancellationToken = default);
    Task<PagedResult<Department>> GetPagedAsync(int pageNumber, int pageSize, string? searchTerm = null, int? parentDepartmentId = null, int? level = null, string? sortBy = null, bool sortDescending = false, CancellationToken cancellationToken = default);
    Task<List<Department>> GetHierarchyAsync(CancellationToken cancellationToken = default);
    Task<List<Department>> GetByParentIdAsync(int parentId, CancellationToken cancellationToken = default);
}



