using AutoMapper;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Domain.Entities.Documents;
using GeneralWebApi.DTOs.Contract;
using GeneralWebApi.Integration.Repository.DocumentsRepository;
using Microsoft.Extensions.Logging;

namespace GeneralWebApi.Application.Services;

public class ContractService : IContractService
{
    private readonly IContractRepository _contractRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<ContractService> _logger;

    public ContractService(IContractRepository contractRepository, ILogger<ContractService> logger, IMapper mapper)
    {
        _contractRepository = contractRepository;
        _logger = logger;
        _mapper = mapper;
    }

    public async Task<ContractDto> CreateAsync(CreateContractDto createDto, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Creating contract for employee: {EmployeeId}", createDto.EmployeeId);

        var contract = _mapper.Map<Contract>(createDto);
        var createdContract = await _contractRepository.AddAsync(contract, cancellationToken);

        _logger.LogInformation("Successfully created contract with ID: {ContractId}", createdContract.Id);
        return _mapper.Map<ContractDto>(createdContract);
    }

    public async Task<ContractDto> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Deleting contract with ID: {ContractId}", id);

        var contract = await _contractRepository.GetByIdAsync(id, cancellationToken);
        if (contract == null)
        {
            _logger.LogWarning("Contract with ID {ContractId} not found", id);
            throw new KeyNotFoundException($"Contract with ID {id} not found");
        }

        await _contractRepository.DeleteAsync(contract, cancellationToken);

        _logger.LogInformation("Successfully deleted contract with ID: {ContractId}", id);
        return _mapper.Map<ContractDto>(contract);
    }

    public async Task<ContractDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting contract by ID: {ContractId}", id);

        var contract = await _contractRepository.GetByIdAsync(id, cancellationToken);
        if (contract == null)
        {
            _logger.LogWarning("Contract with ID {ContractId} not found", id);
            throw new KeyNotFoundException($"Contract with ID {id} not found");
        }

        return _mapper.Map<ContractDto>(contract);
    }

    public async Task<PagedResult<ContractListDto>> GetPagedAsync(ContractSearchDto searchDto, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting paged contracts with search term: {SearchTerm}", searchDto.SearchTerm);

        var result = await _contractRepository.GetPagedAsync(
            searchDto.PageNumber,
            searchDto.PageSize,
            searchDto.SearchTerm,
            searchDto.EmployeeId,
            searchDto.ContractType,
            searchDto.Status,
            searchDto.SortBy,
            searchDto.SortDescending,
            cancellationToken);

        var contractListDtos = _mapper.Map<List<ContractListDto>>(result.Items);

        return new PagedResult<ContractListDto>(contractListDtos, result.TotalCount, result.PageNumber, result.PageSize);
    }

    public async Task<ContractDto> UpdateAsync(int id, UpdateContractDto updateDto, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Updating contract with ID: {ContractId}", id);

        var contract = await _contractRepository.GetByIdAsync(id, cancellationToken);
        if (contract == null)
        {
            _logger.LogWarning("Contract with ID {ContractId} not found", id);
            throw new KeyNotFoundException($"Contract with ID {id} not found");
        }

        _mapper.Map(updateDto, contract);
        var updatedContract = await _contractRepository.UpdateAsync(contract, cancellationToken);

        _logger.LogInformation("Successfully updated contract with ID: {ContractId}", id);
        return _mapper.Map<ContractDto>(updatedContract);
    }

    public async Task<List<ContractDto>> GetByEmployeeIdAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting contracts by employee ID: {EmployeeId}", employeeId);

        var contracts = await _contractRepository.GetByEmployeeIdAsync(employeeId, cancellationToken);
        return _mapper.Map<List<ContractDto>>(contracts);
    }

    public async Task<List<ContractDto>> GetExpiringContractsAsync(DateTime expiryDate, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting expiring contracts before: {ExpiryDate}", expiryDate);

        var contracts = await _contractRepository.GetExpiringContractsAsync(expiryDate, cancellationToken);
        return _mapper.Map<List<ContractDto>>(contracts);
    }

    public async Task<List<ContractDto>> GetContractsByStatusAsync(string status, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting contracts by status: {Status}", status);

        var contracts = await _contractRepository.GetContractsByStatusAsync(status, cancellationToken);
        return _mapper.Map<List<ContractDto>>(contracts);
    }
}



