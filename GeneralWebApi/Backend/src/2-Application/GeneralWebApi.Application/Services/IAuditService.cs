using GeneralWebApi.Domain.Entities.Audit;

namespace GeneralWebApi.Application.Services;

/// <summary>
/// Service interface for audit operations
/// </summary>
public interface IAuditService
{
    /// <summary>
    /// Log a general audit event
    /// </summary>
    /// <param name="auditLog">Audit log data</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Task</returns>
    Task LogAuditEventAsync(AuditLog auditLog, CancellationToken cancellationToken = default);

    /// <summary>
    /// Log an employee audit event
    /// </summary>
    /// <param name="employeeAuditLog">Employee audit log data</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Task</returns>
    Task LogEmployeeAuditEventAsync(EmployeeAuditLog employeeAuditLog, CancellationToken cancellationToken = default);

    /// <summary>
    /// Log a permission audit event
    /// </summary>
    /// <param name="permissionAuditLog">Permission audit log data</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Task</returns>
    Task LogPermissionAuditEventAsync(PermissionAuditLog permissionAuditLog, CancellationToken cancellationToken = default);

    /// <summary>
    /// Log employee field change
    /// </summary>
    /// <param name="employeeId">Employee ID</param>
    /// <param name="employeeName">Employee name</param>
    /// <param name="employeeNumber">Employee number</param>
    /// <param name="fieldName">Field name</param>
    /// <param name="oldValue">Old value</param>
    /// <param name="newValue">New value</param>
    /// <param name="userId">User ID who made the change</param>
    /// <param name="userName">Username who made the change</param>
    /// <param name="ipAddress">IP address</param>
    /// <param name="requestPath">Request path</param>
    /// <param name="reason">Reason for change</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Task</returns>
    Task LogEmployeeFieldChangeAsync(
        int employeeId,
        string employeeName,
        string employeeNumber,
        string fieldName,
        string? oldValue,
        string? newValue,
        string userId,
        string userName,
        string ipAddress,
        string requestPath,
        string? reason = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Log permission change
    /// </summary>
    /// <param name="targetUserId">Target user ID</param>
    /// <param name="targetUserName">Target username</param>
    /// <param name="action">Action performed</param>
    /// <param name="roleId">Role ID</param>
    /// <param name="roleName">Role name</param>
    /// <param name="permissionId">Permission ID</param>
    /// <param name="permissionName">Permission name</param>
    /// <param name="userId">User ID who made the change</param>
    /// <param name="userName">Username who made the change</param>
    /// <param name="ipAddress">IP address</param>
    /// <param name="requestPath">Request path</param>
    /// <param name="reason">Reason for change</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Task</returns>
    Task LogPermissionChangeAsync(
        string targetUserId,
        string targetUserName,
        string action,
        int? roleId,
        string? roleName,
        int? permissionId,
        string? permissionName,
        string userId,
        string userName,
        string ipAddress,
        string requestPath,
        string? reason = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Log system event
    /// </summary>
    /// <param name="action">Action performed</param>
    /// <param name="entityType">Entity type</param>
    /// <param name="entityId">Entity ID</param>
    /// <param name="entityName">Entity name</param>
    /// <param name="userId">User ID</param>
    /// <param name="userName">Username</param>
    /// <param name="ipAddress">IP address</param>
    /// <param name="requestPath">Request path</param>
    /// <param name="details">Additional details</param>
    /// <param name="severity">Severity level</param>
    /// <param name="isSuccess">Whether the action was successful</param>
    /// <param name="errorMessage">Error message if failed</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Task</returns>
    Task LogSystemEventAsync(
        string action,
        string entityType,
        string entityId,
        string entityName,
        string userId,
        string userName,
        string ipAddress,
        string requestPath,
        string? details = null,
        string severity = "Info",
        bool isSuccess = true,
        string? errorMessage = null,
        CancellationToken cancellationToken = default);
}
