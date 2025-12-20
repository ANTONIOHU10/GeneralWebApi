using GeneralWebApi.Domain.Entities.Notifications;
using GeneralWebApi.Integration.Repository.Base;

namespace GeneralWebApi.Integration.Repository.NotificationReadStatusRepository;

/// <summary>
/// Repository interface for NotificationReadStatus operations
/// </summary>
public interface INotificationReadStatusRepository : IBaseRepository<NotificationReadStatus>
{
    /// <summary>
    /// Get read status for a notification and user
    /// </summary>
    System.Threading.Tasks.Task<NotificationReadStatus?> GetByNotificationAndUserAsync(
        int notificationId,
        string userId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Mark notification as read for a user
    /// </summary>
    System.Threading.Tasks.Task<NotificationReadStatus> MarkAsReadAsync(
        int notificationId,
        string userId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Mark notification as archived for a user
    /// </summary>
    System.Threading.Tasks.Task MarkAsArchivedAsync(
        int notificationId,
        string userId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Mark all notifications as read for a user
    /// </summary>
    System.Threading.Tasks.Task MarkAllAsReadAsync(
        string userId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Delete read status (soft delete)
    /// </summary>
    System.Threading.Tasks.Task DeleteReadStatusAsync(
        int notificationId,
        string userId,
        CancellationToken cancellationToken = default);
}

