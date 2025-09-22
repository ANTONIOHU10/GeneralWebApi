namespace GeneralWebApi.DTOs.Permissions;

/// <summary>
/// Permission search data transfer object
/// </summary>
public class PermissionSearchDto
{
    public string? Name { get; set; }
    public string? Resource { get; set; }
    public string? Action { get; set; }
    public string? Category { get; set; }
    public DateTime? CreatedFrom { get; set; }
    public DateTime? CreatedTo { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? SortBy { get; set; } = "Name";
    public bool SortDescending { get; set; } = false;
}
