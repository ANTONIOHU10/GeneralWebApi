using GeneralWebApi.DTOs.Department;
using MediatR;

namespace GeneralWebApi.Application.Features.Departments.Queries;

public class GetDepartmentsByParentQuery : IRequest<List<DepartmentDto>>
{
    public int ParentId { get; set; }
}



