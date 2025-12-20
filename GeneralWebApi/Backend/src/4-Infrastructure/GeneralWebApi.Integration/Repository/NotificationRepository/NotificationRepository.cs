using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Domain.Entities.Notifications;
using GeneralWebApi.Integration.Context;
using GeneralWebApi.Integration.Repository.Base;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace GeneralWebApi.Integration.Repository.NotificationRepository;

/// <summary>
/// Repository implementation for Notification operations
/// </summary>
public class NotificationRepository : BaseRepository<Notification>, INotificationRepository
{
    public NotificationRepository(ApplicationDbContext context, ILogger<BaseRepository<Notification>> logger)
        : base(context, logger)
    {
    }

    public override async System.Threading.Tasks.Task<Notification> GetByIdAsync(object id, CancellationToken cancellationToken = default)
    {
        var notification = await GetActiveAndEnabledEntities()
            .Include(n => n.ReadStatuses)
            .FirstOrDefaultAsync(n => n.Id.Equals(id), cancellationToken);

        if (notification == null)
        {
            _logger.LogWarning("Notification with ID {NotificationId} not found", id);
            throw new KeyNotFoundException($"Notification with ID {id} not found");
        }

        return notification;
    }

    public async System.Threading.Tasks.Task<List<Notification>> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await GetActiveAndEnabledEntities()
            .Include(n => n.ReadStatuses)
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<PagedResult<Notification>> GetPagedAsync(
        int pageNumber,
        int pageSize,
        string userId,
        string? type = null,
        string? status = null,
        string? priority = null,
        DateTime? startDate = null,
        DateTime? endDate = null,
        bool? includeExpired = null,
        string? sortBy = null,
        bool sortDescending = false,
        CancellationToken cancellationToken = default)
    {
        var query = GetActiveAndEnabledEntities()
            .Include(n => n.ReadStatuses)
            .Where(n => n.UserId == userId)
            .AsQueryable();

        // Filter by type
        if (!string.IsNullOrEmpty(type))
        {
            query = query.Where(n => n.Type == type);
        }

        // Filter by priority
        if (!string.IsNullOrEmpty(priority))
        {
            query = query.Where(n => n.Priority == priority);
        }

        // Filter by date range
        if (startDate.HasValue)
        {
            query = query.Where(n => n.CreatedAt >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            query = query.Where(n => n.CreatedAt <= endDate.Value);
        }

        // Filter expired
        if (includeExpired == false)
        {
            var now = DateTime.UtcNow;
            query = query.Where(n => n.ExpiresAt == null || n.ExpiresAt > now);
        }

        // Apply sorting
        query = sortBy?.ToLower() switch
        {
            "priority" => sortDescending
                ? query.OrderByDescending(n => n.Priority)
                : query.OrderBy(n => n.Priority),
            "type" => sortDescending
                ? query.OrderByDescending(n => n.Type)
                : query.OrderBy(n => n.Type),
            "createdat" or _ => sortDescending
                ? query.OrderByDescending(n => n.CreatedAt)
                : query.OrderBy(n => n.CreatedAt),
        };

        // Get total count before pagination
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply pagination
        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<Notification>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async System.Threading.Tasks.Task<int> GetUnreadCountAsync(string userId, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        return await GetActiveAndEnabledEntities()
            .Where(n => n.UserId == userId)
            .Where(n => n.ExpiresAt == null || n.ExpiresAt > now)
            .Where(n => !n.ReadStatuses.Any(rs => rs.UserId == userId && !rs.IsArchived))
            .CountAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<List<Notification>> GetByTypeAsync(string userId, string type, CancellationToken cancellationToken = default)
    {
        return await GetActiveAndEnabledEntities()
            .Include(n => n.ReadStatuses)
            .Where(n => n.UserId == userId && n.Type == type)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync(cancellationToken);
    }
}

