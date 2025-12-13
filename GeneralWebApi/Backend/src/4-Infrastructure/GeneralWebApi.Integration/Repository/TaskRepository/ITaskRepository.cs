using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Domain.Entities.Tasks;
using GeneralWebApi.Integration.Repository.Base;
using TaskEntity = GeneralWebApi.Domain.Entities.Tasks.Task;

namespace GeneralWebApi.Integration.Repository.TaskRepository;

/// <summary>
/// Repository interface for Task operations
/// </summary>
public interface ITaskRepository : IBaseRepository<TaskEntity>
{
    /// <summary>
    /// Get tasks by user ID
    /// </summary>
    System.Threading.Tasks.Task<List<TaskEntity>> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get paged tasks with filtering and sorting
    /// </summary>
    System.Threading.Tasks.Task<PagedResult<TaskEntity>> GetPagedAsync(
        int pageNumber,
        int pageSize,
        string userId,
        string? searchTerm = null,
        string? status = null,
        string? priority = null,
        string? category = null,
        DateTime? dueDateFrom = null,
        DateTime? dueDateTo = null,
        string? sortBy = null,
        bool sortDescending = false,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get tasks by status for a user
    /// </summary>
    System.Threading.Tasks.Task<List<TaskEntity>> GetByStatusAsync(string userId, string status, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get overdue tasks for a user
    /// </summary>
    System.Threading.Tasks.Task<List<TaskEntity>> GetOverdueTasksAsync(string userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get tasks due soon for a user
    /// </summary>
    System.Threading.Tasks.Task<List<TaskEntity>> GetTasksDueSoonAsync(string userId, int daysFromNow, CancellationToken cancellationToken = default);
}

