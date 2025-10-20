using GeneralWebApi.Application.Features.Departments.Commands;
using GeneralWebApi.Application.Features.Departments.Queries;
using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Controllers.Base;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Department;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GeneralWebApi.Controllers.Business;

/// <summary>
/// Controller for managing department data
/// Requires appropriate authorization for different operations
/// </summary>
[Authorize] // Require authentication for all endpoints
public class DepartmentsController : BaseController
{
    private readonly IMediator _mediator;

    public DepartmentsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get paginated list of departments
    /// </summary>
    /// <param name="searchDto">Search criteria</param>
    /// <returns>Paginated department list</returns>
    [HttpGet]
    [Authorize(Policy = "AllRoles")] // All authenticated users can view departments
    public async Task<ActionResult<ApiResponse<PagedResult<DepartmentListDto>>>> GetDepartments([FromQuery] DepartmentSearchDto searchDto)
    {
        return await ValidateAndExecuteAsync(searchDto, async (validatedDto) =>
        {
            var query = new GetDepartmentsQuery { DepartmentSearchDto = validatedDto };
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<PagedResult<DepartmentListDto>>.SuccessResult(result, "Departments retrieved successfully"));
        });
    }

    /// <summary>
    /// Get department by ID
    /// </summary>
    /// <param name="id">Department ID</param>
    /// <returns>Department details</returns>
    [HttpGet("{id}")]
    [Authorize(Policy = "AllRoles")] // All authenticated users can view department details
    public async Task<ActionResult<ApiResponse<DepartmentDto>>> GetDepartment(int id)
    {
        return await ValidateAndExecuteAsync(id, async (validatedId) =>
        {
            var query = new GetDepartmentByIdQuery { Id = validatedId };
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<DepartmentDto>.SuccessResult(result, "Department retrieved successfully"));
        });
    }

    /// <summary>
    /// Create new department
    /// </summary>
    /// <param name="createDto">Department creation data</param>
    /// <returns>Created department</returns>
    [HttpPost]
    [Authorize(Policy = "ManagerOrAdmin")] // Only managers and admins can create departments
    public async Task<ActionResult<ApiResponse<DepartmentDto>>> CreateDepartment([FromBody] CreateDepartmentDto createDto)
    {
        return await ValidateAndExecuteAsync(createDto, async (validatedDto) =>
        {
            var command = new CreateDepartmentCommand { CreateDepartmentDto = validatedDto };
            var result = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetDepartment), new { id = result.Id },
                ApiResponse<DepartmentDto>.SuccessResult(result, "Department created successfully"));
        });
    }

    /// <summary>
    /// Update department information
    /// </summary>
    /// <param name="updateDto">Department update data</param>
    /// <returns>Updated department</returns>
    [HttpPut("{id}")]
    [Authorize(Policy = "ManagerOrAdmin")] // Only managers and admins can update departments
    public async Task<ActionResult<ApiResponse<DepartmentDto>>> UpdateDepartment([FromBody] UpdateDepartmentDto updateDto)
    {
        return await ValidateAndExecuteAsync(updateDto, async (validatedDto) =>
        {
            var command = new UpdateDepartmentCommand { UpdateDepartmentDto = validatedDto };
            var result = await _mediator.Send(command);
            return Ok(ApiResponse<DepartmentDto>.SuccessResult(result, "Department updated successfully"));
        });
    }

    /// <summary>
    /// Delete department
    /// </summary>
    /// <param name="id">Department ID</param>
    /// <returns>Deleted department</returns>
    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")] // Only admins can delete departments
    public async Task<ActionResult<ApiResponse<DepartmentDto>>> DeleteDepartment(int id)
    {
        return await ValidateAndExecuteAsync(id, async (validatedId) =>
        {
            var command = new DeleteDepartmentCommand { Id = validatedId };
            var result = await _mediator.Send(command);
            return Ok(ApiResponse<DepartmentDto>.SuccessResult(result, "Department deleted successfully"));
        });
    }

    /// <summary>
    /// Get department hierarchy
    /// </summary>
    /// <returns>Department hierarchy tree</returns>
    [HttpGet("hierarchy")]
    [Authorize(Policy = "AllRoles")] // All authenticated users can view department hierarchy
    public async Task<ActionResult<ApiResponse<List<DepartmentDto>>>> GetDepartmentHierarchy()
    {
        var query = new GetDepartmentHierarchyQuery();
        var result = await _mediator.Send(query);
        return Ok(ApiResponse<List<DepartmentDto>>.SuccessResult(result, "Department hierarchy retrieved successfully"));
    }

    /// <summary>
    /// Get departments by parent department
    /// </summary>
    /// <param name="parentId">Parent department ID</param>
    /// <returns>List of child departments</returns>
    [HttpGet("parent/{parentId}")]
    [Authorize(Policy = "AllRoles")] // All authenticated users can view department children
    public async Task<ActionResult<ApiResponse<List<DepartmentDto>>>> GetDepartmentsByParent(int parentId)
    {
        return await ValidateAndExecuteAsync(parentId, async (validatedId) =>
        {
            var query = new GetDepartmentsByParentQuery { ParentId = validatedId };
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<List<DepartmentDto>>.SuccessResult(result, "Department children retrieved successfully"));
        });
    }
}





