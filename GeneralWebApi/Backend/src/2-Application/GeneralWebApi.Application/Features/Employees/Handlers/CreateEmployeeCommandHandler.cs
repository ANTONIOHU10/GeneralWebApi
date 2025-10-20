using AutoMapper;
using GeneralWebApi.Application.Features.Employees.Commands;
using GeneralWebApi.Application.Services;
using GeneralWebApi.Domain.Entities.Anagraphy;
using GeneralWebApi.DTOs.Employee;
using MediatR;

namespace GeneralWebApi.Application.Features.Employees.Handlers;

public class CreateEmployeeCommandHandler : IRequestHandler<CreateEmployeeCommand, EmployeeDto>
{
    private readonly IEmployeeService _employeeService;

    public CreateEmployeeCommandHandler(IEmployeeService employeeService)
    {
        _employeeService = employeeService;
    }

    public async Task<EmployeeDto> Handle(CreateEmployeeCommand request, CancellationToken cancellationToken)
    {
        return await _employeeService.CreateAsync(request.CreateEmployeeDto, cancellationToken);
    }
}
