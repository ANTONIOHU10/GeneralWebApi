using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Domain.Entities.Documents;
using GeneralWebApi.Integration.Context;
using GeneralWebApi.Integration.Repository.Base;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace GeneralWebApi.Integration.Repository.DocumentRepository;

public class IdentityDocumentRepository : BaseRepository<IdentityDocument>, IIdentityDocumentRepository
{
    public IdentityDocumentRepository(ApplicationDbContext context, ILogger<BaseRepository<IdentityDocument>> logger) : base(context, logger)
    {
    }

    public async Task<PagedResult<IdentityDocument>> GetPagedAsync(int pageNumber, int pageSize, string? searchTerm = null, int? employeeId = null, string? documentType = null, string? issuingAuthority = null, string? issuingCountry = null, DateTime? expirationDateFrom = null, DateTime? expirationDateTo = null, string? sortBy = null, bool sortDescending = false, CancellationToken cancellationToken = default)
    {
        var query = GetActiveAndEnabledEntities()
            .Include(e => e.Employee)
            .AsQueryable();

        // Apply search filters
        query = ApplySearchFilters(query, searchTerm, employeeId, documentType, issuingAuthority, issuingCountry, expirationDateFrom, expirationDateTo);

        // Apply sorting
        query = ApplySorting(query, sortBy, sortDescending);

        // Get total count
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply pagination
        var documents = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<IdentityDocument>(documents, totalCount, pageNumber, pageSize);
    }

    public async Task<IEnumerable<IdentityDocument>> GetByEmployeeIdAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        return await GetActiveAndEnabledEntities()
            .Include(e => e.Employee)
            .Where(e => e.EmployeeId == employeeId)
            .OrderByDescending(e => e.ExpirationDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<IdentityDocument>> GetByDocumentTypeAsync(string documentType, CancellationToken cancellationToken = default)
    {
        return await GetActiveAndEnabledEntities()
            .Include(e => e.Employee)
            .Where(e => e.DocumentType == documentType)
            .OrderByDescending(e => e.ExpirationDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<IdentityDocument>> GetByIssuingAuthorityAsync(string issuingAuthority, CancellationToken cancellationToken = default)
    {
        return await GetActiveAndEnabledEntities()
            .Include(e => e.Employee)
            .Where(e => e.IssuingAuthority.Contains(issuingAuthority))
            .OrderByDescending(e => e.ExpirationDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<IdentityDocument>> GetByIssuingCountryAsync(string issuingCountry, CancellationToken cancellationToken = default)
    {
        return await GetActiveAndEnabledEntities()
            .Include(e => e.Employee)
            .Where(e => e.IssuingCountry == issuingCountry)
            .OrderByDescending(e => e.ExpirationDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<IdentityDocument>> GetExpiringDocumentsAsync(int daysFromNow, CancellationToken cancellationToken = default)
    {
        var targetDate = DateTime.Today.AddDays(daysFromNow);
        return await GetActiveAndEnabledEntities()
            .Include(e => e.Employee)
            .Where(e => e.ExpirationDate <= targetDate && e.ExpirationDate >= DateTime.Today)
            .OrderBy(e => e.ExpirationDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<IdentityDocument>> GetExpiredDocumentsAsync(CancellationToken cancellationToken = default)
    {
        return await GetActiveAndEnabledEntities()
            .Include(e => e.Employee)
            .Where(e => e.ExpirationDate < DateTime.Today)
            .OrderBy(e => e.ExpirationDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsForEmployeeAsync(int employeeId, string documentType, string documentNumber, CancellationToken cancellationToken = default)
    {
        return await GetActiveAndEnabledEntities()
            .AnyAsync(e => e.EmployeeId == employeeId && 
                          e.DocumentType == documentType && 
                          e.DocumentNumber == documentNumber, cancellationToken);
    }

    #region Private Helper Methods

    private static IQueryable<IdentityDocument> ApplySearchFilters(
        IQueryable<IdentityDocument> query,
        string? searchTerm,
        int? employeeId,
        string? documentType,
        string? issuingAuthority,
        string? issuingCountry,
        DateTime? expirationDateFrom,
        DateTime? expirationDateTo)
    {
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(e => e.DocumentType.Contains(searchTerm) ||
                                   e.DocumentNumber.Contains(searchTerm) ||
                                   e.IssuingAuthority.Contains(searchTerm) ||
                                   e.IssuingPlace.Contains(searchTerm) ||
                                   e.IssuingCountry.Contains(searchTerm) ||
                                   e.IssuingState.Contains(searchTerm) ||
                                   e.Notes!.Contains(searchTerm));
        }

        if (employeeId.HasValue)
        {
            query = query.Where(e => e.EmployeeId == employeeId.Value);
        }

        if (!string.IsNullOrWhiteSpace(documentType))
        {
            query = query.Where(e => e.DocumentType == documentType);
        }

        if (!string.IsNullOrWhiteSpace(issuingAuthority))
        {
            query = query.Where(e => e.IssuingAuthority.Contains(issuingAuthority));
        }

        if (!string.IsNullOrWhiteSpace(issuingCountry))
        {
            query = query.Where(e => e.IssuingCountry == issuingCountry);
        }

        if (expirationDateFrom.HasValue)
        {
            query = query.Where(e => e.ExpirationDate >= expirationDateFrom.Value);
        }

        if (expirationDateTo.HasValue)
        {
            query = query.Where(e => e.ExpirationDate <= expirationDateTo.Value);
        }

        return query;
    }

    private static IQueryable<IdentityDocument> ApplySorting(
        IQueryable<IdentityDocument> query,
        string? sortBy,
        bool sortDescending)
    {
        return sortBy?.ToLower() switch
        {
            "documenttype" => sortDescending ? query.OrderByDescending(e => e.DocumentType) : query.OrderBy(e => e.DocumentType),
            "documentnumber" => sortDescending ? query.OrderByDescending(e => e.DocumentNumber) : query.OrderBy(e => e.DocumentNumber),
            "issuedate" => sortDescending ? query.OrderByDescending(e => e.IssueDate) : query.OrderBy(e => e.IssueDate),
            "issuingauthority" => sortDescending ? query.OrderByDescending(e => e.IssuingAuthority) : query.OrderBy(e => e.IssuingAuthority),
            "issuingcountry" => sortDescending ? query.OrderByDescending(e => e.IssuingCountry) : query.OrderBy(e => e.IssuingCountry),
            _ => sortDescending ? query.OrderByDescending(e => e.ExpirationDate) : query.OrderBy(e => e.ExpirationDate)
        };
    }

    #endregion
}



