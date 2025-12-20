namespace GeneralWebApi.DTOs.Notification;

/// <summary>
/// DTO for notification details
/// </summary>
public class NotificationDto
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string Status { get; set; } = "unread"; // Computed from ReadStatuses
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public string? ActionUrl { get; set; }
    public string? ActionLabel { get; set; }
    public string? SourceType { get; set; }
    public string? SourceId { get; set; }
    public Dictionary<string, object>? Metadata { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ReadAt { get; set; }
    public DateTime? ArchivedAt { get; set; }
}

