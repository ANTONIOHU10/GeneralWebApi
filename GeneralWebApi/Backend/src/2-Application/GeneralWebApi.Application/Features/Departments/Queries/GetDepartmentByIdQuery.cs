using GeneralWebApi.DTOs.Department;
using MediatR;

namespace GeneralWebApi.Application.Features.Departments.Queries;

public class GetDepartmentByIdQuery : IRequest<DepartmentDto>
{
    public int Id { get; set; }
}



