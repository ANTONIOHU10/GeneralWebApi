using GeneralWebApi.DTOs.Employee;
using MediatR;

namespace GeneralWebApi.Application.Features.Employees.Queries;

public class GetEmployeesByDepartmentQuery : IRequest<List<EmployeeListDto>>
{
    public int DepartmentId { get; set; }
}