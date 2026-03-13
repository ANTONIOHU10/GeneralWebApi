using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.ContractTemplate;

namespace GeneralWebApi.Application.Services;

/// <summary>
/// Service for contract template operations.
/// </summary>
public interface IContractTemplateService
{
    Task<PagedResult<ContractTemplateListDto>> GetPagedAsync(ContractTemplateSearchDto searchDto, CancellationToken cancellationToken = default);
    Task<ContractTemplateDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<ContractTemplateDto> CreateAsync(CreateContractTemplateDto createDto, CancellationToken cancellationToken = default);
}
