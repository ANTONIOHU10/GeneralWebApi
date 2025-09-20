using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Position;

namespace GeneralWebApi.Application.Services;

public interface IPositionService
{
    Task<PagedResult<PositionListDto>> GetPagedAsync(PositionSearchDto searchDto, CancellationToken cancellationToken = default);
    Task<PositionDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<PositionDto> CreateAsync(CreatePositionDto createDto, CancellationToken cancellationToken = default);
    Task<PositionDto> UpdateAsync(int id, UpdatePositionDto updateDto, CancellationToken cancellationToken = default);
    Task<PositionDto> DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<List<PositionDto>> GetByDepartmentIdAsync(int departmentId, CancellationToken cancellationToken = default);
}

