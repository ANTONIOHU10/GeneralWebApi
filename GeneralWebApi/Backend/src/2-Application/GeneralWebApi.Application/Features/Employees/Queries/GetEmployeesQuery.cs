using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Employee;

using MediatR;

namespace GeneralWebApi.Application.Features.Employees.Queries;

public class GetEmployeesQuery : IRequest<PagedResult<EmployeeDto>>
{
    public EmployeeSearchDto EmployeeSearchDto { get; set; } = null!;
}