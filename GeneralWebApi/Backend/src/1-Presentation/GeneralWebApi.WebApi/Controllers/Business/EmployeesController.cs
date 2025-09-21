using GeneralWebApi.Application.Features.Employees.Commands;
using GeneralWebApi.Application.Features.Employees.Queries;
using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Controllers.Base;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Employee;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GeneralWebApi.Controllers.Business;

/// <summary>
/// Controller for managing employee data
/// Requires appropriate authorization for different operations
/// </summary>
[Authorize] // Require authentication for all endpoints
public class EmployeesController : BaseController
{
    private readonly IMediator _mediator;

    public EmployeesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get paginated list of employees
    /// </summary>
    /// <param name="searchDto">Search criteria</param>
    /// <returns>Paginated employee list</returns>
    [HttpGet]
    [Authorize(Policy = "AllRoles")] // All authenticated users can view employees
    public async Task<ActionResult<ApiResponse<PagedResult<EmployeeListDto>>>> GetEmployees([FromQuery] EmployeeSearchDto searchDto)
    {
        return await ValidateAndExecuteAsync(searchDto, async (validatedDto) =>
        {
            var query = new GetEmployeesQuery { EmployeeSearchDto = validatedDto };
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<PagedResult<EmployeeListDto>>.SuccessResult(result, "Employees retrieved successfully"));
        });
    }

    /// <summary>
    /// Get employee by ID
    /// </summary>
    /// <param name="id">Employee ID</param>
    /// <returns>Employee details</returns>
    [HttpGet("{id}")]
    [Authorize(Policy = "AllRoles")] // All authenticated users can view employee details
    public async Task<ActionResult<ApiResponse<EmployeeDto>>> GetEmployee(int id)
    {
        return await ValidateAndExecuteAsync(id, async (validatedId) =>
        {
            var query = new GetEmployeeByIdQuery { Id = validatedId };
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<EmployeeDto>.SuccessResult(result, "Employee retrieved successfully"));
        });
    }

    /// <summary>
    /// Create new employee
    /// </summary>
    /// <param name="createDto">Employee creation data</param>
    /// <returns>Created employee</returns>
    [HttpPost]
    [Authorize(Policy = "ManagerOrAdmin")] // Only managers and admins can create employees
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

    /// <summary>
    /// Update employee information
    /// </summary>
    /// <param name="updateDto">Employee update data</param>
    /// <returns>Updated employee</returns>
    [HttpPut("{id}")]
    [Authorize(Policy = "ManagerOrAdmin")] // Only managers and admins can update employees
    public async Task<ActionResult<ApiResponse<EmployeeDto>>> UpdateEmployee([FromBody] UpdateEmployeeDto updateDto)
    {
        return await ValidateAndExecuteAsync(updateDto, async (validatedDto) =>
        {
            var command = new UpdateEmployeeCommand { UpdateEmployeeDto = validatedDto };
            var result = await _mediator.Send(command);
            return Ok(ApiResponse<EmployeeDto>.SuccessResult(result, "Employee updated successfully"));
        });
    }

    /// <summary>
    /// Delete employee
    /// </summary>
    /// <param name="id">Employee ID</param>
    /// <returns>Deleted employee</returns>
    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")] // Only admins can delete employees
    public async Task<ActionResult<ApiResponse<EmployeeDto>>> DeleteEmployee(int id)
    {
        return await ValidateAndExecuteAsync(id, async (validatedId) =>
        {
            var command = new DeleteEmployeeCommand { Id = validatedId };
            var result = await _mediator.Send(command);
            return Ok(ApiResponse<EmployeeDto>.SuccessResult(result, "Employee deleted successfully"));
        });
    }

    /// <summary>
    /// Get employees by department
    /// </summary>
    /// <param name="departmentId">Department ID</param>
    /// <returns>List of employees in the department</returns>
    [HttpGet("department/{departmentId}")]
    [Authorize(Policy = "AllRoles")] // All authenticated users can view department employees
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