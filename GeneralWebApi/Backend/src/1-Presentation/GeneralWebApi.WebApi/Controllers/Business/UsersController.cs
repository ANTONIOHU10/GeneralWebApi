using GeneralWebApi.Application.Features.Users.Commands;
using GeneralWebApi.Application.Features.Users.Queries;
using GeneralWebApi.DTOs.Users;
using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Controllers.Base;
using GeneralWebApi.DTOs.Users;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GeneralWebApi.Controllers.Business;

/// <summary>
/// Controller for managing user data
/// Requires appropriate authorization for different operations
/// </summary>
[Authorize] // Require authentication for all endpoints
public class UsersController : BaseController
{
    private readonly IMediator _mediator;

    public UsersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get list of users with employee information
    /// </summary>
    /// <returns>List of users with employee information</returns>
    [HttpGet("with-employee")]
    [Authorize(Policy = "AllRoles")] // All authenticated users can view users
    public async Task<ActionResult<ApiResponse<List<UserWithEmployeeDto>>>> GetUsersWithEmployee()
    {
        return await ValidateAndExecuteAsync(new object(), async (_) =>
        {
            var query = new GetUsersWithEmployeeQuery();
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<List<UserWithEmployeeDto>>.SuccessResult(result, "Users retrieved successfully"));
        });
    }

    /// <summary>
    /// Get user by ID with employee information
    /// </summary>
    /// <param name="id">User ID</param>
    /// <returns>User with employee information</returns>
    [HttpGet("{id}/with-employee")]
    [Authorize(Policy = "AllRoles")]
    public async Task<ActionResult<ApiResponse<UserWithEmployeeDto>>> GetUserWithEmployee(int id)
    {
        return await ValidateAndExecuteAsync(id, async (validatedId) =>
        {
            var query = new GetUserWithEmployeeQuery { UserId = validatedId };
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<UserWithEmployeeDto>.SuccessResult(result, "User retrieved successfully"));
        });
    }

    /// <summary>
    /// Create new user
    /// </summary>
    /// <param name="createRequest">User creation data</param>
    /// <returns>Created user with employee information</returns>
    [HttpPost]
    [Authorize(Policy = "ManagerOrAdmin")] // Only managers and admins can create users
    public async Task<ActionResult<ApiResponse<UserWithEmployeeDto>>> CreateUser([FromBody] CreateUserRequest createRequest)
    {
        return await ValidateAndExecuteAsync(createRequest, async (validatedRequest) =>
        {
            var command = new CreateUserCommand { CreateUserRequest = validatedRequest };
            var result = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetUserWithEmployee), new { id = result.UserId },
                ApiResponse<UserWithEmployeeDto>.SuccessResult(result, "User created successfully"));
        });
    }

    /// <summary>
    /// Update user
    /// </summary>
    /// <param name="id">User ID</param>
    /// <param name="updateRequest">User update data</param>
    /// <returns>Updated user with employee information</returns>
    [HttpPut("{id}")]
    [Authorize(Policy = "ManagerOrAdmin")] // Only managers and admins can update users
    public async Task<ActionResult<ApiResponse<UserWithEmployeeDto>>> UpdateUser(int id, [FromBody] UpdateUserRequest updateRequest)
    {
        return await ValidateAndExecuteAsync(updateRequest, async (validatedRequest) =>
        {
            var command = new UpdateUserCommand { UserId = id, UpdateUserRequest = validatedRequest };
            var result = await _mediator.Send(command);
            return Ok(ApiResponse<UserWithEmployeeDto>.SuccessResult(result, "User updated successfully"));
        });
    }

    /// <summary>
    /// Delete user
    /// </summary>
    /// <param name="id">User ID</param>
    /// <returns>Deletion result</returns>
    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")] // Only admins can delete users
    public async Task<ActionResult<ApiResponse<bool>>> DeleteUser(int id)
    {
        return await ValidateAndExecuteAsync(id, async (validatedId) =>
        {
            var command = new DeleteUserCommand { UserId = validatedId };
            var result = await _mediator.Send(command);
            // Service throws KeyNotFoundException if not found, handled by global exception handler
            return Ok(ApiResponse<bool>.SuccessResult(result, "User deleted successfully"));
        });
    }
}

