using AutoMapper;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Domain.Entities.Tasks;
using GeneralWebApi.DTOs.Task;
using GeneralWebApi.Integration.Repository.TaskRepository;
using Microsoft.Extensions.Logging;
using TaskEntity = GeneralWebApi.Domain.Entities.Tasks.Task;

namespace GeneralWebApi.Application.Services;

/// <summary>
/// Service implementation for Task operations
/// </summary>
public class TaskService : ITaskService
{
    private readonly ITaskRepository _taskRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<TaskService> _logger;

    public TaskService(
        ITaskRepository taskRepository,
        IMapper mapper,
        ILogger<TaskService> logger)
    {
        _taskRepository = taskRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<TaskDto> CreateAsync(CreateTaskDto createDto, string userId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Creating task for user: {UserId}", userId);

        var task = _mapper.Map<TaskEntity>(createDto);
        task.UserId = userId;
        var createdTask = await _taskRepository.AddAsync(task, cancellationToken);

        _logger.LogInformation("Successfully created task with ID: {TaskId}", createdTask.Id);
        return _mapper.Map<TaskDto>(createdTask);
    }

    public async Task<bool> DeleteAsync(int id, string userId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Deleting task with ID: {TaskId} for user: {UserId}", id, userId);

        var task = await _taskRepository.GetByIdAsync(id, cancellationToken);
        if (task == null)
        {
            _logger.LogWarning("Task with ID {TaskId} not found", id);
            throw new KeyNotFoundException($"Task with ID {id} not found");
        }

        // Verify ownership
        if (task.UserId != userId)
        {
            _logger.LogWarning("User {UserId} attempted to delete task {TaskId} owned by {OwnerId}", userId, id, task.UserId);
            throw new UnauthorizedAccessException("You do not have permission to delete this task");
        }

        await _taskRepository.DeleteAsync(id, cancellationToken);
        _logger.LogInformation("Successfully deleted task with ID: {TaskId}", id);
        return true;
    }

    public async Task<TaskDto> GetByIdAsync(int id, string userId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting task by ID: {TaskId} for user: {UserId}", id, userId);

        var task = await _taskRepository.GetByIdAsync(id, cancellationToken);
        if (task == null)
        {
            _logger.LogWarning("Task with ID {TaskId} not found", id);
            throw new KeyNotFoundException($"Task with ID {id} not found");
        }

        // Verify ownership
        if (task.UserId != userId)
        {
            _logger.LogWarning("User {UserId} attempted to access task {TaskId} owned by {OwnerId}", userId, id, task.UserId);
            throw new UnauthorizedAccessException("You do not have permission to access this task");
        }

        return _mapper.Map<TaskDto>(task);
    }

    public async Task<PagedResult<TaskListDto>> GetPagedAsync(TaskSearchDto searchDto, string userId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting paged tasks for user: {UserId}", userId);

        var result = await _taskRepository.GetPagedAsync(
            searchDto.PageNumber,
            searchDto.PageSize,
            userId,
            searchDto.SearchTerm,
            searchDto.Status,
            searchDto.Priority,
            searchDto.Category,
            searchDto.DueDateFrom,
            searchDto.DueDateTo,
            searchDto.SortBy,
            searchDto.SortDescending,
            cancellationToken);

        var taskListDtos = _mapper.Map<List<TaskListDto>>(result.Items);
        
        // Mark overdue tasks
        var now = DateTime.UtcNow;
        foreach (var dto in taskListDtos)
        {
            dto.IsOverdue = dto.DueDate.HasValue && 
                           dto.DueDate < now && 
                           dto.Status != "Completed" && 
                           dto.Status != "Cancelled";
        }

        return new PagedResult<TaskListDto>(taskListDtos, result.TotalCount, result.PageNumber, result.PageSize);
    }

    public async Task<TaskDto> UpdateAsync(int id, UpdateTaskDto updateDto, string userId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Updating task with ID: {TaskId} for user: {UserId}", id, userId);

        var task = await _taskRepository.GetByIdAsync(id, cancellationToken);
        if (task == null)
        {
            _logger.LogWarning("Task with ID {TaskId} not found", id);
            throw new KeyNotFoundException($"Task with ID {id} not found");
        }

        // Verify ownership
        if (task.UserId != userId)
        {
            _logger.LogWarning("User {UserId} attempted to update task {TaskId} owned by {OwnerId}", userId, id, task.UserId);
            throw new UnauthorizedAccessException("You do not have permission to update this task");
        }

        // Update properties
        task.Title = updateDto.Title;
        task.Description = updateDto.Description;
        task.Status = updateDto.Status;
        task.Priority = updateDto.Priority;
        task.DueDate = updateDto.DueDate;
        task.CompletedAt = updateDto.CompletedAt;
        task.Category = updateDto.Category;
        task.EstimatedHours = updateDto.EstimatedHours;
        task.ActualHours = updateDto.ActualHours;

        // Set completed date if status is Completed
        if (updateDto.Status == "Completed" && !task.CompletedAt.HasValue)
        {
            task.CompletedAt = DateTime.UtcNow;
        }

        var updatedTask = await _taskRepository.UpdateAsync(task, cancellationToken);
        _logger.LogInformation("Successfully updated task with ID: {TaskId}", id);
        return _mapper.Map<TaskDto>(updatedTask);
    }

    public async Task<List<TaskDto>> GetByStatusAsync(string userId, string status, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting tasks by status: {Status} for user: {UserId}", status, userId);
        var tasks = await _taskRepository.GetByStatusAsync(userId, status, cancellationToken);
        return _mapper.Map<List<TaskDto>>(tasks);
    }

    public async Task<List<TaskDto>> GetOverdueTasksAsync(string userId, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting overdue tasks for user: {UserId}", userId);
        var tasks = await _taskRepository.GetOverdueTasksAsync(userId, cancellationToken);
        return _mapper.Map<List<TaskDto>>(tasks);
    }

    public async Task<List<TaskDto>> GetTasksDueSoonAsync(string userId, int daysFromNow, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting tasks due soon ({Days} days) for user: {UserId}", daysFromNow, userId);
        var tasks = await _taskRepository.GetTasksDueSoonAsync(userId, daysFromNow, cancellationToken);
        return _mapper.Map<List<TaskDto>>(tasks);
    }
}

