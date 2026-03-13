using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Domain.Entities.Documents;
using GeneralWebApi.Integration.Context;
using GeneralWebApi.Integration.Repository.Base;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace GeneralWebApi.Integration.Repository.DocumentsRepository;

/// <summary>
/// Repository for ContractTemplate with paged list and indexes used for sorting/filtering.
/// </summary>
public class ContractTemplateRepository : BaseRepository<ContractTemplate>, IContractTemplateRepository
{
    public ContractTemplateRepository(ApplicationDbContext context, ILogger<BaseRepository<ContractTemplate>> logger)
        : base(context, logger)
    {
    }

    public override async Task<ContractTemplate> GetByIdAsync(object id, CancellationToken cancellationToken = default)
    {
        var template = await GetActiveAndEnabledEntities()
            .Include(t => t.ParentTemplate)
            .FirstOrDefaultAsync(t => t.Id.Equals(id), cancellationToken);

        if (template == null)
        {
            _logger.LogWarning("ContractTemplate with ID {TemplateId} not found", id);
            throw new KeyNotFoundException($"ContractTemplate with ID {id} not found");
        }

        return template;
    }

    public async Task<PagedResult<ContractTemplate>> GetPagedAsync(
        int pageNumber,
        int pageSize,
        string? searchTerm = null,
        string? contractType = null,
        string? category = null,
        bool? isActive = null,
        bool? isDefault = null,
        string? sortBy = null,
        bool sortDescending = false,
        CancellationToken cancellationToken = default)
    {
        var query = GetActiveAndEnabledEntities().AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.Trim().ToLower();
            query = query.Where(t =>
                t.Name.ToLower().Contains(term) ||
                (t.Description != null && t.Description.ToLower().Contains(term)) ||
                (t.Category != null && t.Category.ToLower().Contains(term)));
        }

        if (!string.IsNullOrWhiteSpace(contractType))
            query = query.Where(t => t.ContractType == contractType);

        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(t => t.Category == category);

        if (isActive.HasValue)
            query = query.Where(t => t.IsActive == isActive.Value);

        if (isDefault.HasValue)
            query = query.Where(t => t.IsDefault == isDefault.Value);

        query = ApplySorting(query, sortBy, sortDescending);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<ContractTemplate>(items, totalCount, pageNumber, pageSize);
    }

    private static IQueryable<ContractTemplate> ApplySorting(IQueryable<ContractTemplate> query, string? sortBy, bool sortDescending)
    {
        return sortBy?.ToLower() switch
        {
            "name" => sortDescending ? query.OrderByDescending(t => t.Name) : query.OrderBy(t => t.Name),
            "contracttype" => sortDescending ? query.OrderByDescending(t => t.ContractType) : query.OrderBy(t => t.ContractType),
            "category" => sortDescending ? query.OrderByDescending(t => t.Category) : query.OrderBy(t => t.Category),
            "usagecount" => sortDescending ? query.OrderByDescending(t => t.UsageCount) : query.OrderBy(t => t.UsageCount),
            "isdefault" => sortDescending ? query.OrderByDescending(t => t.IsDefault) : query.OrderBy(t => t.IsDefault),
            "createdat" => sortDescending ? query.OrderByDescending(t => t.CreatedAt) : query.OrderBy(t => t.CreatedAt),
            _ => sortDescending ? query.OrderByDescending(t => t.Id) : query.OrderBy(t => t.Id)
        };
    }
}
