using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Domain.Entities.Documents;
using GeneralWebApi.Integration.Repository.Base;

namespace GeneralWebApi.Integration.Repository.DocumentsRepository;

/// <summary>
/// Repository interface for ContractTemplate entity.
/// </summary>
public interface IContractTemplateRepository : IBaseRepository<ContractTemplate>
{
    /// <summary>
    /// Get paged contract templates with optional filters and sorting.
    /// </summary>
    Task<PagedResult<ContractTemplate>> GetPagedAsync(
        int pageNumber,
        int pageSize,
        string? searchTerm = null,
        string? contractType = null,
        string? category = null,
        bool? isActive = null,
        bool? isDefault = null,
        string? sortBy = null,
        bool sortDescending = false,
        CancellationToken cancellationToken = default);
}
