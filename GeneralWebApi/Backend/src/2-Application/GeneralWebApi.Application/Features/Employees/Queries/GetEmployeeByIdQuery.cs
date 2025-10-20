using GeneralWebApi.DTOs.Employee;
using MediatR;

namespace GeneralWebApi.Application.Features.Employees.Queries;

public class GetEmployeeByIdQuery : IRequest<EmployeeDto>
{
    public int Id { get; set; }
}
