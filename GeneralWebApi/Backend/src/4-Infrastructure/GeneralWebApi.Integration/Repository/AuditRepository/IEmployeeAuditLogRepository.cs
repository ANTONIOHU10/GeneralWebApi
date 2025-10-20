using GeneralWebApi.Domain.Entities.Audit;
using GeneralWebApi.Integration.Repository.Base;

namespace GeneralWebApi.Integration.Repository.AuditRepository;

/// <summary>
/// Repository interface for employee audit log operations
/// </summary>
public interface IEmployeeAuditLogRepository : IBaseRepository<EmployeeAuditLog>
{
    /// <summary>
    /// Get audit logs by employee ID
    /// </summary>
    /// <param name="employeeId">Employee ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of employee audit logs</returns>
    Task<IEnumerable<EmployeeAuditLog>> GetByEmployeeIdAsync(int employeeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get audit logs by employee number
    /// </summary>
    /// <param name="employeeNumber">Employee number</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of employee audit logs</returns>
    Task<IEnumerable<EmployeeAuditLog>> GetByEmployeeNumberAsync(string employeeNumber, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get audit logs by user ID
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of employee audit logs</returns>
    Task<IEnumerable<EmployeeAuditLog>> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get audit logs by action
    /// </summary>
    /// <param name="action">Action performed</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of employee audit logs</returns>
    Task<IEnumerable<EmployeeAuditLog>> GetByActionAsync(string action, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get audit logs by field name
    /// </summary>
    /// <param name="fieldName">Field name</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of employee audit logs</returns>
    Task<IEnumerable<EmployeeAuditLog>> GetByFieldNameAsync(string fieldName, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get audit logs by date range
    /// </summary>
    /// <param name="startDate">Start date</param>
    /// <param name="endDate">End date</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of employee audit logs</returns>
    Task<IEnumerable<EmployeeAuditLog>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get unapproved audit logs
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of unapproved employee audit logs</returns>
    Task<IEnumerable<EmployeeAuditLog>> GetUnapprovedLogsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get audit logs with pagination
    /// </summary>
    /// <param name="pageNumber">Page number</param>
    /// <param name="pageSize">Page size</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paginated employee audit logs</returns>
    Task<(IEnumerable<EmployeeAuditLog> Items, int TotalCount)> GetPaginatedAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default);
}
