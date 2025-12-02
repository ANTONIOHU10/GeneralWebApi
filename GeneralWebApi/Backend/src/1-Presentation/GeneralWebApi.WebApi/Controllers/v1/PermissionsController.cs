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
        return await ValidateAndExecuteAsync(searchDto ?? new PermissionSearchDto(), async (validatedSearch) =>
        {
            var query = new GetPermissionsQuery { SearchDto = validatedSearch };
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<List<PermissionListDto>>.SuccessResult(result, "Permissions retrieved successfully"));
        });
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
        return await ValidateAndExecuteAsync(id, async (validatedId) =>
        {
            var query = new GetPermissionByIdQuery { Id = validatedId };
            var result = await _mediator.Send(query);
            // Service throws KeyNotFoundException if not found, handled by global exception handler
            return Ok(ApiResponse<PermissionDto>.SuccessResult(result, "Permission retrieved successfully"));
        });
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
        return await ValidateAndExecuteAsync(createPermissionDto, async (validatedDto) =>
        {
            var command = new CreatePermissionCommand { CreatePermissionDto = validatedDto };
            var result = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetPermission), new { id = result.Id },
                ApiResponse<PermissionDto>.SuccessResult(result, "Permission created successfully"));
        });
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
        return await ValidateAndExecuteAsync(updatePermissionDto, async (validatedDto) =>
        {
            var command = new UpdatePermissionCommand { Id = id, UpdatePermissionDto = validatedDto };
            var result = await _mediator.Send(command);
            return Ok(ApiResponse<PermissionDto>.SuccessResult(result, "Permission updated successfully"));
        });
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
        return await ValidateAndExecuteAsync(id, async (validatedId) =>
        {
            var command = new DeletePermissionCommand { Id = validatedId };
            var result = await _mediator.Send(command);
            // Service throws KeyNotFoundException if not found, handled by global exception handler
            return Ok(ApiResponse<bool>.SuccessResult(result, "Permission deleted successfully"));
        });
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
        return await ValidateAndExecuteAsync(roleId, async (validatedRoleId) =>
        {
            var query = new GetPermissionsByRoleQuery { RoleId = validatedRoleId };
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<List<PermissionListDto>>.SuccessResult(result, "Role permissions retrieved successfully"));
        });
    }
}
