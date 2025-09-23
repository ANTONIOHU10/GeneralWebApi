using GeneralWebApi.Application.Services;
using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Controllers.Base;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Audit;
using GeneralWebApi.Integration.Repository.AuditRepository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GeneralWebApi.WebApi.Controllers.v1;

/// <summary>
/// Controller for managing audit logs
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class AuditLogsController : BaseController
{
    private readonly IAuditLogRepository _auditLogRepository;
    private readonly ILogger<AuditLogsController> _logger;

    public AuditLogsController(
        IAuditLogRepository auditLogRepository,
        ILogger<AuditLogsController> logger)
    {
        _auditLogRepository = auditLogRepository ?? throw new ArgumentNullException(nameof(auditLogRepository));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Get audit logs with pagination and filtering
    /// </summary>
    /// <param name="searchDto">Search criteria</param>
    /// <returns>Paginated audit logs</returns>
    [HttpGet]
    [Authorize(Policy = "ManagerOrAdmin")]
    public async Task<ActionResult<ApiResponse<PagedResult<AuditLogDto>>>> GetAuditLogs([FromQuery] AuditLogSearchDto searchDto)
    {
        return await ValidateAndExecuteAsync(searchDto, async (validatedDto) =>
        {
            var (items, totalCount) = await _auditLogRepository.GetPaginatedAsync(
                validatedDto.PageNumber,
                validatedDto.PageSize);

            var auditLogDtos = items.Select(MapToDto).ToList();
            var pagedResult = new PagedResult<AuditLogDto>(auditLogDtos, totalCount, validatedDto.PageNumber, validatedDto.PageSize);

            return Ok(ApiResponse<PagedResult<AuditLogDto>>.SuccessResult(pagedResult, "Audit logs retrieved successfully"));
        });
    }

    /// <summary>
    /// Get audit log by ID
    /// </summary>
    /// <param name="id">Audit log ID</param>
    /// <returns>Audit log details</returns>
    [HttpGet("{id}")]
    [Authorize(Policy = "ManagerOrAdmin")]
    public async Task<ActionResult<ApiResponse<AuditLogDto>>> GetAuditLog(int id)
    {
        return await ValidateAndExecuteAsync(id, async (validatedId) =>
        {
            var auditLog = await _auditLogRepository.GetByIdAsync(validatedId);
            var auditLogDto = MapToDto(auditLog);
            return Ok(ApiResponse<AuditLogDto>.SuccessResult(auditLogDto, "Audit log retrieved successfully"));
        });
    }

    /// <summary>
    /// Get audit logs by user ID
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>List of audit logs for the user</returns>
    [HttpGet("user/{userId}")]
    [Authorize(Policy = "ManagerOrAdmin")]
    public async Task<ActionResult<ApiResponse<List<AuditLogDto>>>> GetAuditLogsByUser(string userId)
    {
        return await ValidateAndExecuteAsync(userId, async (validatedUserId) =>
        {
            var auditLogs = await _auditLogRepository.GetByUserIdAsync(validatedUserId);
            var auditLogDtos = auditLogs.Select(MapToDto).ToList();
            return Ok(ApiResponse<List<AuditLogDto>>.SuccessResult(auditLogDtos, "User audit logs retrieved successfully"));
        });
    }

    /// <summary>
    /// Get audit logs by entity
    /// </summary>
    /// <param name="entityType">Entity type</param>
    /// <param name="entityId">Entity ID</param>
    /// <returns>List of audit logs for the entity</returns>
    [HttpGet("entity/{entityType}/{entityId}")]
    [Authorize(Policy = "ManagerOrAdmin")]
    public async Task<ActionResult<ApiResponse<List<AuditLogDto>>>> GetAuditLogsByEntity(string entityType, string entityId)
    {
        return await ValidateAndExecuteAsync((entityType, entityId), async (validatedParams) =>
        {
            var auditLogs = await _auditLogRepository.GetByEntityAsync(validatedParams.entityType, validatedParams.entityId);
            var auditLogDtos = auditLogs.Select(MapToDto).ToList();
            return Ok(ApiResponse<List<AuditLogDto>>.SuccessResult(auditLogDtos, "Entity audit logs retrieved successfully"));
        });
    }

    /// <summary>
    /// Get audit logs by action
    /// </summary>
    /// <param name="action">Action performed</param>
    /// <returns>List of audit logs for the action</returns>
    [HttpGet("action/{action}")]
    [Authorize(Policy = "ManagerOrAdmin")]
    public async Task<ActionResult<ApiResponse<List<AuditLogDto>>>> GetAuditLogsByAction(string action)
    {
        return await ValidateAndExecuteAsync(action, async (validatedAction) =>
        {
            var auditLogs = await _auditLogRepository.GetByActionAsync(validatedAction);
            var auditLogDtos = auditLogs.Select(MapToDto).ToList();
            return Ok(ApiResponse<List<AuditLogDto>>.SuccessResult(auditLogDtos, "Action audit logs retrieved successfully"));
        });
    }

    /// <summary>
    /// Get audit logs by date range
    /// </summary>
    /// <param name="startDate">Start date</param>
    /// <param name="endDate">End date</param>
    /// <returns>List of audit logs in the date range</returns>
    [HttpGet("date-range")]
    [Authorize(Policy = "ManagerOrAdmin")]
    public async Task<ActionResult<ApiResponse<List<AuditLogDto>>>> GetAuditLogsByDateRange([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        return await ValidateAndExecuteAsync((startDate, endDate), async (validatedParams) =>
        {
            var auditLogs = await _auditLogRepository.GetByDateRangeAsync(validatedParams.startDate, validatedParams.endDate);
            var auditLogDtos = auditLogs.Select(MapToDto).ToList();
            return Ok(ApiResponse<List<AuditLogDto>>.SuccessResult(auditLogDtos, "Date range audit logs retrieved successfully"));
        });
    }

    /// <summary>
    /// Get failed audit logs
    /// </summary>
    /// <returns>List of failed audit logs</returns>
    [HttpGet("failed")]
    [Authorize(Policy = "ManagerOrAdmin")]
    public async Task<ActionResult<ApiResponse<List<AuditLogDto>>>> GetFailedAuditLogs()
    {
        try
        {
            var auditLogs = await _auditLogRepository.GetFailedLogsAsync();
            var auditLogDtos = auditLogs.Select(MapToDto).ToList();
            return Ok(ApiResponse<List<AuditLogDto>>.SuccessResult(auditLogDtos, "Failed audit logs retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve failed audit logs");
            return StatusCode(500, ApiResponse<List<AuditLogDto>>.ErrorResult("Failed to retrieve failed audit logs"));
        }
    }

    /// <summary>
    /// Get audit log statistics
    /// </summary>
    /// <returns>Audit log statistics</returns>
    [HttpGet("statistics")]
    [Authorize(Policy = "ManagerOrAdmin")]
    public async Task<ActionResult<ApiResponse<object>>> GetAuditLogStatistics()
    {
        try
        {
            var allLogs = await _auditLogRepository.GetAllAsync();

            var statistics = new
            {
                TotalLogs = allLogs.Count(),
                SuccessfulLogs = allLogs.Count(l => l.IsSuccess),
                FailedLogs = allLogs.Count(l => !l.IsSuccess),
                LogsByAction = allLogs.GroupBy(l => l.Action)
                    .ToDictionary(g => g.Key, g => g.Count()),
                LogsBySeverity = allLogs.GroupBy(l => l.Severity)
                    .ToDictionary(g => g.Key, g => g.Count()),
                LogsByCategory = allLogs.GroupBy(l => l.Category)
                    .ToDictionary(g => g.Key, g => g.Count()),
                RecentLogs = allLogs.OrderByDescending(l => l.CreatedAt).Take(10).Select(MapToDto).ToList()
            };

            return Ok(ApiResponse<object>.SuccessResult(statistics, "Audit log statistics retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve audit log statistics");
            return StatusCode(500, ApiResponse<object>.ErrorResult("Failed to retrieve audit log statistics"));
        }
    }

    #region Private Helper Methods

    private static AuditLogDto MapToDto(Domain.Entities.Audit.AuditLog auditLog)
    {
        return new AuditLogDto
        {
            Id = auditLog.Id,
            UserId = auditLog.UserId,
            UserName = auditLog.UserName,
            Action = auditLog.Action,
            EntityType = auditLog.EntityType,
            EntityId = auditLog.EntityId,
            EntityName = auditLog.EntityName,
            IpAddress = auditLog.IpAddress,
            UserAgent = auditLog.UserAgent,
            RequestPath = auditLog.RequestPath,
            HttpMethod = auditLog.HttpMethod,
            RequestId = auditLog.RequestId,
            Details = auditLog.Details,
            OldValues = auditLog.OldValues,
            NewValues = auditLog.NewValues,
            Severity = auditLog.Severity,
            Category = auditLog.Category,
            IsSuccess = auditLog.IsSuccess,
            ErrorMessage = auditLog.ErrorMessage,
            DurationMs = auditLog.DurationMs,
            CreatedAt = auditLog.CreatedAt,
            UpdatedAt = auditLog.UpdatedAt
        };
    }

    #endregion
}
