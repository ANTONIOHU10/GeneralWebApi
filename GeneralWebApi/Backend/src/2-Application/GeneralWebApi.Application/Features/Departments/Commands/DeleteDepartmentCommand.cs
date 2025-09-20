using GeneralWebApi.DTOs.Department;
using MediatR;

namespace GeneralWebApi.Application.Features.Departments.Commands;

public class DeleteDepartmentCommand : IRequest<DepartmentDto>
{
    public int Id { get; set; }
}



