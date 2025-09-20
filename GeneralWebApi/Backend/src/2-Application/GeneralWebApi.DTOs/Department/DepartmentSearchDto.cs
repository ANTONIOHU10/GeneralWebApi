namespace GeneralWebApi.DTOs.Department;

public class DepartmentSearchDto
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? SearchTerm { get; set; }
    public int? ParentDepartmentId { get; set; }
    public int? Level { get; set; }
    public string? SortBy { get; set; } = "Name";
    public bool SortDescending { get; set; } = false;
}

