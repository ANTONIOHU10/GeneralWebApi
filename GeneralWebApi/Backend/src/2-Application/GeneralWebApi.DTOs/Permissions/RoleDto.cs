namespace GeneralWebApi.DTOs.Permissions;

/// <summary>
/// Role data transfer object
/// </summary>
public class RoleDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<PermissionDto> Permissions { get; set; } = [];
    public int EmployeeCount { get; set; }
}
