using GeneralWebApi.Application.Features.Permissions.Roles.Commands;
using GeneralWebApi.Application.Features.Permissions.Roles.Queries;
using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Controllers.Base;
using GeneralWebApi.DTOs.Permissions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GeneralWebApi.WebApi.Controllers.v1;

/// <summary>
/// Roles management controller
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class RolesController : BaseController
{
    private readonly IMediator _mediator;

    public RolesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get all roles
    /// </summary>
    /// <param name="searchDto">Search criteria</param>
    /// <returns>List of roles</returns>
    [HttpGet]
    [Authorize(Policy = "ManagerOrAdmin")]
    public async Task<ActionResult<ApiResponse<List<RoleListDto>>>> GetRoles([FromQuery] RoleSearchDto? searchDto)
    {
        var query = new GetRolesQuery { SearchDto = searchDto };
        var result = await _mediator.Send(query);
        return Ok(ApiResponse<List<RoleListDto>>.SuccessResult(result, "Roles retrieved successfully"));
    }

    /// <summary>
    /// Get role by ID
    /// </summary>
    /// <param name="id">Role ID</param>
    /// <returns>Role details</returns>
    [HttpGet("{id}")]
    [Authorize(Policy = "ManagerOrAdmin")]
    public async Task<ActionResult<ApiResponse<RoleDto>>> GetRole(int id)
    {
        var query = new GetRoleByIdQuery { Id = id };
        var result = await _mediator.Send(query);

        if (result == null)
        {
            return NotFound(ApiResponse<RoleDto>.NotFound($"Role with ID {id} not found"));
        }

        return Ok(ApiResponse<RoleDto>.SuccessResult(result, "Role retrieved successfully"));
    }

    /// <summary>
    /// Create new role
    /// </summary>
    /// <param name="createRoleDto">Role creation data</param>
    /// <returns>Created role</returns>
    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<ApiResponse<RoleDto>>> CreateRole([FromBody] CreateRoleDto createRoleDto)
    {
        var command = new CreateRoleCommand { CreateRoleDto = createRoleDto };
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetRole), new { id = result.Id },
            ApiResponse<RoleDto>.SuccessResult(result, "Role created successfully"));
    }

    /// <summary>
    /// Update role
    /// </summary>
    /// <param name="id">Role ID</param>
    /// <param name="updateRoleDto">Role update data</param>
    /// <returns>Updated role</returns>
    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<ApiResponse<RoleDto>>> UpdateRole(int id, [FromBody] UpdateRoleDto updateRoleDto)
    {
        var command = new UpdateRoleCommand { Id = id, UpdateRoleDto = updateRoleDto };
        var result = await _mediator.Send(command);
        return Ok(ApiResponse<RoleDto>.SuccessResult(result, "Role updated successfully"));
    }

    /// <summary>
    /// Delete role
    /// </summary>
    /// <param name="id">Role ID</param>
    /// <returns>Deletion result</returns>
    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteRole(int id)
    {
        var command = new DeleteRoleCommand { Id = id };
        var result = await _mediator.Send(command);

        if (!result)
        {
            return NotFound(ApiResponse<bool>.NotFound($"Role with ID {id} not found"));
        }

        return Ok(ApiResponse<bool>.SuccessResult(true, "Role deleted successfully"));
    }

    /// <summary>
    /// Get roles assigned to an employee
    /// </summary>
    /// <param name="employeeId">Employee ID</param>
    /// <returns>List of employee roles</returns>
    [HttpGet("employee/{employeeId}")]
    [Authorize(Policy = "ManagerOrAdmin")]
    public async Task<ActionResult<ApiResponse<List<RoleListDto>>>> GetRolesByEmployee(int employeeId)
    {
        var query = new GetRolesByEmployeeQuery { EmployeeId = employeeId };
        var result = await _mediator.Send(query);
        return Ok(ApiResponse<List<RoleListDto>>.SuccessResult(result, "Employee roles retrieved successfully"));
    }

    /// <summary>
    /// Assign role to employee
    /// </summary>
    /// <param name="assignRoleDto">Role assignment data</param>
    /// <returns>Assignment result</returns>
    [HttpPost("assign")]
    [Authorize(Policy = "ManagerOrAdmin")]
    public async Task<ActionResult<ApiResponse<EmployeeRoleDto>>> AssignRoleToEmployee([FromBody] AssignRoleToEmployeeDto assignRoleDto)
    {
        var command = new AssignRoleToEmployeeCommand { AssignRoleToEmployeeDto = assignRoleDto };
        var result = await _mediator.Send(command);
        return Ok(ApiResponse<EmployeeRoleDto>.SuccessResult(result, "Role assigned to employee successfully"));
    }

    /// <summary>
    /// Remove role from employee
    /// </summary>
    /// <param name="employeeId">Employee ID</param>
    /// <param name="roleId">Role ID</param>
    /// <returns>Removal result</returns>
    [HttpDelete("employee/{employeeId}/role/{roleId}")]
    [Authorize(Policy = "ManagerOrAdmin")]
    public async Task<ActionResult<ApiResponse<bool>>> RemoveRoleFromEmployee(int employeeId, int roleId)
    {
        var command = new RemoveRoleFromEmployeeCommand { EmployeeId = employeeId, RoleId = roleId };
        var result = await _mediator.Send(command);

        if (!result)
        {
            return NotFound(ApiResponse<bool>.NotFound($"Role assignment not found"));
        }

        return Ok(ApiResponse<bool>.SuccessResult(true, "Role removed from employee successfully"));
    }

    /// <summary>
    /// Get employee role assignments with search
    /// </summary>
    /// <param name="searchDto">Search criteria</param>
    /// <returns>List of employee role assignments</returns>
    [HttpGet("assignments")]
    [Authorize(Policy = "ManagerOrAdmin")]
    public async Task<ActionResult<ApiResponse<List<EmployeeRoleDto>>>> GetEmployeeRoleAssignments([FromQuery] EmployeeRoleSearchDto? searchDto)
    {
        var query = new GetEmployeeRolesSearchQuery { SearchDto = searchDto };
        var result = await _mediator.Send(query);
        return Ok(ApiResponse<List<EmployeeRoleDto>>.SuccessResult(result, "Employee role assignments retrieved successfully"));
    }
}
