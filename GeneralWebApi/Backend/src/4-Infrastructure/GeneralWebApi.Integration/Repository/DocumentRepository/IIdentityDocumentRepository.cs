using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Domain.Entities.Documents;
using GeneralWebApi.Integration.Repository.Base;

namespace GeneralWebApi.Integration.Repository.DocumentRepository;

public interface IIdentityDocumentRepository : IBaseRepository<IdentityDocument>
{
    /// <summary>
    /// Get paged identity document records with search and filtering
    /// </summary>
    Task<PagedResult<IdentityDocument>> GetPagedAsync(
        int pageNumber, 
        int pageSize, 
        string? searchTerm = null, 
        int? employeeId = null, 
        string? documentType = null, 
        string? issuingAuthority = null, 
        string? issuingCountry = null, 
        DateTime? expirationDateFrom = null, 
        DateTime? expirationDateTo = null, 
        string? sortBy = null, 
        bool sortDescending = false, 
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get identity document records by employee ID
    /// </summary>
    Task<IEnumerable<IdentityDocument>> GetByEmployeeIdAsync(int employeeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get identity document records by document type
    /// </summary>
    Task<IEnumerable<IdentityDocument>> GetByDocumentTypeAsync(string documentType, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get identity document records by issuing authority
    /// </summary>
    Task<IEnumerable<IdentityDocument>> GetByIssuingAuthorityAsync(string issuingAuthority, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get identity document records by issuing country
    /// </summary>
    Task<IEnumerable<IdentityDocument>> GetByIssuingCountryAsync(string issuingCountry, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get expiring identity documents within specified days
    /// </summary>
    Task<IEnumerable<IdentityDocument>> GetExpiringDocumentsAsync(int daysFromNow, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get expired identity documents
    /// </summary>
    Task<IEnumerable<IdentityDocument>> GetExpiredDocumentsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if identity document exists for employee
    /// </summary>
    Task<bool> ExistsForEmployeeAsync(int employeeId, string documentType, string documentNumber, CancellationToken cancellationToken = default);
}

