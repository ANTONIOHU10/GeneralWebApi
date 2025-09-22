using System.ComponentModel.DataAnnotations;

namespace GeneralWebApi.DTOs.Permissions;

/// <summary>
/// Create permission data transfer object
/// </summary>
public class CreatePermissionDto
{
    [Required(ErrorMessage = "Permission name is required")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Permission name must be between 2 and 100 characters")]
    public string Name { get; set; } = string.Empty;

    [StringLength(200, ErrorMessage = "Description cannot exceed 200 characters")]
    public string Description { get; set; } = string.Empty;

    [Required(ErrorMessage = "Resource is required")]
    [StringLength(50, MinimumLength = 2, ErrorMessage = "Resource must be between 2 and 50 characters")]
    public string Resource { get; set; } = string.Empty;

    [Required(ErrorMessage = "Action is required")]
    [StringLength(50, MinimumLength = 2, ErrorMessage = "Action must be between 2 and 50 characters")]
    public string Action { get; set; } = string.Empty;

    [Required(ErrorMessage = "Category is required")]
    [StringLength(50, MinimumLength = 2, ErrorMessage = "Category must be between 2 and 50 characters")]
    public string Category { get; set; } = string.Empty;
}
