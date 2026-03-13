using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Domain.Entities.Documents;
using GeneralWebApi.Integration.Context;
using GeneralWebApi.Integration.Repository.Base;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace GeneralWebApi.Integration.Repository.DocumentsRepository;

public class ContractRepository : BaseRepository<Contract>, IContractRepository
{
    public ContractRepository(ApplicationDbContext context, ILogger<BaseRepository<Contract>> logger) : base(context, logger)
    {
    }

    public override async Task<Contract> GetByIdAsync(object id, CancellationToken cancellationToken = default)
    {
        var contract = await GetActiveAndEnabledEntities()
            .Include(c => c.Employee)
            .FirstOrDefaultAsync(c => c.Id.Equals(id), cancellationToken);

        if (contract == null)
        {
            _logger.LogWarning("Contract with ID {ContractId} not found", id);
            throw new KeyNotFoundException($"Contract with ID {id} not found");
        }

        return contract;
    }

    public async Task<bool> ExistsByEmployeeIdAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        return await GetActiveAndEnabledEntities()
            .AnyAsync(c => c.EmployeeId == employeeId, cancellationToken);
    }

    public async Task<PagedResult<Contract>> GetPagedAsync(int pageNumber, int pageSize, string? searchTerm = null, int? employeeId = null, string? contractType = null, string? status = null, string? sortBy = null, bool sortDescending = false, CancellationToken cancellationToken = default)
    {
        // Count without Include to avoid unnecessary JOIN and reduce query cost
        var countQuery = ApplyPagedFilters(GetActiveAndEnabledEntities(), searchTerm, employeeId, contractType, status);
        var totalCount = await countQuery.CountAsync(cancellationToken);

        var dataQuery = GetActiveAndEnabledEntities()
            .Include(c => c.Employee)
            .AsQueryable();
        dataQuery = ApplyPagedFilters(dataQuery, searchTerm, employeeId, contractType, status);
        dataQuery = sortBy?.ToLower() switch
        {
            "contracttype" => sortDescending ? dataQuery.OrderByDescending(c => c.ContractType) : dataQuery.OrderBy(c => c.ContractType),
            "startdate" => sortDescending ? dataQuery.OrderByDescending(c => c.StartDate) : dataQuery.OrderBy(c => c.StartDate),
            "enddate" => sortDescending ? dataQuery.OrderByDescending(c => c.EndDate) : dataQuery.OrderBy(c => c.EndDate),
            "status" => sortDescending ? dataQuery.OrderByDescending(c => c.Status) : dataQuery.OrderBy(c => c.Status),
            "createdat" => sortDescending ? dataQuery.OrderByDescending(c => c.CreatedAt) : dataQuery.OrderBy(c => c.CreatedAt),
            _ => dataQuery.OrderByDescending(c => c.CreatedAt)
        };

        var items = await dataQuery
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<Contract>(items, totalCount, pageNumber, pageSize);
    }

    private static IQueryable<Contract> ApplyPagedFilters(IQueryable<Contract> query, string? searchTerm, int? employeeId, string? contractType, string? status)
    {
        if (!string.IsNullOrWhiteSpace(searchTerm))
            query = query.Where(c => c.ContractType.Contains(searchTerm) || c.Notes != null && c.Notes.Contains(searchTerm));
        if (employeeId.HasValue)
            query = query.Where(c => c.EmployeeId == employeeId.Value);
        if (!string.IsNullOrWhiteSpace(contractType))
            query = query.Where(c => c.ContractType == contractType);
        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(c => c.Status == status);
        return query;
    }

    public async Task<List<Contract>> GetByEmployeeIdAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        return await GetActiveAndEnabledEntities()
            .Include(c => c.Employee)
            .Where(c => c.EmployeeId == employeeId)
            .OrderByDescending(c => c.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<Contract>> GetExpiringContractsAsync(DateTime expiryDate, CancellationToken cancellationToken = default)
    {
        return await GetActiveAndEnabledEntities()
            .Where(c => c.EndDate.HasValue && c.EndDate <= expiryDate && c.Status == "Active")
            .Include(c => c.Employee)
            .OrderBy(c => c.EndDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<Contract>> GetExpiringContractsAsync(int daysFromNow, CancellationToken cancellationToken = default)
    {
        var targetDate = DateTime.Today.AddDays(daysFromNow);
        return await GetActiveAndEnabledEntities()
            .Include(c => c.Employee)
            .Where(c => c.EndDate.HasValue &&
                       c.EndDate <= targetDate &&
                       c.EndDate >= DateTime.Today &&
                       c.Status == "Active")
            .OrderBy(c => c.EndDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<Contract>> GetExpiredContractsAsync(CancellationToken cancellationToken = default)
    {
        return await GetActiveAndEnabledEntities()
            .Include(c => c.Employee)
            .Where(c => c.EndDate.HasValue && c.EndDate < DateTime.Today)
            .OrderBy(c => c.EndDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<Contract>> GetContractsByStatusAsync(string status, CancellationToken cancellationToken = default)
    {
        return await GetActiveAndEnabledEntities()
            .Where(c => c.Status == status)
            .Include(c => c.Employee)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync(cancellationToken);
    }
}





