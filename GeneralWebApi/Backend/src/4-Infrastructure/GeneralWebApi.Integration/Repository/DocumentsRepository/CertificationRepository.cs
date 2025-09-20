using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Domain.Entities.Documents;
using GeneralWebApi.Integration.Context;
using GeneralWebApi.Integration.Repository.Base;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace GeneralWebApi.Integration.Repository.DocumentsRepository;

public class CertificationRepository : BaseRepository<Certification>, ICertificationRepository
{
    public CertificationRepository(ApplicationDbContext context, ILogger<BaseRepository<Certification>> logger) : base(context, logger)
    {
    }

    public async Task<bool> ExistsByEmployeeIdAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        return await GetActiveAndEnabledEntities()
            .AnyAsync(c => c.EmployeeId == employeeId, cancellationToken);
    }

    public async Task<PagedResult<Certification>> GetPagedAsync(int pageNumber, int pageSize, string? searchTerm = null, int? employeeId = null, string? sortBy = null, bool sortDescending = false, CancellationToken cancellationToken = default)
    {
        var query = GetActiveAndEnabledEntities()
            .Include(c => c.Employee)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(c => c.Name.Contains(searchTerm) ||
                                   c.IssuingOrganization.Contains(searchTerm) ||
                                   c.CredentialId.Contains(searchTerm));
        }

        if (employeeId.HasValue)
        {
            query = query.Where(c => c.EmployeeId == employeeId.Value);
        }

        query = sortBy?.ToLower() switch
        {
            "name" => sortDescending ? query.OrderByDescending(c => c.Name) : query.OrderBy(c => c.Name),
            "issuedate" => sortDescending ? query.OrderByDescending(c => c.IssueDate) : query.OrderBy(c => c.IssueDate),
            "expirydate" => sortDescending ? query.OrderByDescending(c => c.ExpiryDate) : query.OrderBy(c => c.ExpiryDate),
            "createdat" => sortDescending ? query.OrderByDescending(c => c.CreatedAt) : query.OrderBy(c => c.CreatedAt),
            _ => query.OrderByDescending(c => c.CreatedAt)
        };

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<Certification>(items, totalCount, pageNumber, pageSize);
    }

    public async Task<List<Certification>> GetByEmployeeIdAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        return await GetActiveAndEnabledEntities()
            .Where(c => c.EmployeeId == employeeId)
            .OrderByDescending(c => c.IssueDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<Certification>> GetExpiringCertificationsAsync(DateTime expiryDate, CancellationToken cancellationToken = default)
    {
        return await GetActiveAndEnabledEntities()
            .Where(c => c.ExpiryDate.HasValue && c.ExpiryDate <= expiryDate)
            .Include(c => c.Employee)
            .OrderBy(c => c.ExpiryDate)
            .ToListAsync(cancellationToken);
    }
}





