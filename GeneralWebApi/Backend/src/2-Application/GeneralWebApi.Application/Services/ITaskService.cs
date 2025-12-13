using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Task;

namespace GeneralWebApi.Application.Services;

/// <summary>
/// Service interface for Task operations
/// </summary>
public interface ITaskService
{
    Task<PagedResult<TaskListDto>> GetPagedAsync(TaskSearchDto searchDto, string userId, CancellationToken cancellationToken = default);
    Task<TaskDto> GetByIdAsync(int id, string userId, CancellationToken cancellationToken = default);
    Task<TaskDto> CreateAsync(CreateTaskDto createDto, string userId, CancellationToken cancellationToken = default);
    Task<TaskDto> UpdateAsync(int id, UpdateTaskDto updateDto, string userId, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, string userId, CancellationToken cancellationToken = default);
    Task<List<TaskDto>> GetByStatusAsync(string userId, string status, CancellationToken cancellationToken = default);
    Task<List<TaskDto>> GetOverdueTasksAsync(string userId, CancellationToken cancellationToken = default);
    Task<List<TaskDto>> GetTasksDueSoonAsync(string userId, int daysFromNow, CancellationToken cancellationToken = default);
}

