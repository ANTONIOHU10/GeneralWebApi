using GeneralWebApi.Domain.Entities.Base;

namespace GeneralWebApi.Domain.Entities.Audit;

/// <summary>
/// Specialized audit log for employee-related operations
/// </summary>
public class EmployeeAuditLog : BaseEntity
{
    /// <summary>
    /// Employee ID that was affected
    /// </summary>
    public int EmployeeId { get; set; }

    /// <summary>
    /// Employee name for display
    /// </summary>
    public string EmployeeName { get; set; } = string.Empty;

    /// <summary>
    /// Employee number
    /// </summary>
    public string EmployeeNumber { get; set; } = string.Empty;

    /// <summary>
    /// User who performed the action
    /// </summary>
    public string UserId { get; set; } = string.Empty;

    /// <summary>
    /// Username for display purposes
    /// </summary>
    public string UserName { get; set; } = string.Empty;

    /// <summary>
    /// Action performed on employee
    /// </summary>
    public string Action { get; set; } = string.Empty;

    /// <summary>
    /// Field that was changed (for update operations)
    /// </summary>
    public string? FieldName { get; set; }

    /// <summary>
    /// Old value of the field
    /// </summary>
    public string? OldValue { get; set; }

    /// <summary>
    /// New value of the field
    /// </summary>
    public string? NewValue { get; set; }

    /// <summary>
    /// IP address of the user
    /// </summary>
    public string IpAddress { get; set; } = string.Empty;

    /// <summary>
    /// Request path
    /// </summary>
    public string RequestPath { get; set; } = string.Empty;

    /// <summary>
    /// Additional details about the change
    /// </summary>
    public string? Details { get; set; }

    /// <summary>
    /// Reason for the change
    /// </summary>
    public string? Reason { get; set; }

    /// <summary>
    /// Whether the change was approved
    /// </summary>
    public bool IsApproved { get; set; } = true;

    /// <summary>
    /// Approval date
    /// </summary>
    public DateTime? ApprovedAt { get; set; }

    /// <summary>
    /// User who approved the change
    /// </summary>
    public string? ApprovedBy { get; set; }

    /// <summary>
    /// Severity level of the change
    /// </summary>
    public string Severity { get; set; } = "Info";

    /// <summary>
    /// Whether the action was successful
    /// </summary>
    public bool IsSuccess { get; set; } = true;

    /// <summary>
    /// Error message if action failed
    /// </summary>
    public string? ErrorMessage { get; set; }
}
