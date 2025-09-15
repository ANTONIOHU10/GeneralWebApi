using GeneralWebApi.Application.Features.Employees.Commands;
using GeneralWebApi.Application.Features.Employees.Queries;
using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Controllers.Base;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Employee;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace GeneralWebApi.Controllers.Business;

public class EmployeesController : BaseController
{
    private readonly IMediator _mediator;

    public EmployeesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<EmployeeListDto>>>> GetEmployees([FromQuery] EmployeeSearchDto searchDto)
    {
        return await ValidateAndExecuteAsync(searchDto, async (validatedDto) =>
        {
            var query = new GetEmployeesQuery { EmployeeSearchDto = validatedDto };
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<PagedResult<EmployeeListDto>>.SuccessResult(result, "Employees retrieved successfully"));
        });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<EmployeeDto>>> GetEmployee(int id)
    {
        return await ValidateAndExecuteAsync(id, async (validatedId) =>
        {
            var query = new GetEmployeeByIdQuery { Id = validatedId };
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<EmployeeDto>.SuccessResult(result, "Employee retrieved successfully"));
        });
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<EmployeeDto>>> CreateEmployee([FromBody] CreateEmployeeDto createDto)
    {
        return await ValidateAndExecuteAsync(createDto, async (validatedDto) =>
        {
            var command = new CreateEmployeeCommand { CreateEmployeeDto = validatedDto };
            var result = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetEmployee), new { id = result.Id },
                ApiResponse<EmployeeDto>.SuccessResult(result, "Employee created successfully"));
        });
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<EmployeeDto>>> UpdateEmployee([FromBody] UpdateEmployeeDto updateDto)
    {
        return await ValidateAndExecuteAsync(updateDto, async (validatedDto) =>
        {
            var command = new UpdateEmployeeCommand { UpdateEmployeeDto = validatedDto };
            var result = await _mediator.Send(command);
            return Ok(ApiResponse<EmployeeDto>.SuccessResult(result, "Employee updated successfully"));
        });
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<EmployeeDto>>> DeleteEmployee(int id)
    {
        return await ValidateAndExecuteAsync(id, async (validatedId) =>
        {
            var command = new DeleteEmployeeCommand { Id = validatedId };
            var result = await _mediator.Send(command);
            return Ok(ApiResponse<EmployeeDto>.SuccessResult(result, "Employee deleted successfully"));
        });
    }

    [HttpGet("department/{departmentId}")]
    public async Task<ActionResult<ApiResponse<List<EmployeeListDto>>>> GetEmployeesByDepartment(int departmentId)
    {
        return await ValidateAndExecuteAsync(departmentId, async (validatedId) =>
        {
            var query = new GetEmployeesByDepartmentQuery { DepartmentId = validatedId };
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<List<EmployeeListDto>>.SuccessResult(result, "Department employees retrieved successfully"));
        });
    }
}