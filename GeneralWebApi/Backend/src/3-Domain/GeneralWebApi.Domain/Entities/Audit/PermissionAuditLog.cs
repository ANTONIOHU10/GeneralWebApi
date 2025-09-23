using GeneralWebApi.Domain.Entities.Base;

namespace GeneralWebApi.Domain.Entities.Audit;

/// <summary>
/// Specialized audit log for permission-related operations
/// </summary>
public class PermissionAuditLog : BaseEntity
{
    /// <summary>
    /// User ID whose permissions were changed
    /// </summary>
    public string TargetUserId { get; set; } = string.Empty;

    /// <summary>
    /// Username whose permissions were changed
    /// </summary>
    public string TargetUserName { get; set; } = string.Empty;

    /// <summary>
    /// User who performed the permission change
    /// </summary>
    public string UserId { get; set; } = string.Empty;

    /// <summary>
    /// Username who performed the permission change
    /// </summary>
    public string UserName { get; set; } = string.Empty;

    /// <summary>
    /// Action performed (Grant, Revoke, Update)
    /// </summary>
    public string Action { get; set; } = string.Empty;

    /// <summary>
    /// Role ID that was affected
    /// </summary>
    public int? RoleId { get; set; }

    /// <summary>
    /// Role name that was affected
    /// </summary>
    public string? RoleName { get; set; }

    /// <summary>
    /// Permission ID that was affected
    /// </summary>
    public int? PermissionId { get; set; }

    /// <summary>
    /// Permission name that was affected
    /// </summary>
    public string? PermissionName { get; set; }

    /// <summary>
    /// Resource that was affected
    /// </summary>
    public string? Resource { get; set; }

    /// <summary>
    /// Action on the resource
    /// </summary>
    public string? ResourceAction { get; set; }

    /// <summary>
    /// IP address of the user
    /// </summary>
    public string IpAddress { get; set; } = string.Empty;

    /// <summary>
    /// Request path
    /// </summary>
    public string RequestPath { get; set; } = string.Empty;

    /// <summary>
    /// Additional details about the permission change
    /// </summary>
    public string? Details { get; set; }

    /// <summary>
    /// Reason for the permission change
    /// </summary>
    public string? Reason { get; set; }

    /// <summary>
    /// Whether the permission change was approved
    /// </summary>
    public bool IsApproved { get; set; } = true;

    /// <summary>
    /// Approval date
    /// </summary>
    public DateTime? ApprovedAt { get; set; }

    /// <summary>
    /// User who approved the permission change
    /// </summary>
    public string? ApprovedBy { get; set; }

    /// <summary>
    /// Expiry date of the permission (if applicable)
    /// </summary>
    public DateTime? ExpiryDate { get; set; }

    /// <summary>
    /// Severity level of the permission change
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
