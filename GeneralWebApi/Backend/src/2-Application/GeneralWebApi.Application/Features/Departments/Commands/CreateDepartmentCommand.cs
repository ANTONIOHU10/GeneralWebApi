using GeneralWebApi.DTOs.Department;
using MediatR;

namespace GeneralWebApi.Application.Features.Departments.Commands;

public class CreateDepartmentCommand : IRequest<DepartmentDto>
{
    public CreateDepartmentDto CreateDepartmentDto { get; set; } = null!;
}

