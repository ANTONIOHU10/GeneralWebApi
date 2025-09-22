namespace GeneralWebApi.DTOs.Permissions;

/// <summary>
/// Employee role search data transfer object
/// </summary>
public class EmployeeRoleSearchDto
{
    public int? EmployeeId { get; set; }
    public string? EmployeeName { get; set; }
    public string? EmployeeNumber { get; set; }
    public int? RoleId { get; set; }
    public string? RoleName { get; set; }
    public bool? IsActive { get; set; }
    public DateTime? AssignedFrom { get; set; }
    public DateTime? AssignedTo { get; set; }
    public DateTime? ExpiryFrom { get; set; }
    public DateTime? ExpiryTo { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? SortBy { get; set; } = "AssignedDate";
    public bool SortDescending { get; set; } = true;
}
