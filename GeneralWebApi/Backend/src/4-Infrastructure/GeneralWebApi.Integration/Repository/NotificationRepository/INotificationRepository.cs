using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Domain.Entities.Notifications;
using GeneralWebApi.Integration.Repository.Base;

namespace GeneralWebApi.Integration.Repository.NotificationRepository;

/// <summary>
/// Repository interface for Notification operations
/// </summary>
public interface INotificationRepository : IBaseRepository<Notification>
{
    /// <summary>
    /// Get notifications by user ID
    /// </summary>
    System.Threading.Tasks.Task<List<Notification>> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get paged notifications with filtering and sorting
    /// </summary>
    System.Threading.Tasks.Task<PagedResult<Notification>> GetPagedAsync(
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
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get unread notifications count for a user
    /// </summary>
    System.Threading.Tasks.Task<int> GetUnreadCountAsync(string userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get notifications by type for a user
    /// </summary>
    System.Threading.Tasks.Task<List<Notification>> GetByTypeAsync(string userId, string type, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get all unread notifications for a user
    /// </summary>
    System.Threading.Tasks.Task<List<Notification>> GetUnreadNotificationsAsync(string userId, CancellationToken cancellationToken = default);
}

