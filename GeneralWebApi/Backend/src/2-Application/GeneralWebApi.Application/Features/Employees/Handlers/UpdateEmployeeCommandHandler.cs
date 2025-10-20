using GeneralWebApi.Application.Features.Employees.Commands;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Employee;
using MediatR;

namespace GeneralWebApi.Application.Features.Employees.Handlers;

public class UpdateEmployeeCommandHandler : IRequestHandler<UpdateEmployeeCommand, EmployeeDto>
{
    private readonly IEmployeeService _employeeService;

    public UpdateEmployeeCommandHandler(IEmployeeService employeeService)
    {
        _employeeService = employeeService;
    }

    public async Task<EmployeeDto> Handle(UpdateEmployeeCommand request, CancellationToken cancellationToken)
    {
        return await _employeeService.UpdateAsync(request.UpdateEmployeeDto.Id, request.UpdateEmployeeDto, cancellationToken);
    }
}