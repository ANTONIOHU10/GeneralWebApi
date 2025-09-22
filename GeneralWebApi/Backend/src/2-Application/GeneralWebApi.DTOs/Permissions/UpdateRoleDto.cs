using System.ComponentModel.DataAnnotations;

namespace GeneralWebApi.DTOs.Permissions;

/// <summary>
/// Update role data transfer object
/// </summary>
public class UpdateRoleDto
{
    [Required(ErrorMessage = "Role name is required")]
    [StringLength(50, MinimumLength = 2, ErrorMessage = "Role name must be between 2 and 50 characters")]
    public string Name { get; set; } = string.Empty;

    [StringLength(200, ErrorMessage = "Description cannot exceed 200 characters")]
    public string Description { get; set; } = string.Empty;

    public List<int> PermissionIds { get; set; } = [];
}
