namespace GeneralWebApi.DTOs.Notification;

/// <summary>
/// DTO for creating a notification
/// </summary>
public class CreateNotificationDto
{
    public string UserId { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Priority { get; set; } = "medium";
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public string? ActionUrl { get; set; }
    public string? ActionLabel { get; set; }
    public string? SourceType { get; set; }
    public string? SourceId { get; set; }
    public Dictionary<string, object>? Metadata { get; set; }
    public DateTime? ExpiresAt { get; set; }
}

