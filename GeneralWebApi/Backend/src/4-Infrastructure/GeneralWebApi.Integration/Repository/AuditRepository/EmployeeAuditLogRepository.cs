using GeneralWebApi.Domain.Entities.Audit;
using GeneralWebApi.Integration.Context;
using GeneralWebApi.Integration.Repository.Base;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace GeneralWebApi.Integration.Repository.AuditRepository;

/// <summary>
/// Repository implementation for employee audit log operations
/// </summary>
public class EmployeeAuditLogRepository : BaseRepository<EmployeeAuditLog>, IEmployeeAuditLogRepository
{
    public EmployeeAuditLogRepository(ApplicationDbContext context, ILogger<EmployeeAuditLogRepository> logger)
        : base(context, logger)
    {
    }

    public async Task<IEnumerable<EmployeeAuditLog>> GetByEmployeeIdAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        try
        {
            var logs = await GetActiveEntities()
                .Where(e => e.EmployeeId == employeeId)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync(cancellationToken);

            _logger.LogInformation("Retrieved {Count} employee audit logs for employee {EmployeeId}",
                logs.Count, employeeId);
            return logs;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve employee audit logs for employee {EmployeeId}", employeeId);
            throw;
        }
    }

    public async Task<IEnumerable<EmployeeAuditLog>> GetByEmployeeNumberAsync(string employeeNumber, CancellationToken cancellationToken = default)
    {
        try
        {
            var logs = await GetActiveEntities()
                .Where(e => e.EmployeeNumber == employeeNumber)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync(cancellationToken);

            _logger.LogInformation("Retrieved {Count} employee audit logs for employee number {EmployeeNumber}",
                logs.Count, employeeNumber);
            return logs;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve employee audit logs for employee number {EmployeeNumber}", employeeNumber);
            throw;
        }
    }

    public async Task<IEnumerable<EmployeeAuditLog>> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default)
    {
        try
        {
            var logs = await GetActiveEntities()
                .Where(e => e.UserId == userId)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync(cancellationToken);

            _logger.LogInformation("Retrieved {Count} employee audit logs for user {UserId}", logs.Count, userId);
            return logs;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve employee audit logs for user {UserId}", userId);
            throw;
        }
    }

    public async Task<IEnumerable<EmployeeAuditLog>> GetByActionAsync(string action, CancellationToken cancellationToken = default)
    {
        try
        {
            var logs = await GetActiveEntities()
                .Where(e => e.Action == action)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync(cancellationToken);

            _logger.LogInformation("Retrieved {Count} employee audit logs for action {Action}", logs.Count, action);
            return logs;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve employee audit logs for action {Action}", action);
            throw;
        }
    }

    public async Task<IEnumerable<EmployeeAuditLog>> GetByFieldNameAsync(string fieldName, CancellationToken cancellationToken = default)
    {
        try
        {
            var logs = await GetActiveEntities()
                .Where(e => e.FieldName == fieldName)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync(cancellationToken);

            _logger.LogInformation("Retrieved {Count} employee audit logs for field {FieldName}", logs.Count, fieldName);
            return logs;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve employee audit logs for field {FieldName}", fieldName);
            throw;
        }
    }

    public async Task<IEnumerable<EmployeeAuditLog>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        try
        {
            var logs = await GetActiveEntities()
                .Where(e => e.CreatedAt >= startDate && e.CreatedAt <= endDate)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync(cancellationToken);

            _logger.LogInformation("Retrieved {Count} employee audit logs for date range {StartDate} to {EndDate}",
                logs.Count, startDate, endDate);
            return logs;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve employee audit logs for date range {StartDate} to {EndDate}",
                startDate, endDate);
            throw;
        }
    }

    public async Task<IEnumerable<EmployeeAuditLog>> GetUnapprovedLogsAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var logs = await GetActiveEntities()
                .Where(e => !e.IsApproved)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync(cancellationToken);

            _logger.LogInformation("Retrieved {Count} unapproved employee audit logs", logs.Count);
            return logs;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve unapproved employee audit logs");
            throw;
        }
    }

    public async Task<(IEnumerable<EmployeeAuditLog> Items, int TotalCount)> GetPaginatedAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        try
        {
            var query = GetActiveEntities().OrderByDescending(e => e.CreatedAt);

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            _logger.LogInformation("Retrieved {Count} employee audit logs (page {PageNumber} of {TotalPages})",
                items.Count, pageNumber, (int)Math.Ceiling((double)totalCount / pageSize));

            return (items, totalCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve paginated employee audit logs");
            throw;
        }
    }
}
