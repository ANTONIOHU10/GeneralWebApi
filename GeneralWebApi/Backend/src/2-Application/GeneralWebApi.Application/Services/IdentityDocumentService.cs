using AutoMapper;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Domain.Entities.Documents;
using GeneralWebApi.DTOs.IdentityDocument;
using GeneralWebApi.Integration.Repository.DocumentRepository;
using Microsoft.Extensions.Logging;

namespace GeneralWebApi.Application.Interfaces;

public class IdentityDocumentService : IIdentityDocumentService
{
    private readonly IIdentityDocumentRepository _identityDocumentRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<IdentityDocumentService> _logger;

    public IdentityDocumentService(IIdentityDocumentRepository identityDocumentRepository, ILogger<IdentityDocumentService> logger, IMapper mapper)
    {
        _identityDocumentRepository = identityDocumentRepository;
        _logger = logger;
        _mapper = mapper;
    }

    public async Task<IdentityDocumentDto> CreateAsync(CreateIdentityDocumentDto createDto, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Creating identity document record for employee {EmployeeId}", createDto.EmployeeId);

        // Check if identity document record already exists for this employee
        if (await _identityDocumentRepository.ExistsForEmployeeAsync(createDto.EmployeeId, createDto.DocumentType, createDto.DocumentNumber, cancellationToken))
        {
            _logger.LogWarning("Identity document record already exists for employee {EmployeeId} with type {DocumentType} and number {DocumentNumber}", 
                createDto.EmployeeId, createDto.DocumentType, createDto.DocumentNumber);
            throw new InvalidOperationException($"Identity document record already exists for this employee with type {createDto.DocumentType} and number {createDto.DocumentNumber}");
        }

        var identityDocument = _mapper.Map<IdentityDocument>(createDto);
        var createdDocument = await _identityDocumentRepository.AddAsync(identityDocument, cancellationToken);

        _logger.LogInformation("Successfully created identity document record with ID: {DocumentId}", createdDocument.Id);
        return _mapper.Map<IdentityDocumentDto>(createdDocument);
    }

    public async Task<IdentityDocumentDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting identity document record by ID: {DocumentId}", id);

        var identityDocument = await _identityDocumentRepository.GetByIdAsync(id, cancellationToken);
        if (identityDocument == null)
        {
            _logger.LogWarning("Identity document record with ID {DocumentId} not found", id);
            throw new KeyNotFoundException($"Identity document record with ID {id} not found");
        }

        return _mapper.Map<IdentityDocumentDto>(identityDocument);
    }

    public async Task<PagedResult<IdentityDocumentListDto>> GetPagedAsync(IdentityDocumentSearchDto searchDto, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting paged identity document records with search criteria");

        var result = await _identityDocumentRepository.GetPagedAsync(
            searchDto.PageNumber,
            searchDto.PageSize,
            searchDto.SearchTerm,
            searchDto.EmployeeId,
            searchDto.DocumentType,
            searchDto.IssuingAuthority,
            searchDto.IssuingCountry,
            searchDto.ExpirationDateFrom,
            searchDto.ExpirationDateTo,
            searchDto.SortBy,
            searchDto.SortDescending,
            cancellationToken);

        var documentListDtos = _mapper.Map<IEnumerable<IdentityDocumentListDto>>(result.Items);

        return new PagedResult<IdentityDocumentListDto>(
            documentListDtos.ToList(),
            result.TotalCount,
            result.PageNumber,
            result.PageSize);
    }

    public async Task<IdentityDocumentDto> UpdateAsync(UpdateIdentityDocumentDto updateDto, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Updating identity document record with ID: {DocumentId}", updateDto.Id);

        var existingDocument = await _identityDocumentRepository.GetByIdAsync(updateDto.Id, cancellationToken);
        if (existingDocument == null)
        {
            _logger.LogWarning("Identity document record with ID {DocumentId} not found", updateDto.Id);
            throw new KeyNotFoundException($"Identity document record with ID {updateDto.Id} not found");
        }

        // Check if another identity document record exists for this employee with same type and number
        if (await _identityDocumentRepository.ExistsForEmployeeAsync(updateDto.EmployeeId, updateDto.DocumentType, updateDto.DocumentNumber, cancellationToken) &&
            (existingDocument.EmployeeId != updateDto.EmployeeId || existingDocument.DocumentType != updateDto.DocumentType || existingDocument.DocumentNumber != updateDto.DocumentNumber))
        {
            _logger.LogWarning("Identity document record already exists for employee {EmployeeId} with type {DocumentType} and number {DocumentNumber}", 
                updateDto.EmployeeId, updateDto.DocumentType, updateDto.DocumentNumber);
            throw new InvalidOperationException($"Identity document record already exists for this employee with type {updateDto.DocumentType} and number {updateDto.DocumentNumber}");
        }

        _mapper.Map(updateDto, existingDocument);
        var updatedDocument = await _identityDocumentRepository.UpdateAsync(existingDocument, cancellationToken);

        _logger.LogInformation("Successfully updated identity document record with ID: {DocumentId}", updatedDocument.Id);
        return _mapper.Map<IdentityDocumentDto>(updatedDocument);
    }

    public async Task<IdentityDocumentDto> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Deleting identity document record with ID: {DocumentId}", id);

        var identityDocument = await _identityDocumentRepository.GetByIdAsync(id, cancellationToken);
        if (identityDocument == null)
        {
            _logger.LogWarning("Identity document record with ID {DocumentId} not found", id);
            throw new KeyNotFoundException($"Identity document record with ID {id} not found");
        }

        var deletedDocument = await _identityDocumentRepository.DeleteAsync(id, cancellationToken);

        _logger.LogInformation("Successfully deleted identity document record with ID: {DocumentId}", id);
        return _mapper.Map<IdentityDocumentDto>(deletedDocument);
    }

    public async Task<IEnumerable<IdentityDocumentListDto>> GetByEmployeeIdAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting identity document records for employee ID: {EmployeeId}", employeeId);

        var documents = await _identityDocumentRepository.GetByEmployeeIdAsync(employeeId, cancellationToken);
        return _mapper.Map<IEnumerable<IdentityDocumentListDto>>(documents);
    }

    public async Task<IEnumerable<IdentityDocumentListDto>> GetByDocumentTypeAsync(string documentType, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting identity document records for document type: {DocumentType}", documentType);

        var documents = await _identityDocumentRepository.GetByDocumentTypeAsync(documentType, cancellationToken);
        return _mapper.Map<IEnumerable<IdentityDocumentListDto>>(documents);
    }

    public async Task<IEnumerable<IdentityDocumentListDto>> GetByIssuingAuthorityAsync(string issuingAuthority, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting identity document records for issuing authority: {IssuingAuthority}", issuingAuthority);

        var documents = await _identityDocumentRepository.GetByIssuingAuthorityAsync(issuingAuthority, cancellationToken);
        return _mapper.Map<IEnumerable<IdentityDocumentListDto>>(documents);
    }

    public async Task<IEnumerable<IdentityDocumentListDto>> GetByIssuingCountryAsync(string issuingCountry, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting identity document records for issuing country: {IssuingCountry}", issuingCountry);

        var documents = await _identityDocumentRepository.GetByIssuingCountryAsync(issuingCountry, cancellationToken);
        return _mapper.Map<IEnumerable<IdentityDocumentListDto>>(documents);
    }

    public async Task<IEnumerable<IdentityDocumentListDto>> GetExpiringDocumentsAsync(int daysFromNow, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting identity document records expiring within {DaysFromNow} days", daysFromNow);

        var documents = await _identityDocumentRepository.GetExpiringDocumentsAsync(daysFromNow, cancellationToken);
        return _mapper.Map<IEnumerable<IdentityDocumentListDto>>(documents);
    }

    public async Task<IEnumerable<IdentityDocumentListDto>> GetExpiredDocumentsAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting expired identity document records");

        var documents = await _identityDocumentRepository.GetExpiredDocumentsAsync(cancellationToken);
        return _mapper.Map<IEnumerable<IdentityDocumentListDto>>(documents);
    }
}

