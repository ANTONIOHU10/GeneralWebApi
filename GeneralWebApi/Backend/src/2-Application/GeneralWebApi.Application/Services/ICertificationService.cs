using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Certification;

namespace GeneralWebApi.Application.Services;

public interface ICertificationService
{
    Task<PagedResult<CertificationListDto>> GetPagedAsync(CertificationSearchDto searchDto, CancellationToken cancellationToken = default);
    Task<CertificationDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<CertificationDto> CreateAsync(CreateCertificationDto createDto, CancellationToken cancellationToken = default);
    Task<CertificationDto> UpdateAsync(int id, UpdateCertificationDto updateDto, CancellationToken cancellationToken = default);
    Task<CertificationDto> DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<List<CertificationDto>> GetByEmployeeIdAsync(int employeeId, CancellationToken cancellationToken = default);
    Task<List<CertificationDto>> GetExpiringCertificationsAsync(DateTime expiryDate, CancellationToken cancellationToken = default);
}

