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
        var query = GetActiveAndEnabledEntities()
            .Include(c => c.Employee)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(c => c.ContractType.Contains(searchTerm) ||
                                   c.Notes.Contains(searchTerm));
        }

        if (employeeId.HasValue)
        {
            query = query.Where(c => c.EmployeeId == employeeId.Value);
        }

        if (!string.IsNullOrWhiteSpace(contractType))
        {
            query = query.Where(c => c.ContractType == contractType);
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(c => c.Status == status);
        }

        query = sortBy?.ToLower() switch
        {
            "contracttype" => sortDescending ? query.OrderByDescending(c => c.ContractType) : query.OrderBy(c => c.ContractType),
            "startdate" => sortDescending ? query.OrderByDescending(c => c.StartDate) : query.OrderBy(c => c.StartDate),
            "enddate" => sortDescending ? query.OrderByDescending(c => c.EndDate) : query.OrderBy(c => c.EndDate),
            "status" => sortDescending ? query.OrderByDescending(c => c.Status) : query.OrderBy(c => c.Status),
            "createdat" => sortDescending ? query.OrderByDescending(c => c.CreatedAt) : query.OrderBy(c => c.CreatedAt),
            _ => query.OrderByDescending(c => c.CreatedAt)
        };

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<Contract>(items, totalCount, pageNumber, pageSize);
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





