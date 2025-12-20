using GeneralWebApi.Domain.Entities.Audit;
using GeneralWebApi.DTOs.Audit;
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

    public async Task<(IEnumerable<AuditLog> Items, int TotalCount)> GetPaginatedAsync(AuditLogSearchDto searchDto, CancellationToken cancellationToken = default)
    {
        try
        {
            var query = GetActiveEntities().AsQueryable();

            // Apply filters
            if (!string.IsNullOrWhiteSpace(searchDto.UserId))
            {
                query = query.Where(a => a.UserId == searchDto.UserId);
            }

            if (!string.IsNullOrWhiteSpace(searchDto.Action))
            {
                query = query.Where(a => a.Action == searchDto.Action);
            }

            if (!string.IsNullOrWhiteSpace(searchDto.EntityType))
            {
                query = query.Where(a => a.EntityType == searchDto.EntityType);
            }

            if (!string.IsNullOrWhiteSpace(searchDto.EntityId))
            {
                query = query.Where(a => a.EntityId == searchDto.EntityId);
            }

            if (!string.IsNullOrWhiteSpace(searchDto.Severity))
            {
                query = query.Where(a => a.Severity == searchDto.Severity);
            }

            if (!string.IsNullOrWhiteSpace(searchDto.Category))
            {
                query = query.Where(a => a.Category == searchDto.Category);
            }

            if (searchDto.IsSuccess.HasValue)
            {
                query = query.Where(a => a.IsSuccess == searchDto.IsSuccess.Value);
            }

            if (searchDto.StartDate.HasValue)
            {
                query = query.Where(a => a.CreatedAt >= searchDto.StartDate.Value);
            }

            if (searchDto.EndDate.HasValue)
            {
                query = query.Where(a => a.CreatedAt <= searchDto.EndDate.Value);
            }

            // Apply sorting
            query = query.OrderByDescending(a => a.CreatedAt);

            // Get total count
            var totalCount = await query.CountAsync(cancellationToken);

            // Apply pagination
            var items = await query
                .Skip((searchDto.PageNumber - 1) * searchDto.PageSize)
                .Take(searchDto.PageSize)
                .ToListAsync(cancellationToken);

            _logger.LogInformation("Retrieved {Count} audit logs (page {PageNumber} of {TotalPages}) with filters",
                items.Count, searchDto.PageNumber, (int)Math.Ceiling((double)totalCount / searchDto.PageSize));

            return (items, totalCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve filtered paginated audit logs");
            throw;
        }
    }
}
