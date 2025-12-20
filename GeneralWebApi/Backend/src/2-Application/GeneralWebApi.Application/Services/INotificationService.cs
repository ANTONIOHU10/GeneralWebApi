using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Notification;

namespace GeneralWebApi.Application.Services;

/// <summary>
/// Service interface for Notification operations
/// </summary>
public interface INotificationService
{
    /// <summary>
    /// Create a new notification
    /// </summary>
    System.Threading.Tasks.Task<NotificationDto> CreateAsync(CreateNotificationDto createDto, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get notification by ID
    /// </summary>
    System.Threading.Tasks.Task<NotificationDto> GetByIdAsync(int id, string userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get paged notifications for a user
    /// </summary>
    System.Threading.Tasks.Task<PagedResult<NotificationListDto>> GetPagedAsync(
        NotificationSearchDto searchDto,
        string userId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get unread count for a user
    /// </summary>
    System.Threading.Tasks.Task<int> GetUnreadCountAsync(string userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Mark notification as read
    /// </summary>
    System.Threading.Tasks.Task MarkAsReadAsync(int notificationId, string userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Mark all notifications as read for a user
    /// </summary>
    System.Threading.Tasks.Task MarkAllAsReadAsync(string userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Mark notification as archived
    /// </summary>
    System.Threading.Tasks.Task MarkAsArchivedAsync(int notificationId, string userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Delete notification (soft delete)
    /// </summary>
    System.Threading.Tasks.Task<bool> DeleteAsync(int id, string userId, CancellationToken cancellationToken = default);
}

