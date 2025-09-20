using GeneralWebApi.Application.Features.Departments.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Department;
using MediatR;

namespace GeneralWebApi.Application.Features.Departments.Handlers;

public class GetDepartmentHierarchyQueryHandler : IRequestHandler<GetDepartmentHierarchyQuery, List<DepartmentDto>>
{
    private readonly IDepartmentService _departmentService;

    public GetDepartmentHierarchyQueryHandler(IDepartmentService departmentService)
    {
        _departmentService = departmentService;
    }

    public async Task<List<DepartmentDto>> Handle(GetDepartmentHierarchyQuery request, CancellationToken cancellationToken)
    {
        return await _departmentService.GetHierarchyAsync(cancellationToken);
    }
}



