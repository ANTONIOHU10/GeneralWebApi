using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Department;

namespace GeneralWebApi.Application.Services;

public interface IDepartmentService
{
    Task<PagedResult<DepartmentListDto>> GetPagedAsync(DepartmentSearchDto searchDto, CancellationToken cancellationToken = default);
    Task<DepartmentDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<DepartmentDto> CreateAsync(CreateDepartmentDto createDto, CancellationToken cancellationToken = default);
    Task<DepartmentDto> UpdateAsync(int id, UpdateDepartmentDto updateDto, CancellationToken cancellationToken = default);
    Task<DepartmentDto> DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<List<DepartmentDto>> GetHierarchyAsync(CancellationToken cancellationToken = default);
    Task<List<DepartmentDto>> GetByParentIdAsync(int parentId, CancellationToken cancellationToken = default);
}

