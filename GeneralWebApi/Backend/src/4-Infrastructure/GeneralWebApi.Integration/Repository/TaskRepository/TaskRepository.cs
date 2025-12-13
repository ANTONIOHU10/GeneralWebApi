using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Domain.Entities.Tasks;
using GeneralWebApi.Integration.Context;
using GeneralWebApi.Integration.Repository.Base;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TaskEntity = GeneralWebApi.Domain.Entities.Tasks.Task;

namespace GeneralWebApi.Integration.Repository.TaskRepository;

/// <summary>
/// Repository implementation for Task operations
/// </summary>
public class TaskRepository : BaseRepository<TaskEntity>, ITaskRepository
{
    public TaskRepository(ApplicationDbContext context, ILogger<BaseRepository<TaskEntity>> logger)
        : base(context, logger)
    {
    }

    public override async System.Threading.Tasks.Task<TaskEntity> GetByIdAsync(object id, CancellationToken cancellationToken = default)
    {
        var task = await GetActiveAndEnabledEntities()
            .FirstOrDefaultAsync(t => t.Id.Equals(id), cancellationToken);

        if (task == null)
        {
            _logger.LogWarning("Task with ID {TaskId} not found", id);
            throw new KeyNotFoundException($"Task with ID {id} not found");
        }

        return task;
    }

    public async System.Threading.Tasks.Task<List<TaskEntity>> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await GetActiveAndEnabledEntities()
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<PagedResult<TaskEntity>> GetPagedAsync(
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
        CancellationToken cancellationToken = default)
    {
        var query = GetActiveAndEnabledEntities()
            .Where(t => t.UserId == userId)
            .AsQueryable();

        // Search filter
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(t => t.Title.Contains(searchTerm) ||
                                   (t.Description != null && t.Description.Contains(searchTerm)));
        }

        // Status filter
        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(t => t.Status == status);
        }

        // Priority filter
        if (!string.IsNullOrWhiteSpace(priority))
        {
            query = query.Where(t => t.Priority == priority);
        }

        // Category filter
        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(t => t.Category == category);
        }

        // Due date filters
        if (dueDateFrom.HasValue)
        {
            query = query.Where(t => t.DueDate.HasValue && t.DueDate >= dueDateFrom.Value);
        }

        if (dueDateTo.HasValue)
        {
            query = query.Where(t => t.DueDate.HasValue && t.DueDate <= dueDateTo.Value);
        }

        // Sorting
        query = sortBy?.ToLower() switch
        {
            "title" => sortDescending ? query.OrderByDescending(t => t.Title) : query.OrderBy(t => t.Title),
            "status" => sortDescending ? query.OrderByDescending(t => t.Status) : query.OrderBy(t => t.Status),
            "priority" => sortDescending ? query.OrderByDescending(t => t.Priority) : query.OrderBy(t => t.Priority),
            "duedate" => sortDescending ? query.OrderByDescending(t => t.DueDate) : query.OrderBy(t => t.DueDate),
            "createdat" => sortDescending ? query.OrderByDescending(t => t.CreatedAt) : query.OrderBy(t => t.CreatedAt),
            "completedat" => sortDescending ? query.OrderByDescending(t => t.CompletedAt) : query.OrderBy(t => t.CompletedAt),
            _ => query.OrderByDescending(t => t.CreatedAt)
        };

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<TaskEntity>(items, totalCount, pageNumber, pageSize);
    }

    public async System.Threading.Tasks.Task<List<TaskEntity>> GetByStatusAsync(string userId, string status, CancellationToken cancellationToken = default)
    {
        return await GetActiveAndEnabledEntities()
            .Where(t => t.UserId == userId && t.Status == status)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<List<TaskEntity>> GetOverdueTasksAsync(string userId, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        return await GetActiveAndEnabledEntities()
            .Where(t => t.UserId == userId &&
                       t.DueDate.HasValue &&
                       t.DueDate < now &&
                       t.Status != "Completed" &&
                       t.Status != "Cancelled")
            .OrderBy(t => t.DueDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<List<TaskEntity>> GetTasksDueSoonAsync(string userId, int daysFromNow, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var targetDate = now.AddDays(daysFromNow);
        return await GetActiveAndEnabledEntities()
            .Where(t => t.UserId == userId &&
                       t.DueDate.HasValue &&
                       t.DueDate >= now &&
                       t.DueDate <= targetDate &&
                       t.Status != "Completed" &&
                       t.Status != "Cancelled")
            .OrderBy(t => t.DueDate)
            .ToListAsync(cancellationToken);
    }
}

