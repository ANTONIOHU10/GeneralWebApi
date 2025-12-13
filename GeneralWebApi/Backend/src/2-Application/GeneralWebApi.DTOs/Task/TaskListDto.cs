namespace GeneralWebApi.DTOs.Task;

/// <summary>
/// DTO for task list display
/// </summary>
public class TaskListDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public DateTime? DueDate { get; set; }
    public string? Category { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsOverdue { get; set; }
}

