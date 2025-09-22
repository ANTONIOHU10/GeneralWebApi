using GeneralWebApi.Application.Features.Permissions.Permissions.Commands;
using GeneralWebApi.Application.Features.Permissions.Permissions.Queries;
using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Controllers.Base;
using GeneralWebApi.DTOs.Permissions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GeneralWebApi.WebApi.Controllers.v1;

/// <summary>
/// Permissions management controller
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class PermissionsController : BaseController
{
    private readonly IMediator _mediator;

    public PermissionsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get all permissions
    /// </summary>
    /// <param name="searchDto">Search criteria</param>
    /// <returns>List of permissions</returns>
    [HttpGet]
    [Authorize(Policy = "ManagerOrAdmin")]
    public async Task<ActionResult<ApiResponse<List<PermissionListDto>>>> GetPermissions([FromQuery] PermissionSearchDto? searchDto)
    {
        var query = new GetPermissionsQuery { SearchDto = searchDto };
        var result = await _mediator.Send(query);
        return Ok(ApiResponse<List<PermissionListDto>>.SuccessResult(result, "Permissions retrieved successfully"));
    }

    /// <summary>
    /// Get permission by ID
    /// </summary>
    /// <param name="id">Permission ID</param>
    /// <returns>Permission details</returns>
    [HttpGet("{id}")]
    [Authorize(Policy = "ManagerOrAdmin")]
    public async Task<ActionResult<ApiResponse<PermissionDto>>> GetPermission(int id)
    {
        var query = new GetPermissionByIdQuery { Id = id };
        var result = await _mediator.Send(query);

        if (result == null)
        {
            return NotFound(ApiResponse<PermissionDto>.NotFound($"Permission with ID {id} not found"));
        }

        return Ok(ApiResponse<PermissionDto>.SuccessResult(result, "Permission retrieved successfully"));
    }

    /// <summary>
    /// Create new permission
    /// </summary>
    /// <param name="createPermissionDto">Permission creation data</param>
    /// <returns>Created permission</returns>
    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<ApiResponse<PermissionDto>>> CreatePermission([FromBody] CreatePermissionDto createPermissionDto)
    {
        var command = new CreatePermissionCommand { CreatePermissionDto = createPermissionDto };
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetPermission), new { id = result.Id },
            ApiResponse<PermissionDto>.SuccessResult(result, "Permission created successfully"));
    }

    /// <summary>
    /// Update permission
    /// </summary>
    /// <param name="id">Permission ID</param>
    /// <param name="updatePermissionDto">Permission update data</param>
    /// <returns>Updated permission</returns>
    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<ApiResponse<PermissionDto>>> UpdatePermission(int id, [FromBody] UpdatePermissionDto updatePermissionDto)
    {
        var command = new UpdatePermissionCommand { Id = id, UpdatePermissionDto = updatePermissionDto };
        var result = await _mediator.Send(command);
        return Ok(ApiResponse<PermissionDto>.SuccessResult(result, "Permission updated successfully"));
    }

    /// <summary>
    /// Delete permission
    /// </summary>
    /// <param name="id">Permission ID</param>
    /// <returns>Deletion result</returns>
    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<ApiResponse<bool>>> DeletePermission(int id)
    {
        var command = new DeletePermissionCommand { Id = id };
        var result = await _mediator.Send(command);

        if (!result)
        {
            return NotFound(ApiResponse<bool>.NotFound($"Permission with ID {id} not found"));
        }

        return Ok(ApiResponse<bool>.SuccessResult(true, "Permission deleted successfully"));
    }

    /// <summary>
    /// Get permissions assigned to a role
    /// </summary>
    /// <param name="roleId">Role ID</param>
    /// <returns>List of role permissions</returns>
    [HttpGet("role/{roleId}")]
    [Authorize(Policy = "ManagerOrAdmin")]
    public async Task<ActionResult<ApiResponse<List<PermissionListDto>>>> GetPermissionsByRole(int roleId)
    {
        var query = new GetPermissionsByRoleQuery { RoleId = roleId };
        var result = await _mediator.Send(query);
        return Ok(ApiResponse<List<PermissionListDto>>.SuccessResult(result, "Role permissions retrieved successfully"));
    }
}
