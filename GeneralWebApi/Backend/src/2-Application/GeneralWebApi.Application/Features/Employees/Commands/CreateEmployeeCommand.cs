using GeneralWebApi.DTOs.Employee;
using MediatR;

namespace GeneralWebApi.Application.Features.Employees.Commands;

public class CreateEmployeeCommand : IRequest<EmployeeDto>
{
    public CreateEmployeeDto CreateEmployeeDto { get; set; } = null!;
}