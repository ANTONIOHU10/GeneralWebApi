using GeneralWebApi.Application.Features.Departments.Commands;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Department;
using MediatR;

namespace GeneralWebApi.Application.Features.Departments.Handlers;

public class UpdateDepartmentCommandHandler : IRequestHandler<UpdateDepartmentCommand, DepartmentDto>
{
    private readonly IDepartmentService _departmentService;

    public UpdateDepartmentCommandHandler(IDepartmentService departmentService)
    {
        _departmentService = departmentService;
    }

    public async Task<DepartmentDto> Handle(UpdateDepartmentCommand request, CancellationToken cancellationToken)
    {
        return await _departmentService.UpdateAsync(request.UpdateDepartmentDto.Id, request.UpdateDepartmentDto, cancellationToken);
    }
}

