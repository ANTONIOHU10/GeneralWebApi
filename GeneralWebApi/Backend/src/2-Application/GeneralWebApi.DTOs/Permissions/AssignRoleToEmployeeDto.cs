using System.ComponentModel.DataAnnotations;

namespace GeneralWebApi.DTOs.Permissions;

/// <summary>
/// Assign role to employee data transfer object
/// </summary>
public class AssignRoleToEmployeeDto
{
    [Required(ErrorMessage = "Employee ID is required")]
    public int EmployeeId { get; set; }

    [Required(ErrorMessage = "Role ID is required")]
    public int RoleId { get; set; }

    public DateTime? ExpiryDate { get; set; }
}
