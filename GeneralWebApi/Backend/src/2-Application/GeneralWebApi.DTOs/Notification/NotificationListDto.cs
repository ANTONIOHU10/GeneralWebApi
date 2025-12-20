namespace GeneralWebApi.DTOs.Notification;

/// <summary>
/// DTO for notification list display
/// </summary>
public class NotificationListDto
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string Status { get; set; } = "unread";
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public string? ActionUrl { get; set; }
    public string? ActionLabel { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ReadAt { get; set; }
    public bool IsExpired { get; set; }
}

