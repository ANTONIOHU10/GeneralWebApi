using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Employee;

using MediatR;

namespace GeneralWebApi.Application.Features.Employees.Queries;

public class GetEmployeesQuery : IRequest<PagedResult<EmployeeListDto>>
{
    public EmployeeSearchDto EmployeeSearchDto { get; set; } = null!;
}