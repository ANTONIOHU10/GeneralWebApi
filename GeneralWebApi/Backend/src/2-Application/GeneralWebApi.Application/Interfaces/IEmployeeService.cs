using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Employee;

namespace GeneralWebApi.Application.Interfaces;

public interface IEmployeeService
{
    Task<PagedResult<EmployeeListDto>> GetPagedAsync(EmployeeSearchDto searchDto, CancellationToken cancellationToken = default);
    Task<EmployeeDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<EmployeeDto> CreateAsync(CreateEmployeeDto createDto, CancellationToken cancellationToken = default);
    Task<EmployeeDto> UpdateAsync(int id, UpdateEmployeeDto updateDto, CancellationToken cancellationToken = default);
    Task<EmployeeDto> DeleteAsync(int id, CancellationToken cancellationToken = default);
}