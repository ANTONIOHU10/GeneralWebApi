using AutoMapper;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.ContractTemplate;
using GeneralWebApi.Integration.Repository.DocumentsRepository;
using Microsoft.Extensions.Logging;

namespace GeneralWebApi.Application.Services;

/// <summary>
/// Service for contract template CRUD and list operations.
/// </summary>
public class ContractTemplateService : IContractTemplateService
{
    private readonly IContractTemplateRepository _repository;
    private readonly IMapper _mapper;
    private readonly ILogger<ContractTemplateService> _logger;

    public ContractTemplateService(
        IContractTemplateRepository repository,
        IMapper mapper,
        ILogger<ContractTemplateService> logger)
    {
        _repository = repository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<PagedResult<ContractTemplateListDto>> GetPagedAsync(ContractTemplateSearchDto searchDto, CancellationToken cancellationToken = default)
    {
        var result = await _repository.GetPagedAsync(
            searchDto.PageNumber,
            searchDto.PageSize,
            searchDto.SearchTerm,
            searchDto.ContractType,
            searchDto.Category,
            searchDto.IsActive,
            searchDto.IsDefault,
            searchDto.SortBy,
            searchDto.SortDescending,
            cancellationToken);

        var items = _mapper.Map<List<ContractTemplateListDto>>(result.Items);
        return new PagedResult<ContractTemplateListDto>(items, result.TotalCount, result.PageNumber, result.PageSize);
    }

    public async Task<ContractTemplateDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        return _mapper.Map<ContractTemplateDto>(entity);
    }

    public async Task<ContractTemplateDto> CreateAsync(CreateContractTemplateDto createDto, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Creating contract template: {Name}", createDto.Name);

        var entity = _mapper.Map<Domain.Entities.Documents.ContractTemplate>(createDto);
        var created = await _repository.AddAsync(entity, cancellationToken);

        _logger.LogInformation("Created contract template with ID {Id}", created.Id);
        return _mapper.Map<ContractTemplateDto>(created);
    }
}
