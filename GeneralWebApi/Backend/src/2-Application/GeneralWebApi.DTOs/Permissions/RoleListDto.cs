namespace GeneralWebApi.DTOs.Permissions;

/// <summary>
/// Role list data transfer object
/// </summary>
public class RoleListDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int EmployeeCount { get; set; }
    public int PermissionCount { get; set; }
    public DateTime CreatedAt { get; set; }
}
