using GeneralWebApi.Application.Features.Employees.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Employee;
using MediatR;

namespace GeneralWebApi.Application.Features.Employees.Handlers;

public class GetManagersLookupQueryHandler : IRequestHandler<GetManagersLookupQuery, List<ManagerLookupDto>>
{
    private readonly IEmployeeService _employeeService;

    public GetManagersLookupQueryHandler(IEmployeeService employeeService)
    {
        _employeeService = employeeService;
    }

    public async Task<List<ManagerLookupDto>> Handle(GetManagersLookupQuery request, CancellationToken cancellationToken)
    {
        return await _employeeService.GetManagersAsync(
            request.SearchTerm,
            request.ExcludeEmployeeId,
            request.MaxResults,
            cancellationToken);
    }
}

