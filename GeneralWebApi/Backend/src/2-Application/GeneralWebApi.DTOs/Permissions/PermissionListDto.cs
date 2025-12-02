namespace GeneralWebApi.DTOs.Permissions;

/// <summary>
/// Permission list data transfer object
/// </summary>
public class PermissionListDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Resource { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int RoleCount { get; set; }
    public DateTime CreatedAt { get; set; }
}
