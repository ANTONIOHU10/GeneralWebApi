using GeneralWebApi.Application.Features.Tasks.Commands;
using GeneralWebApi.Application.Features.Tasks.Queries;
using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Controllers.Base;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Task;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GeneralWebApi.WebApi.Controllers.v1;

/// <summary>
/// Controller for managing personal tasks (Todo list)
/// All authenticated users can manage their own tasks
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
[Authorize] // Require authentication for all endpoints
public class TasksController : BaseController
{
    private readonly IMediator _mediator;

    public TasksController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get paginated list of tasks for the current user
    /// </summary>
    /// <param name="searchDto">Search criteria</param>
    /// <returns>Paginated task list</returns>
    [HttpGet]
    [Authorize(Policy = "AllRoles")] // All authenticated users can view their tasks
    public async Task<ActionResult<ApiResponse<PagedResult<TaskListDto>>>> GetTasks([FromQuery] TaskSearchDto? searchDto)
    {
        return await ValidateAndExecuteAsync(searchDto, async (validatedDto) =>
        {
            var query = new GetTasksQuery { SearchDto = validatedDto };
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<PagedResult<TaskListDto>>.SuccessResult(result, "Tasks retrieved successfully"));
        });
    }

    /// <summary>
    /// Get task by ID
    /// </summary>
    /// <param name="id">Task ID</param>
    /// <returns>Task details</returns>
    [HttpGet("{id}")]
    [Authorize(Policy = "AllRoles")] // All authenticated users can view their task details
    public async Task<ActionResult<ApiResponse<TaskDto>>> GetTask(int id)
    {
        return await ValidateAndExecuteAsync(id, async (validatedId) =>
        {
            var query = new GetTaskByIdQuery { Id = validatedId };
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<TaskDto>.SuccessResult(result, "Task retrieved successfully"));
        });
    }

    /// <summary>
    /// Create new task
    /// </summary>
    /// <param name="createDto">Task creation data</param>
    /// <returns>Created task</returns>
    [HttpPost]
    [Authorize(Policy = "AllRoles")] // All authenticated users can create tasks
    public async Task<ActionResult<ApiResponse<TaskDto>>> CreateTask([FromBody] CreateTaskDto createDto)
    {
        return await ValidateAndExecuteAsync(createDto, async (validatedDto) =>
        {
            var command = new CreateTaskCommand { CreateTaskDto = validatedDto };
            var result = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetTask), new { id = result.Id },
                ApiResponse<TaskDto>.SuccessResult(result, "Task created successfully"));
        });
    }

    /// <summary>
    /// Update task information
    /// </summary>
    /// <param name="id">Task ID</param>
    /// <param name="updateDto">Task update data</param>
    /// <returns>Updated task</returns>
    [HttpPut("{id}")]
    [Authorize(Policy = "AllRoles")] // All authenticated users can update their tasks
    public async Task<ActionResult<ApiResponse<TaskDto>>> UpdateTask(int id, [FromBody] UpdateTaskDto updateDto)
    {
        // Ensure the ID in the DTO matches the route parameter
        updateDto.Id = id;
        
        return await ValidateAndExecuteAsync(updateDto, async (validatedDto) =>
        {
            var command = new UpdateTaskCommand { UpdateTaskDto = validatedDto };
            var result = await _mediator.Send(command);
            return Ok(ApiResponse<TaskDto>.SuccessResult(result, "Task updated successfully"));
        });
    }

    /// <summary>
    /// Delete task
    /// </summary>
    /// <param name="id">Task ID</param>
    /// <returns>Success status</returns>
    [HttpDelete("{id}")]
    [Authorize(Policy = "AllRoles")] // All authenticated users can delete their tasks
    public async Task<ActionResult<ApiResponse<bool>>> DeleteTask(int id)
    {
        return await ValidateAndExecuteAsync(id, async (validatedId) =>
        {
            var command = new DeleteTaskCommand { Id = validatedId };
            var result = await _mediator.Send(command);
            return Ok(ApiResponse<bool>.SuccessResult(result, "Task deleted successfully"));
        });
    }
}

