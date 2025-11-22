using GeneralWebApi.DTOs.Department;
using MediatR;

namespace GeneralWebApi.Application.Features.Departments.Queries;

public class SearchDepartmentsQuery : IRequest<List<DepartmentDto>>
{
    public DepartmentSearchDto DepartmentSearchDto { get; set; } = null!;
}


