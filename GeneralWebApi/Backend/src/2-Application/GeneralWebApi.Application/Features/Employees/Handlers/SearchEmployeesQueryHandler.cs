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
        // Set PageSize to max to get all matching employees (no pagination for search)
        var searchDto = new EmployeeSearchDto
        {
            SearchTerm = request.EmployeeSearchDto.SearchTerm,
            DepartmentId = request.EmployeeSearchDto.DepartmentId,
            PositionId = request.EmployeeSearchDto.PositionId,
            EmploymentStatus = request.EmployeeSearchDto.EmploymentStatus,
            HireDateFrom = request.EmployeeSearchDto.HireDateFrom,
            HireDateTo = request.EmployeeSearchDto.HireDateTo,
            FirstName = request.EmployeeSearchDto.FirstName,
            LastName = request.EmployeeSearchDto.LastName,
            Email = request.EmployeeSearchDto.Email,
            EmployeeNumber = request.EmployeeSearchDto.EmployeeNumber,
            Phone = request.EmployeeSearchDto.Phone,
            PageNumber = 1,
            PageSize = int.MaxValue, // Get all matching employees
            SortBy = request.EmployeeSearchDto.SortBy,
            SortDescending = request.EmployeeSearchDto.SortDescending,
        };

        var result = await _employeeService.GetPagedAsync(searchDto, cancellationToken);
        return result.Items.ToList();
    }
}

