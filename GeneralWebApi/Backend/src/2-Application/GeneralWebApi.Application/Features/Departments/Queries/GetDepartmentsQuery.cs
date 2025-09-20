using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Department;
using MediatR;

namespace GeneralWebApi.Application.Features.Departments.Queries;

public class GetDepartmentsQuery : IRequest<PagedResult<DepartmentListDto>>
{
    public DepartmentSearchDto DepartmentSearchDto { get; set; } = null!;
}

