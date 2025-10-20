using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.IdentityDocument;

namespace GeneralWebApi.Application.Interfaces;

public interface IIdentityDocumentService
{
    /// <summary>
    /// Create a new identity document record
    /// </summary>
    Task<IdentityDocumentDto> CreateAsync(CreateIdentityDocumentDto createDto, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get identity document record by ID
    /// </summary>
    Task<IdentityDocumentDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get paged identity document records
    /// </summary>
    Task<PagedResult<IdentityDocumentListDto>> GetPagedAsync(IdentityDocumentSearchDto searchDto, CancellationToken cancellationToken = default);

    /// <summary>
    /// Update identity document record
    /// </summary>
    Task<IdentityDocumentDto> UpdateAsync(UpdateIdentityDocumentDto updateDto, CancellationToken cancellationToken = default);

    /// <summary>
    /// Delete identity document record
    /// </summary>
    Task<IdentityDocumentDto> DeleteAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get identity document records by employee ID
    /// </summary>
    Task<IEnumerable<IdentityDocumentListDto>> GetByEmployeeIdAsync(int employeeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get identity document records by document type
    /// </summary>
    Task<IEnumerable<IdentityDocumentListDto>> GetByDocumentTypeAsync(string documentType, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get identity document records by issuing authority
    /// </summary>
    Task<IEnumerable<IdentityDocumentListDto>> GetByIssuingAuthorityAsync(string issuingAuthority, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get identity document records by issuing country
    /// </summary>
    Task<IEnumerable<IdentityDocumentListDto>> GetByIssuingCountryAsync(string issuingCountry, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get expiring identity documents within specified days
    /// </summary>
    Task<IEnumerable<IdentityDocumentListDto>> GetExpiringDocumentsAsync(int daysFromNow, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get expired identity documents
    /// </summary>
    Task<IEnumerable<IdentityDocumentListDto>> GetExpiredDocumentsAsync(CancellationToken cancellationToken = default);
}

