using GeneralWebApi.Domain.Entities.Base;

namespace GeneralWebApi.Domain.Entities.Tasks;

/// <summary>
/// Task entity for personal todo list management
/// </summary>
public class Task : BaseEntity
{
    /// <summary>
    /// Task title
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Task description
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Task status: Pending, InProgress, Completed, Cancelled
    /// </summary>
    public string Status { get; set; } = "Pending";

    /// <summary>
    /// Task priority: Low, Medium, High, Urgent
    /// </summary>
    public string Priority { get; set; } = "Medium";

    /// <summary>
    /// Due date for the task
    /// </summary>
    public DateTime? DueDate { get; set; }

    /// <summary>
    /// Completion date
    /// </summary>
    public DateTime? CompletedAt { get; set; }

    /// <summary>
    /// User ID who owns this task
    /// </summary>
    public string UserId { get; set; } = string.Empty;

    /// <summary>
    /// Task category/tag
    /// </summary>
    public string? Category { get; set; }

    /// <summary>
    /// Estimated time in hours
    /// </summary>
    public decimal? EstimatedHours { get; set; }

    /// <summary>
    /// Actual time spent in hours
    /// </summary>
    public decimal? ActualHours { get; set; }
}

