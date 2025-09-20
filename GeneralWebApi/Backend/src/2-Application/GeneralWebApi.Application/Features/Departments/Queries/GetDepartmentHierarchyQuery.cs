using GeneralWebApi.DTOs.Department;
using MediatR;

namespace GeneralWebApi.Application.Features.Departments.Queries;

public class GetDepartmentHierarchyQuery : IRequest<List<DepartmentDto>>
{
}



