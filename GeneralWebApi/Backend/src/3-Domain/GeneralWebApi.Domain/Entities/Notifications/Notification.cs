using GeneralWebApi.Domain.Entities.Base;

namespace GeneralWebApi.Domain.Entities.Notifications;

/// <summary>
/// Notification entity for storing user notifications
/// </summary>
public class Notification : BaseEntity
{
    /// <summary>
    /// User ID who should receive this notification
    /// </summary>
    public string UserId { get; set; } = string.Empty;

    /// <summary>
    /// Notification type: approval, task, contract, system, audit, employee
    /// </summary>
    public string Type { get; set; } = string.Empty;

    /// <summary>
    /// Notification priority: low, medium, high, urgent
    /// </summary>
    public string Priority { get; set; } = "medium";

    /// <summary>
    /// Notification title
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Notification message
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Icon name (e.g., 'check_circle', 'warning')
    /// </summary>
    public string? Icon { get; set; }

    /// <summary>
    /// Action URL for navigation
    /// </summary>
    public string? ActionUrl { get; set; }

    /// <summary>
    /// Action label for button
    /// </summary>
    public string? ActionLabel { get; set; }

    /// <summary>
    /// Source entity type (e.g., 'ContractApproval', 'Task', 'Contract')
    /// </summary>
    public string? SourceType { get; set; }

    /// <summary>
    /// Source entity ID
    /// </summary>
    public string? SourceId { get; set; }

    /// <summary>
    /// Additional metadata as JSON string
    /// </summary>
    public string? Metadata { get; set; }

    /// <summary>
    /// Expiration date (notifications older than this can be auto-archived)
    /// </summary>
    public DateTime? ExpiresAt { get; set; }

    /// <summary>
    /// Navigation property to read statuses
    /// </summary>
    public ICollection<NotificationReadStatus> ReadStatuses { get; set; } = new List<NotificationReadStatus>();
}

