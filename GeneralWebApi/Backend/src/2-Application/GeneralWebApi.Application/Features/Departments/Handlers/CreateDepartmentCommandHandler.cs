using GeneralWebApi.Application.Features.Departments.Commands;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Department;
using MediatR;

namespace GeneralWebApi.Application.Features.Departments.Handlers;

public class CreateDepartmentCommandHandler : IRequestHandler<CreateDepartmentCommand, DepartmentDto>
{
    private readonly IDepartmentService _departmentService;

    public CreateDepartmentCommandHandler(IDepartmentService departmentService)
    {
        _departmentService = departmentService;
    }

    public async Task<DepartmentDto> Handle(CreateDepartmentCommand request, CancellationToken cancellationToken)
    {
        return await _departmentService.CreateAsync(request.CreateDepartmentDto, cancellationToken);
    }
}

