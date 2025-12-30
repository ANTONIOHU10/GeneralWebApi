using GeneralWebApi.Application.Features.Employees.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Employee;
using MediatR;

namespace GeneralWebApi.Application.Features.Employees.Handlers;

public class GetEmployeeHierarchyQueryHandler : IRequestHandler<GetEmployeeHierarchyQuery, EmployeeHierarchyDto?>
{
    private readonly IEmployeeService _employeeService;

    public GetEmployeeHierarchyQueryHandler(IEmployeeService employeeService)
    {
        _employeeService = employeeService;
    }

    public async Task<EmployeeHierarchyDto?> Handle(GetEmployeeHierarchyQuery request, CancellationToken cancellationToken)
    {
        return await _employeeService.GetHierarchyAsync(request.EmployeeId, cancellationToken);
    }
}

