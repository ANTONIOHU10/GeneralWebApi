using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Contract;

namespace GeneralWebApi.Application.Services;

public interface IContractService
{
    Task<PagedResult<ContractListDto>> GetPagedAsync(ContractSearchDto searchDto, CancellationToken cancellationToken = default);
    Task<ContractDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<ContractDto> CreateAsync(CreateContractDto createDto, CancellationToken cancellationToken = default);
    Task<ContractDto> UpdateAsync(int id, UpdateContractDto updateDto, CancellationToken cancellationToken = default);
    Task<ContractDto> DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<List<ContractDto>> GetByEmployeeIdAsync(int employeeId, CancellationToken cancellationToken = default);
    Task<List<ContractDto>> GetExpiringContractsAsync(DateTime expiryDate, CancellationToken cancellationToken = default);
    Task<List<ContractDto>> GetContractsByStatusAsync(string status, CancellationToken cancellationToken = default);
}





