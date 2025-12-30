using GeneralWebApi.DTOs.Employee;
using MediatR;

namespace GeneralWebApi.Application.Features.Employees.Queries;

public class GetEmployeeHierarchyQuery : IRequest<EmployeeHierarchyDto?>
{
    public int EmployeeId { get; set; }
}

