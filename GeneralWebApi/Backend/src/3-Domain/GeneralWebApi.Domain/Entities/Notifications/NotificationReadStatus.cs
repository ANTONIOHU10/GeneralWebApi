using GeneralWebApi.Domain.Entities.Base;

namespace GeneralWebApi.Domain.Entities.Notifications;

/// <summary>
/// Notification read status entity for tracking which users have read which notifications
/// </summary>
public class NotificationReadStatus : BaseEntity
{
    /// <summary>
    /// Notification ID
    /// </summary>
    public int NotificationId { get; set; }

    /// <summary>
    /// User ID who read the notification
    /// </summary>
    public string UserId { get; set; } = string.Empty;

    /// <summary>
    /// When the notification was read
    /// </summary>
    public DateTime ReadAt { get; set; }

    /// <summary>
    /// Whether the notification is archived
    /// </summary>
    public bool IsArchived { get; set; } = false;

    /// <summary>
    /// When the notification was archived
    /// </summary>
    public DateTime? ArchivedAt { get; set; }

    /// <summary>
    /// Navigation property to notification
    /// </summary>
    public Notification? Notification { get; set; }
}

