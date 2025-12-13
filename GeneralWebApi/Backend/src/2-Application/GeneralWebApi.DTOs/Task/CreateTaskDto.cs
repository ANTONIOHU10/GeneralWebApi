namespace GeneralWebApi.DTOs.Task;

/// <summary>
/// DTO for creating a new task
/// </summary>
public class CreateTaskDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = "Pending";
    public string Priority { get; set; } = "Medium";
    public DateTime? DueDate { get; set; }
    public string? Category { get; set; }
    public decimal? EstimatedHours { get; set; }
}

