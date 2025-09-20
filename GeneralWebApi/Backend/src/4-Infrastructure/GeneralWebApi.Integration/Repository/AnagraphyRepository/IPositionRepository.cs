using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Domain.Entities.Anagraphy;
using GeneralWebApi.Integration.Repository.Base;

namespace GeneralWebApi.Integration.Repository.AnagraphyRepository;

public interface IPositionRepository : IBaseRepository<Position>
{
    Task<bool> ExistsByCodeAsync(string code, CancellationToken cancellationToken = default);
    Task<PagedResult<Position>> GetPagedAsync(int pageNumber, int pageSize, string? searchTerm = null, int? departmentId = null, int? level = null, bool? isManagement = null, string? sortBy = null, bool sortDescending = false, CancellationToken cancellationToken = default);
    Task<List<Position>> GetByDepartmentIdAsync(int departmentId, CancellationToken cancellationToken = default);
    Task<List<Position>> GetByParentIdAsync(int parentId, CancellationToken cancellationToken = default);
}

