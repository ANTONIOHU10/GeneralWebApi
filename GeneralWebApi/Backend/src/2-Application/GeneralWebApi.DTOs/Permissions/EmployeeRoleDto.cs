namespace GeneralWebApi.DTOs.Permissions;

/// <summary>
/// Employee role assignment data transfer object
/// </summary>
public class EmployeeRoleDto
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string EmployeeNumber { get; set; } = string.Empty;
    public int RoleId { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public DateTime AssignedDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public bool IsActive { get; set; }
}
