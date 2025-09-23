using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Controllers.Base;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Audit;
using GeneralWebApi.Integration.Repository.AuditRepository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GeneralWebApi.WebApi.Controllers.v1;

/// <summary>
/// Controller for managing employee audit logs
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class EmployeeAuditLogsController : BaseController
{
    private readonly IEmployeeAuditLogRepository _employeeAuditLogRepository;
    private readonly ILogger<EmployeeAuditLogsController> _logger;

    public EmployeeAuditLogsController(
        IEmployeeAuditLogRepository employeeAuditLogRepository,
        ILogger<EmployeeAuditLogsController> logger)
    {
        _employeeAuditLogRepository = employeeAuditLogRepository ?? throw new ArgumentNullException(nameof(employeeAuditLogRepository));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Get employee audit logs with pagination and filtering
    /// </summary>
    /// <param name="searchDto">Search criteria</param>
    /// <returns>Paginated employee audit logs</returns>
    [HttpGet]
    [Authorize(Policy = "ManagerOrAdmin")]
    public async Task<ActionResult<ApiResponse<PagedResult<EmployeeAuditLogDto>>>> GetEmployeeAuditLogs([FromQuery] EmployeeAuditLogSearchDto searchDto)
    {
        return await ValidateAndExecuteAsync(searchDto, async (validatedDto) =>
        {
            var (items, totalCount) = await _employeeAuditLogRepository.GetPaginatedAsync(
                validatedDto.PageNumber,
                validatedDto.PageSize);

            var auditLogDtos = items.Select(MapToDto).ToList();
            var pagedResult = new PagedResult<EmployeeAuditLogDto>(auditLogDtos, totalCount, validatedDto.PageNumber, validatedDto.PageSize);

            return Ok(ApiResponse<PagedResult<EmployeeAuditLogDto>>.SuccessResult(pagedResult, "Employee audit logs retrieved successfully"));
        });
    }

    /// <summary>
    /// Get employee audit log by ID
    /// </summary>
    /// <param name="id">Employee audit log ID</param>
    /// <returns>Employee audit log details</returns>
    [HttpGet("{id}")]
    [Authorize(Policy = "ManagerOrAdmin")]
    public async Task<ActionResult<ApiResponse<EmployeeAuditLogDto>>> GetEmployeeAuditLog(int id)
    {
        return await ValidateAndExecuteAsync(id, async (validatedId) =>
        {
            var auditLog = await _employeeAuditLogRepository.GetByIdAsync(validatedId);
            var auditLogDto = MapToDto(auditLog);
            return Ok(ApiResponse<EmployeeAuditLogDto>.SuccessResult(auditLogDto, "Employee audit log retrieved successfully"));
        });
    }

    /// <summary>
    /// Get employee audit logs by employee ID
    /// </summary>
    /// <param name="employeeId">Employee ID</param>
    /// <returns>List of audit logs for the employee</returns>
    [HttpGet("employee/{employeeId}")]
    [Authorize(Policy = "ManagerOrAdmin")]
    public async Task<ActionResult<ApiResponse<List<EmployeeAuditLogDto>>>> GetEmployeeAuditLogsByEmployee(int employeeId)
    {
        return await ValidateAndExecuteAsync(employeeId, async (validatedEmployeeId) =>
        {
            var auditLogs = await _employeeAuditLogRepository.GetByEmployeeIdAsync(validatedEmployeeId);
            var auditLogDtos = auditLogs.Select(MapToDto).ToList();
            return Ok(ApiResponse<List<EmployeeAuditLogDto>>.SuccessResult(auditLogDtos, "Employee audit logs retrieved successfully"));
        });
    }

    /// <summary>
    /// Get employee audit logs by employee number
    /// </summary>
    /// <param name="employeeNumber">Employee number</param>
    /// <returns>List of audit logs for the employee</returns>
    [HttpGet("employee-number/{employeeNumber}")]
    [Authorize(Policy = "ManagerOrAdmin")]
    public async Task<ActionResult<ApiResponse<List<EmployeeAuditLogDto>>>> GetEmployeeAuditLogsByEmployeeNumber(string employeeNumber)
    {
        return await ValidateAndExecuteAsync(employeeNumber, async (validatedEmployeeNumber) =>
        {
            var auditLogs = await _employeeAuditLogRepository.GetByEmployeeNumberAsync(validatedEmployeeNumber);
            var auditLogDtos = auditLogs.Select(MapToDto).ToList();
            return Ok(ApiResponse<List<EmployeeAuditLogDto>>.SuccessResult(auditLogDtos, "Employee audit logs retrieved successfully"));
        });
    }

    /// <summary>
    /// Get employee audit logs by user ID
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <returns>List of audit logs for the user</returns>
    [HttpGet("user/{userId}")]
    [Authorize(Policy = "ManagerOrAdmin")]
    public async Task<ActionResult<ApiResponse<List<EmployeeAuditLogDto>>>> GetEmployeeAuditLogsByUser(string userId)
    {
        return await ValidateAndExecuteAsync(userId, async (validatedUserId) =>
        {
            var auditLogs = await _employeeAuditLogRepository.GetByUserIdAsync(validatedUserId);
            var auditLogDtos = auditLogs.Select(MapToDto).ToList();
            return Ok(ApiResponse<List<EmployeeAuditLogDto>>.SuccessResult(auditLogDtos, "User employee audit logs retrieved successfully"));
        });
    }

    /// <summary>
    /// Get employee audit logs by action
    /// </summary>
    /// <param name="action">Action performed</param>
    /// <returns>List of audit logs for the action</returns>
    [HttpGet("action/{action}")]
    [Authorize(Policy = "ManagerOrAdmin")]
    public async Task<ActionResult<ApiResponse<List<EmployeeAuditLogDto>>>> GetEmployeeAuditLogsByAction(string action)
    {
        return await ValidateAndExecuteAsync(action, async (validatedAction) =>
        {
            var auditLogs = await _employeeAuditLogRepository.GetByActionAsync(validatedAction);
            var auditLogDtos = auditLogs.Select(MapToDto).ToList();
            return Ok(ApiResponse<List<EmployeeAuditLogDto>>.SuccessResult(auditLogDtos, "Action employee audit logs retrieved successfully"));
        });
    }

    /// <summary>
    /// Get employee audit logs by field name
    /// </summary>
    /// <param name="fieldName">Field name</param>
    /// <returns>List of audit logs for the field</returns>
    [HttpGet("field/{fieldName}")]
    [Authorize(Policy = "ManagerOrAdmin")]
    public async Task<ActionResult<ApiResponse<List<EmployeeAuditLogDto>>>> GetEmployeeAuditLogsByField(string fieldName)
    {
        return await ValidateAndExecuteAsync(fieldName, async (validatedFieldName) =>
        {
            var auditLogs = await _employeeAuditLogRepository.GetByFieldNameAsync(validatedFieldName);
            var auditLogDtos = auditLogs.Select(MapToDto).ToList();
            return Ok(ApiResponse<List<EmployeeAuditLogDto>>.SuccessResult(auditLogDtos, "Field employee audit logs retrieved successfully"));
        });
    }

    /// <summary>
    /// Get unapproved employee audit logs
    /// </summary>
    /// <returns>List of unapproved employee audit logs</returns>
    [HttpGet("unapproved")]
    [Authorize(Policy = "ManagerOrAdmin")]
    public async Task<ActionResult<ApiResponse<List<EmployeeAuditLogDto>>>> GetUnapprovedEmployeeAuditLogs()
    {
        try
        {
            var auditLogs = await _employeeAuditLogRepository.GetUnapprovedLogsAsync();
            var auditLogDtos = auditLogs.Select(MapToDto).ToList();
            return Ok(ApiResponse<List<EmployeeAuditLogDto>>.SuccessResult(auditLogDtos, "Unapproved employee audit logs retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve unapproved employee audit logs");
            return StatusCode(500, ApiResponse<List<EmployeeAuditLogDto>>.ErrorResult("Failed to retrieve unapproved employee audit logs"));
        }
    }

    /// <summary>
    /// Get employee audit log statistics
    /// </summary>
    /// <returns>Employee audit log statistics</returns>
    [HttpGet("statistics")]
    [Authorize(Policy = "ManagerOrAdmin")]
    public async Task<ActionResult<ApiResponse<object>>> GetEmployeeAuditLogStatistics()
    {
        try
        {
            var allLogs = await _employeeAuditLogRepository.GetAllAsync();

            var statistics = new
            {
                TotalLogs = allLogs.Count(),
                ApprovedLogs = allLogs.Count(l => l.IsApproved),
                UnapprovedLogs = allLogs.Count(l => !l.IsApproved),
                SuccessfulLogs = allLogs.Count(l => l.IsSuccess),
                FailedLogs = allLogs.Count(l => !l.IsSuccess),
                LogsByAction = allLogs.GroupBy(l => l.Action)
                    .ToDictionary(g => g.Key, g => g.Count()),
                LogsByField = allLogs.GroupBy(l => l.FieldName)
                    .Where(g => !string.IsNullOrEmpty(g.Key))
                    .ToDictionary(g => g.Key!, g => g.Count()),
                LogsBySeverity = allLogs.GroupBy(l => l.Severity)
                    .ToDictionary(g => g.Key, g => g.Count()),
                RecentLogs = allLogs.OrderByDescending(l => l.CreatedAt).Take(10).Select(MapToDto).ToList()
            };

            return Ok(ApiResponse<object>.SuccessResult(statistics, "Employee audit log statistics retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve employee audit log statistics");
            return StatusCode(500, ApiResponse<object>.ErrorResult("Failed to retrieve employee audit log statistics"));
        }
    }

    #region Private Helper Methods

    private static EmployeeAuditLogDto MapToDto(Domain.Entities.Audit.EmployeeAuditLog auditLog)
    {
        return new EmployeeAuditLogDto
        {
            Id = auditLog.Id,
            EmployeeId = auditLog.EmployeeId,
            EmployeeName = auditLog.EmployeeName,
            EmployeeNumber = auditLog.EmployeeNumber,
            UserId = auditLog.UserId,
            UserName = auditLog.UserName,
            Action = auditLog.Action,
            FieldName = auditLog.FieldName,
            OldValue = auditLog.OldValue,
            NewValue = auditLog.NewValue,
            IpAddress = auditLog.IpAddress,
            RequestPath = auditLog.RequestPath,
            Details = auditLog.Details,
            Reason = auditLog.Reason,
            IsApproved = auditLog.IsApproved,
            ApprovedAt = auditLog.ApprovedAt,
            ApprovedBy = auditLog.ApprovedBy,
            Severity = auditLog.Severity,
            IsSuccess = auditLog.IsSuccess,
            ErrorMessage = auditLog.ErrorMessage,
            CreatedAt = auditLog.CreatedAt,
            UpdatedAt = auditLog.UpdatedAt
        };
    }

    #endregion
}
