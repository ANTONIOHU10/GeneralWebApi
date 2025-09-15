using AutoMapper;
using GeneralWebApi.Application.Features.Employees.Queries;
using GeneralWebApi.Application.Interfaces;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Employee;
using MediatR;

namespace GeneralWebApi.Application.Features.Employees.Handlers;

public class GetEmployeesQueryHandler : IRequestHandler<GetEmployeesQuery, PagedResult<EmployeeListDto>>
{
    private readonly IEmployeeService _employeeService;

    public GetEmployeesQueryHandler(IEmployeeService employeeService)
    {
        _employeeService = employeeService;
    }
    public async Task<PagedResult<EmployeeListDto>> Handle(GetEmployeesQuery request, CancellationToken cancellationToken)
    {
        return await _employeeService.GetPagedAsync(request.EmployeeSearchDto, cancellationToken);
    }
}