using GeneralWebApi.Application.Features.Employees.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Employee;
using MediatR;

namespace GeneralWebApi.Application.Features.Employees.Handlers;

public class GetEmployeesByDepartmentQueryHandler : IRequestHandler<GetEmployeesByDepartmentQuery, List<EmployeeListDto>>
{
    private readonly IEmployeeService _employeeService;

    public GetEmployeesByDepartmentQueryHandler(IEmployeeService employeeService)
    {
        _employeeService = employeeService;
    }

    public async Task<List<EmployeeListDto>> Handle(GetEmployeesByDepartmentQuery request, CancellationToken cancellationToken)
    {
        // create search conditions
        var searchDto = new EmployeeSearchDto
        {
            DepartmentId = request.DepartmentId,
            PageNumber = 1,
            PageSize = int.MaxValue // 
        };

        var result = await _employeeService.GetPagedAsync(searchDto, cancellationToken);
        return result.Items.ToList();
    }
}