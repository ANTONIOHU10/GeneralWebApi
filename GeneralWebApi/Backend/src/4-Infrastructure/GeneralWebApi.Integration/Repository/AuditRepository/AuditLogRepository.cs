using GeneralWebApi.Domain.Entities.Audit;
using GeneralWebApi.Integration.Context;
using GeneralWebApi.Integration.Repository.Base;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace GeneralWebApi.Integration.Repository.AuditRepository;

/// <summary>
/// Repository implementation for audit log operations
/// </summary>
public class AuditLogRepository : BaseRepository<AuditLog>, IAuditLogRepository
{
    public AuditLogRepository(ApplicationDbContext context, ILogger<AuditLogRepository> logger)
        : base(context, logger)
    {
    }

    public async Task<IEnumerable<AuditLog>> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default)
    {
        try
        {
            var logs = await GetActiveEntities()
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync(cancellationToken);

            _logger.LogInformation("Retrieved {Count} audit logs for user {UserId}", logs.Count, userId);
            return logs;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve audit logs for user {UserId}", userId);
            throw;
        }
    }

    public async Task<IEnumerable<AuditLog>> GetByEntityAsync(string entityType, string entityId, CancellationToken cancellationToken = default)
    {
        try
        {
            var logs = await GetActiveEntities()
                .Where(a => a.EntityType == entityType && a.EntityId == entityId)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync(cancellationToken);

            _logger.LogInformation("Retrieved {Count} audit logs for entity {EntityType}:{EntityId}",
                logs.Count, entityType, entityId);
            return logs;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve audit logs for entity {EntityType}:{EntityId}",
                entityType, entityId);
            throw;
        }
    }

    public async Task<IEnumerable<AuditLog>> GetByActionAsync(string action, CancellationToken cancellationToken = default)
    {
        try
        {
            var logs = await GetActiveEntities()
                .Where(a => a.Action == action)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync(cancellationToken);

            _logger.LogInformation("Retrieved {Count} audit logs for action {Action}", logs.Count, action);
            return logs;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve audit logs for action {Action}", action);
            throw;
        }
    }

    public async Task<IEnumerable<AuditLog>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        try
        {
            var logs = await GetActiveEntities()
                .Where(a => a.CreatedAt >= startDate && a.CreatedAt <= endDate)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync(cancellationToken);

            _logger.LogInformation("Retrieved {Count} audit logs for date range {StartDate} to {EndDate}",
                logs.Count, startDate, endDate);
            return logs;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve audit logs for date range {StartDate} to {EndDate}",
                startDate, endDate);
            throw;
        }
    }

    public async Task<IEnumerable<AuditLog>> GetBySeverityAsync(string severity, CancellationToken cancellationToken = default)
    {
        try
        {
            var logs = await GetActiveEntities()
                .Where(a => a.Severity == severity)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync(cancellationToken);

            _logger.LogInformation("Retrieved {Count} audit logs for severity {Severity}", logs.Count, severity);
            return logs;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve audit logs for severity {Severity}", severity);
            throw;
        }
    }

    public async Task<IEnumerable<AuditLog>> GetFailedLogsAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var logs = await GetActiveEntities()
                .Where(a => !a.IsSuccess)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync(cancellationToken);

            _logger.LogInformation("Retrieved {Count} failed audit logs", logs.Count);
            return logs;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve failed audit logs");
            throw;
        }
    }

    public async Task<(IEnumerable<AuditLog> Items, int TotalCount)> GetPaginatedAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        try
        {
            var query = GetActiveEntities().OrderByDescending(a => a.CreatedAt);

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            _logger.LogInformation("Retrieved {Count} audit logs (page {PageNumber} of {TotalPages})",
                items.Count, pageNumber, (int)Math.Ceiling((double)totalCount / pageSize));

            return (items, totalCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve paginated audit logs");
            throw;
        }
    }
}
