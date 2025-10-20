namespace GeneralWebApi.DTOs.Employee;
public class EmployeeSearchDto
{
    public string? SearchTerm { get; set; }
    public int? DepartmentId { get; set; }
    public int? PositionId { get; set; }
    public string? EmploymentStatus { get; set; }
    public DateTime? HireDateFrom { get; set; }
    public DateTime? HireDateTo { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? SortBy { get; set; }
    public bool SortDescending { get; set; } = false;
}