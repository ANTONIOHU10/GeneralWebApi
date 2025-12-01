using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Controllers.Base;
using GeneralWebApi.DTOs.Users;
using GeneralWebApi.Integration.Repository.BasesRepository;
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
    private readonly IUserRepository _userRepository;
    private readonly ILogger<UsersController> _logger;

    public UsersController(IUserRepository userRepository, ILogger<UsersController> logger)
    {
        _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Get list of users with employee information
    /// </summary>
    /// <returns>List of users with employee information</returns>
    [HttpGet("with-employee")]
    [Authorize(Policy = "AllRoles")] // All authenticated users can view users
    public async Task<ActionResult<ApiResponse<List<UserWithEmployeeDto>>>> GetUsersWithEmployee()
    {
        try
        {
            var users = await _userRepository.GetUsersWithEmployeeAsync();
            return Ok(ApiResponse<List<UserWithEmployeeDto>>.SuccessResult(users, "Users retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving users with employee information");
            return InternalServerError<List<UserWithEmployeeDto>>("An error occurred while retrieving users");
        }
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
        try
        {
            var user = await _userRepository.GetUserWithEmployeeAsync(id);
            if (user == null)
            {
                return NotFound<UserWithEmployeeDto>("User not found");
            }
            return Ok(ApiResponse<UserWithEmployeeDto>.SuccessResult(user, "User retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user {UserId} with employee information", id);
            return InternalServerError<UserWithEmployeeDto>("An error occurred while retrieving user");
        }
    }
}

