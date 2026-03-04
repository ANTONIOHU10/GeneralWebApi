using GeneralWebApi.Application.Features.Employees.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Employee;
using MediatR;

namespace GeneralWebApi.Application.Features.Employees.Handlers;

public class SearchEmployeesQueryHandler : IRequestHandler<SearchEmployeesQuery, List<EmployeeDto>>
{
    private readonly IEmployeeService _employeeService;

    public SearchEmployeesQueryHandler(IEmployeeService employeeService)
    {
        _employeeService = employeeService;
    }

    public async Task<List<EmployeeDto>> Handle(SearchEmployeesQuery request, CancellationToken cancellationToken)
    {
        // Use the incoming search DTO (including its paging settings) to perform a paged search.
        // This ensures we do not accidentally load all matching employees into memory.
        var searchDto = request.EmployeeSearchDto;

        var result = await _employeeService.GetPagedAsync(searchDto, cancellationToken);
        return result.Items.ToList();
    }
}

