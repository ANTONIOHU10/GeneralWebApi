namespace GeneralWebApi.DTOs.Certification;

public class CertificationSearchDto
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? SearchTerm { get; set; }
    public int? EmployeeId { get; set; }
    public string? SortBy { get; set; } = "IssueDate";
    public bool SortDescending { get; set; } = true;
}



