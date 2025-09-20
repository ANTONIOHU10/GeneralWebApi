using GeneralWebApi.DTOs.Department;
using MediatR;

namespace GeneralWebApi.Application.Features.Departments.Commands;

public class UpdateDepartmentCommand : IRequest<DepartmentDto>
{
    public UpdateDepartmentDto UpdateDepartmentDto { get; set; } = null!;
}



