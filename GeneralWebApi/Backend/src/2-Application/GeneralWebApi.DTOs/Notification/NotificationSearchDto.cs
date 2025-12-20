namespace GeneralWebApi.DTOs.Notification;

/// <summary>
/// DTO for notification search parameters
/// </summary>
public class NotificationSearchDto
{
    public string? Type { get; set; }
    public string? Status { get; set; } // unread, read, archived
    public string? Priority { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool? IncludeExpired { get; set; } = false;
    public string? SortBy { get; set; } = "CreatedAt";
    public bool SortDescending { get; set; } = true;
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

