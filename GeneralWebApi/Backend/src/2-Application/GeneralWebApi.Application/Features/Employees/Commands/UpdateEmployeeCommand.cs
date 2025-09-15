using GeneralWebApi.DTOs.Employee;
using MediatR;

namespace GeneralWebApi.Application.Features.Employees.Commands;

public class UpdateEmployeeCommand : IRequest<EmployeeDto>
{
    public UpdateEmployeeDto UpdateEmployeeDto { get; set; } = null!;
}