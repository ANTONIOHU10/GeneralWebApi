using GeneralWebApi.Application.Features.Employees.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Employee;
using MediatR;

namespace GeneralWebApi.Application.Features.Employees.Handlers;

public class SearchEmployeesQueryHandler : IRequestHandler<SearchEmployeesQuery, PagedResult<EmployeeDto>>
{
    private readonly IEmployeeService _employeeService;

    public SearchEmployeesQueryHandler(IEmployeeService employeeService)
    {
        _employeeService = employeeService;
    }

    public async Task<PagedResult<EmployeeDto>> Handle(SearchEmployeesQuery request, CancellationToken cancellationToken)
    {
        // Use the incoming search DTO (including its paging settings) to perform a paged search.
        var searchDto = request.EmployeeSearchDto;

        var result = await _employeeService.GetPagedAsync(searchDto, cancellationToken);
        return result;
    }
}

