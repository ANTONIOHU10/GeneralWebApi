using GeneralWebApi.DTOs.Employee;
using MediatR;

namespace GeneralWebApi.Application.Features.Employees.Commands;

public class DeleteEmployeeCommand : IRequest<EmployeeDto>
{
    public int Id { get; set; }
}