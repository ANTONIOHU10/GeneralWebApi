namespace GeneralWebApi.DTOs.Position;

public class PositionSearchDto
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? SearchTerm { get; set; }
    public int? DepartmentId { get; set; }
    public int? Level { get; set; }
    public bool? IsManagement { get; set; }
    public string? SortBy { get; set; } = "Title";
    public bool SortDescending { get; set; } = false;
}



