using AutoMapper;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Domain.Entities.Documents;
using GeneralWebApi.DTOs.Certification;
using GeneralWebApi.Integration.Repository.DocumentsRepository;
using Microsoft.Extensions.Logging;

namespace GeneralWebApi.Application.Services;

public class CertificationService : ICertificationService
{
    private readonly ICertificationRepository _certificationRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<CertificationService> _logger;

    public CertificationService(ICertificationRepository certificationRepository, ILogger<CertificationService> logger, IMapper mapper)
    {
        _certificationRepository = certificationRepository;
        _logger = logger;
        _mapper = mapper;
    }

    public async Task<CertificationDto> CreateAsync(CreateCertificationDto createDto, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Creating certification for employee: {EmployeeId}", createDto.EmployeeId);

        var certification = _mapper.Map<Certification>(createDto);
        var createdCertification = await _certificationRepository.AddAsync(certification, cancellationToken);

        _logger.LogInformation("Successfully created certification with ID: {CertificationId}", createdCertification.Id);
        return _mapper.Map<CertificationDto>(createdCertification);
    }

    public async Task<CertificationDto> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Deleting certification with ID: {CertificationId}", id);

        var certification = await _certificationRepository.GetByIdAsync(id, cancellationToken);
        if (certification == null)
        {
            _logger.LogWarning("Certification with ID {CertificationId} not found", id);
            throw new KeyNotFoundException($"Certification with ID {id} not found");
        }

        await _certificationRepository.DeleteAsync(certification, cancellationToken);

        _logger.LogInformation("Successfully deleted certification with ID: {CertificationId}", id);
        return _mapper.Map<CertificationDto>(certification);
    }

    public async Task<CertificationDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting certification by ID: {CertificationId}", id);

        var certification = await _certificationRepository.GetByIdAsync(id, cancellationToken);
        if (certification == null)
        {
            _logger.LogWarning("Certification with ID {CertificationId} not found", id);
            throw new KeyNotFoundException($"Certification with ID {id} not found");
        }

        return _mapper.Map<CertificationDto>(certification);
    }

    public async Task<PagedResult<CertificationListDto>> GetPagedAsync(CertificationSearchDto searchDto, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting paged certifications with search term: {SearchTerm}", searchDto.SearchTerm);

        var result = await _certificationRepository.GetPagedAsync(
            searchDto.PageNumber,
            searchDto.PageSize,
            searchDto.SearchTerm,
            searchDto.EmployeeId,
            searchDto.SortBy,
            searchDto.SortDescending,
            cancellationToken);

        var certificationListDtos = _mapper.Map<List<CertificationListDto>>(result.Items);

        return new PagedResult<CertificationListDto>(certificationListDtos, result.TotalCount, result.PageNumber, result.PageSize);
    }

    public async Task<CertificationDto> UpdateAsync(int id, UpdateCertificationDto updateDto, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Updating certification with ID: {CertificationId}", id);

        var certification = await _certificationRepository.GetByIdAsync(id, cancellationToken);
        if (certification == null)
        {
            _logger.LogWarning("Certification with ID {CertificationId} not found", id);
            throw new KeyNotFoundException($"Certification with ID {id} not found");
        }

        _mapper.Map(updateDto, certification);
        var updatedCertification = await _certificationRepository.UpdateAsync(certification, cancellationToken);

        _logger.LogInformation("Successfully updated certification with ID: {CertificationId}", id);
        return _mapper.Map<CertificationDto>(updatedCertification);
    }

    public async Task<List<CertificationDto>> GetByEmployeeIdAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting certifications by employee ID: {EmployeeId}", employeeId);

        var certifications = await _certificationRepository.GetByEmployeeIdAsync(employeeId, cancellationToken);
        return _mapper.Map<List<CertificationDto>>(certifications);
    }

    public async Task<List<CertificationDto>> GetExpiringCertificationsAsync(DateTime expiryDate, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting expiring certifications before: {ExpiryDate}", expiryDate);

        var certifications = await _certificationRepository.GetExpiringCertificationsAsync(expiryDate, cancellationToken);
        return _mapper.Map<List<CertificationDto>>(certifications);
    }
}

