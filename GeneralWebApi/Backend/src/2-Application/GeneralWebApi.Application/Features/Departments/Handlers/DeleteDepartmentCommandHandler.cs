using GeneralWebApi.Application.Features.Departments.Commands;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Department;
using MediatR;

namespace GeneralWebApi.Application.Features.Departments.Handlers;

public class DeleteDepartmentCommandHandler : IRequestHandler<DeleteDepartmentCommand, DepartmentDto>
{
    private readonly IDepartmentService _departmentService;

    public DeleteDepartmentCommandHandler(IDepartmentService departmentService)
    {
        _departmentService = departmentService;
    }

    public async Task<DepartmentDto> Handle(DeleteDepartmentCommand request, CancellationToken cancellationToken)
    {
        return await _departmentService.DeleteAsync(request.Id, cancellationToken);
    }
}





