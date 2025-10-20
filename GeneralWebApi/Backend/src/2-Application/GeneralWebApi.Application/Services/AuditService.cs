using GeneralWebApi.Domain.Entities.Audit;
using GeneralWebApi.Integration.Repository.AuditRepository;
using Microsoft.Extensions.Logging;

namespace GeneralWebApi.Application.Services;

/// <summary>
/// Service implementation for audit operations
/// </summary>
public class AuditService : IAuditService
{
    private readonly IAuditLogRepository _auditLogRepository;
    private readonly IEmployeeAuditLogRepository _employeeAuditLogRepository;
    private readonly ILogger<AuditService> _logger;

    public AuditService(
        IAuditLogRepository auditLogRepository,
        IEmployeeAuditLogRepository employeeAuditLogRepository,
        ILogger<AuditService> logger)
    {
        _auditLogRepository = auditLogRepository ?? throw new ArgumentNullException(nameof(auditLogRepository));
        _employeeAuditLogRepository = employeeAuditLogRepository ?? throw new ArgumentNullException(nameof(employeeAuditLogRepository));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task LogAuditEventAsync(AuditLog auditLog, CancellationToken cancellationToken = default)
    {
        try
        {
            await _auditLogRepository.AddAsync(auditLog, cancellationToken);
            _logger.LogInformation("Audit event logged: {Action} on {EntityType}:{EntityId} by {UserId}",
                auditLog.Action, auditLog.EntityType, auditLog.EntityId, auditLog.UserId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to log audit event: {Action} on {EntityType}:{EntityId} by {UserId}",
                auditLog.Action, auditLog.EntityType, auditLog.EntityId, auditLog.UserId);
            throw;
        }
    }

    public async Task LogEmployeeAuditEventAsync(EmployeeAuditLog employeeAuditLog, CancellationToken cancellationToken = default)
    {
        try
        {
            await _employeeAuditLogRepository.AddAsync(employeeAuditLog, cancellationToken);
            _logger.LogInformation("Employee audit event logged: {Action} on employee {EmployeeId} by {UserId}",
                employeeAuditLog.Action, employeeAuditLog.EmployeeId, employeeAuditLog.UserId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to log employee audit event: {Action} on employee {EmployeeId} by {UserId}",
                employeeAuditLog.Action, employeeAuditLog.EmployeeId, employeeAuditLog.UserId);
            throw;
        }
    }

    public async Task LogPermissionAuditEventAsync(PermissionAuditLog permissionAuditLog, CancellationToken cancellationToken = default)
    {
        try
        {
            // For now, we'll use the general audit log repository
            // In the future, we can create a dedicated permission audit log repository
            var auditLog = new AuditLog
            {
                UserId = permissionAuditLog.UserId,
                UserName = permissionAuditLog.UserName,
                Action = permissionAuditLog.Action,
                EntityType = "Permission",
                EntityId = permissionAuditLog.PermissionId?.ToString() ?? permissionAuditLog.RoleId?.ToString() ?? "Unknown",
                EntityName = permissionAuditLog.PermissionName ?? permissionAuditLog.RoleName ?? "Unknown",
                IpAddress = permissionAuditLog.IpAddress,
                RequestPath = permissionAuditLog.RequestPath,
                Details = permissionAuditLog.Details,
                Severity = permissionAuditLog.Severity,
                IsSuccess = permissionAuditLog.IsSuccess,
                ErrorMessage = permissionAuditLog.ErrorMessage,
                Category = "Permission"
            };

            await _auditLogRepository.AddAsync(auditLog, cancellationToken);
            _logger.LogInformation("Permission audit event logged: {Action} on permission {PermissionId} by {UserId}",
                permissionAuditLog.Action, permissionAuditLog.PermissionId, permissionAuditLog.UserId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to log permission audit event: {Action} on permission {PermissionId} by {UserId}",
                permissionAuditLog.Action, permissionAuditLog.PermissionId, permissionAuditLog.UserId);
            throw;
        }
    }

    public async Task LogEmployeeFieldChangeAsync(
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
        CancellationToken cancellationToken = default)
    {
        try
        {
            var employeeAuditLog = new EmployeeAuditLog
            {
                EmployeeId = employeeId,
                EmployeeName = employeeName,
                EmployeeNumber = employeeNumber,
                UserId = userId,
                UserName = userName,
                Action = "Update",
                FieldName = fieldName,
                OldValue = oldValue,
                NewValue = newValue,
                IpAddress = ipAddress,
                RequestPath = requestPath,
                Reason = reason,
                Severity = "Info",
                IsSuccess = true
            };

            await _employeeAuditLogRepository.AddAsync(employeeAuditLog, cancellationToken);
            _logger.LogInformation("Employee field change logged: {FieldName} for employee {EmployeeId} by {UserId}",
                fieldName, employeeId, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to log employee field change: {FieldName} for employee {EmployeeId} by {UserId}",
                fieldName, employeeId, userId);
            throw;
        }
    }

    public async Task LogPermissionChangeAsync(
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
        CancellationToken cancellationToken = default)
    {
        try
        {
            var permissionAuditLog = new PermissionAuditLog
            {
                TargetUserId = targetUserId,
                TargetUserName = targetUserName,
                UserId = userId,
                UserName = userName,
                Action = action,
                RoleId = roleId,
                RoleName = roleName,
                PermissionId = permissionId,
                PermissionName = permissionName,
                IpAddress = ipAddress,
                RequestPath = requestPath,
                Reason = reason,
                Severity = "Info",
                IsSuccess = true
            };

            await LogPermissionAuditEventAsync(permissionAuditLog, cancellationToken);
            _logger.LogInformation("Permission change logged: {Action} for user {TargetUserId} by {UserId}",
                action, targetUserId, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to log permission change: {Action} for user {TargetUserId} by {UserId}",
                action, targetUserId, userId);
            throw;
        }
    }

    public async Task LogSystemEventAsync(
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
        CancellationToken cancellationToken = default)
    {
        try
        {
            var auditLog = new AuditLog
            {
                UserId = userId,
                UserName = userName,
                Action = action,
                EntityType = entityType,
                EntityId = entityId,
                EntityName = entityName,
                IpAddress = ipAddress,
                RequestPath = requestPath,
                Details = details,
                Severity = severity,
                IsSuccess = isSuccess,
                ErrorMessage = errorMessage,
                Category = "System"
            };

            await _auditLogRepository.AddAsync(auditLog, cancellationToken);
            _logger.LogInformation("System event logged: {Action} on {EntityType}:{EntityId} by {UserId}",
                action, entityType, entityId, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to log system event: {Action} on {EntityType}:{EntityId} by {UserId}",
                action, entityType, entityId, userId);
            throw;
        }
    }
}
