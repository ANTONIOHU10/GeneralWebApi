namespace GeneralWebApi.DTOs.Audit;

/// <summary>
/// DTO for employee audit log data
/// </summary>
public class EmployeeAuditLogDto
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string EmployeeNumber { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string? FieldName { get; set; }
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
    public string IpAddress { get; set; } = string.Empty;
    public string RequestPath { get; set; } = string.Empty;
    public string? Details { get; set; }
    public string? Reason { get; set; }
    public bool IsApproved { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public string? ApprovedBy { get; set; }
    public string Severity { get; set; } = string.Empty;
    public bool IsSuccess { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// DTO for employee audit log search criteria
/// </summary>
public class EmployeeAuditLogSearchDto
{
    public int? EmployeeId { get; set; }
    public string? EmployeeNumber { get; set; }
    public string? UserId { get; set; }
    public string? Action { get; set; }
    public string? FieldName { get; set; }
    public string? Severity { get; set; }
    public bool? IsApproved { get; set; }
    public bool? IsSuccess { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

/// <summary>
/// DTO for creating employee audit log
/// </summary>
public class CreateEmployeeAuditLogDto
{
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string EmployeeNumber { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string? FieldName { get; set; }
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
    public string IpAddress { get; set; } = string.Empty;
    public string RequestPath { get; set; } = string.Empty;
    public string? Details { get; set; }
    public string? Reason { get; set; }
    public bool IsApproved { get; set; } = true;
    public string Severity { get; set; } = "Info";
    public bool IsSuccess { get; set; } = true;
    public string? ErrorMessage { get; set; }
}
