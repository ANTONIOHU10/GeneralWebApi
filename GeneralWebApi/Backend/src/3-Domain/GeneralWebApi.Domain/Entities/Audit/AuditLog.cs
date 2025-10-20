using GeneralWebApi.Domain.Entities.Base;

namespace GeneralWebApi.Domain.Entities.Audit;

/// <summary>
/// Audit log entity for tracking system operations
/// </summary>
public class AuditLog : BaseEntity
{
    /// <summary>
    /// User who performed the action
    /// </summary>
    public string UserId { get; set; } = string.Empty;

    /// <summary>
    /// Username for display purposes
    /// </summary>
    public string UserName { get; set; } = string.Empty;

    /// <summary>
    /// Action performed (Create, Update, Delete, Login, etc.)
    /// </summary>
    public string Action { get; set; } = string.Empty;

    /// <summary>
    /// Entity type that was affected
    /// </summary>
    public string EntityType { get; set; } = string.Empty;

    /// <summary>
    /// ID of the affected entity
    /// </summary>
    public string EntityId { get; set; } = string.Empty;

    /// <summary>
    /// Name of the affected entity for display
    /// </summary>
    public string EntityName { get; set; } = string.Empty;

    /// <summary>
    /// IP address of the user
    /// </summary>
    public string IpAddress { get; set; } = string.Empty;

    /// <summary>
    /// User agent string
    /// </summary>
    public string UserAgent { get; set; } = string.Empty;

    /// <summary>
    /// Request path
    /// </summary>
    public string RequestPath { get; set; } = string.Empty;

    /// <summary>
    /// HTTP method
    /// </summary>
    public string HttpMethod { get; set; } = string.Empty;

    /// <summary>
    /// Request ID for tracing
    /// </summary>
    public string RequestId { get; set; } = string.Empty;

    /// <summary>
    /// Additional details about the action
    /// </summary>
    public string? Details { get; set; }

    /// <summary>
    /// Old values (for update operations)
    /// </summary>
    public string? OldValues { get; set; }

    /// <summary>
    /// New values (for create/update operations)
    /// </summary>
    public string? NewValues { get; set; }

    /// <summary>
    /// Severity level of the action
    /// </summary>
    public string Severity { get; set; } = "Info";

    /// <summary>
    /// Category of the audit log
    /// </summary>
    public string Category { get; set; } = "General";

    /// <summary>
    /// Whether the action was successful
    /// </summary>
    public bool IsSuccess { get; set; } = true;

    /// <summary>
    /// Error message if action failed
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// Duration of the operation in milliseconds
    /// </summary>
    public long? DurationMs { get; set; }
}
