using GeneralWebApi.Domain.Entities.Audit;
using GeneralWebApi.DTOs.Audit;
using GeneralWebApi.Integration.Repository.Base;

namespace GeneralWebApi.Integration.Repository.AuditRepository;

/// <summary>
/// Repository interface for audit log operations
/// </summary>
public interface IAuditLogRepository : IBaseRepository<AuditLog>
{
    /// <summary>
    /// Get audit logs by user ID
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of audit logs</returns>
    Task<IEnumerable<AuditLog>> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get audit logs by entity type and ID
    /// </summary>
    /// <param name="entityType">Entity type</param>
    /// <param name="entityId">Entity ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of audit logs</returns>
    Task<IEnumerable<AuditLog>> GetByEntityAsync(string entityType, string entityId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get audit logs by action
    /// </summary>
    /// <param name="action">Action performed</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of audit logs</returns>
    Task<IEnumerable<AuditLog>> GetByActionAsync(string action, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get audit logs by date range
    /// </summary>
    /// <param name="startDate">Start date</param>
    /// <param name="endDate">End date</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of audit logs</returns>
    Task<IEnumerable<AuditLog>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get audit logs by severity
    /// </summary>
    /// <param name="severity">Severity level</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of audit logs</returns>
    Task<IEnumerable<AuditLog>> GetBySeverityAsync(string severity, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get failed audit logs
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of failed audit logs</returns>
    Task<IEnumerable<AuditLog>> GetFailedLogsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get audit logs with pagination
    /// </summary>
    /// <param name="pageNumber">Page number</param>
    /// <param name="pageSize">Page size</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paginated audit logs</returns>
    Task<(IEnumerable<AuditLog> Items, int TotalCount)> GetPaginatedAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get audit logs with pagination and filtering
    /// </summary>
    /// <param name="searchDto">Search criteria</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paginated and filtered audit logs</returns>
    Task<(IEnumerable<AuditLog> Items, int TotalCount)> GetPaginatedAsync(AuditLogSearchDto searchDto, CancellationToken cancellationToken = default);
}
