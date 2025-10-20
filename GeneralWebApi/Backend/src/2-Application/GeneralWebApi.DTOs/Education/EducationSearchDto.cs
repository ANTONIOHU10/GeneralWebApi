namespace GeneralWebApi.DTOs.Education;

public class EducationSearchDto
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? SearchTerm { get; set; }
    public int? EmployeeId { get; set; }
    public string? Institution { get; set; }
    public string? Degree { get; set; }
    public string? FieldOfStudy { get; set; }
    public string? SortBy { get; set; } = "StartDate";
    public bool SortDescending { get; set; } = true;
}





