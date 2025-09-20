using GeneralWebApi.Application.Features.Departments.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Department;
using MediatR;

namespace GeneralWebApi.Application.Features.Departments.Handlers;

public class GetDepartmentsByParentQueryHandler : IRequestHandler<GetDepartmentsByParentQuery, List<DepartmentDto>>
{
    private readonly IDepartmentService _departmentService;

    public GetDepartmentsByParentQueryHandler(IDepartmentService departmentService)
    {
        _departmentService = departmentService;
    }

    public async Task<List<DepartmentDto>> Handle(GetDepartmentsByParentQuery request, CancellationToken cancellationToken)
    {
        return await _departmentService.GetByParentIdAsync(request.ParentId, cancellationToken);
    }
}





