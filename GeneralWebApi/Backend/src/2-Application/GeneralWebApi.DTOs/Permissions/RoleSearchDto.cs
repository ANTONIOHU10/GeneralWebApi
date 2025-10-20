namespace GeneralWebApi.DTOs.Permissions;

/// <summary>
/// Role search data transfer object
/// </summary>
public class RoleSearchDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public int? MinEmployeeCount { get; set; }
    public int? MaxEmployeeCount { get; set; }
    public DateTime? CreatedFrom { get; set; }
    public DateTime? CreatedTo { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? SortBy { get; set; } = "Name";
    public bool SortDescending { get; set; } = false;
}
