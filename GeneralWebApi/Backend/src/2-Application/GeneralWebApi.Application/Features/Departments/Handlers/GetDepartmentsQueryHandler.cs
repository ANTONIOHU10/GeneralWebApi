using GeneralWebApi.Application.Features.Departments.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Department;
using MediatR;

namespace GeneralWebApi.Application.Features.Departments.Handlers;

public class GetDepartmentsQueryHandler : IRequestHandler<GetDepartmentsQuery, PagedResult<DepartmentListDto>>
{
    private readonly IDepartmentService _departmentService;

    public GetDepartmentsQueryHandler(IDepartmentService departmentService)
    {
        _departmentService = departmentService;
    }

    public async Task<PagedResult<DepartmentListDto>> Handle(GetDepartmentsQuery request, CancellationToken cancellationToken)
    {
        return await _departmentService.GetPagedAsync(request.DepartmentSearchDto, cancellationToken);
    }
}





