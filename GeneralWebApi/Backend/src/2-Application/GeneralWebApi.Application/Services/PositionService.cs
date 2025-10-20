using AutoMapper;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Domain.Entities.Anagraphy;
using GeneralWebApi.DTOs.Position;
using GeneralWebApi.Integration.Repository.AnagraphyRepository;
using Microsoft.Extensions.Logging;

namespace GeneralWebApi.Application.Services;

public class PositionService : IPositionService
{
    private readonly IPositionRepository _positionRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<PositionService> _logger;

    public PositionService(IPositionRepository positionRepository, ILogger<PositionService> logger, IMapper mapper)
    {
        _positionRepository = positionRepository;
        _logger = logger;
        _mapper = mapper;
    }

    public async Task<PositionDto> CreateAsync(CreatePositionDto createDto, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Creating position with code: {PositionCode}", createDto.Code);

        if (await _positionRepository.ExistsByCodeAsync(createDto.Code, cancellationToken))
        {
            _logger.LogWarning("Position with code {PositionCode} already exists", createDto.Code);
            throw new InvalidOperationException($"Position with code {createDto.Code} already exists");
        }

        var position = _mapper.Map<Position>(createDto);
        var createdPosition = await _positionRepository.AddAsync(position, cancellationToken);

        _logger.LogInformation("Successfully created position with ID: {PositionId}", createdPosition.Id);
        return _mapper.Map<PositionDto>(createdPosition);
    }

    public async Task<PositionDto> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Deleting position with ID: {PositionId}", id);

        var position = await _positionRepository.GetByIdAsync(id, cancellationToken);
        if (position == null)
        {
            _logger.LogWarning("Position with ID {PositionId} not found", id);
            throw new KeyNotFoundException($"Position with ID {id} not found");
        }

        await _positionRepository.DeleteAsync(position, cancellationToken);

        _logger.LogInformation("Successfully deleted position with ID: {PositionId}", id);
        return _mapper.Map<PositionDto>(position);
    }

    public async Task<PositionDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting position by ID: {PositionId}", id);

        var position = await _positionRepository.GetByIdAsync(id, cancellationToken);
        if (position == null)
        {
            _logger.LogWarning("Position with ID {PositionId} not found", id);
            throw new KeyNotFoundException($"Position with ID {id} not found");
        }

        return _mapper.Map<PositionDto>(position);
    }

    public async Task<PagedResult<PositionListDto>> GetPagedAsync(PositionSearchDto searchDto, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting paged positions with search term: {SearchTerm}", searchDto.SearchTerm);

        var result = await _positionRepository.GetPagedAsync(
            searchDto.PageNumber,
            searchDto.PageSize,
            searchDto.SearchTerm,
            searchDto.DepartmentId,
            searchDto.Level,
            searchDto.IsManagement,
            searchDto.SortBy,
            searchDto.SortDescending,
            cancellationToken);

        var positionListDtos = _mapper.Map<List<PositionListDto>>(result.Items);

        return new PagedResult<PositionListDto>(positionListDtos, result.TotalCount, result.PageNumber, result.PageSize);
    }

    public async Task<PositionDto> UpdateAsync(int id, UpdatePositionDto updateDto, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Updating position with ID: {PositionId}", id);

        var position = await _positionRepository.GetByIdAsync(id, cancellationToken);
        if (position == null)
        {
            _logger.LogWarning("Position with ID {PositionId} not found", id);
            throw new KeyNotFoundException($"Position with ID {id} not found");
        }

        if (position.Code != updateDto.Code && await _positionRepository.ExistsByCodeAsync(updateDto.Code, cancellationToken))
        {
            _logger.LogWarning("Position with code {PositionCode} already exists", updateDto.Code);
            throw new InvalidOperationException($"Position with code {updateDto.Code} already exists");
        }

        _mapper.Map(updateDto, position);
        var updatedPosition = await _positionRepository.UpdateAsync(position, cancellationToken);

        _logger.LogInformation("Successfully updated position with ID: {PositionId}", id);
        return _mapper.Map<PositionDto>(updatedPosition);
    }

    public async Task<List<PositionDto>> GetByDepartmentIdAsync(int departmentId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting positions by department ID: {DepartmentId}", departmentId);

        var positions = await _positionRepository.GetByDepartmentIdAsync(departmentId, cancellationToken);
        return _mapper.Map<List<PositionDto>>(positions);
    }
}





