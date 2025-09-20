namespace GeneralWebApi.DTOs.Education;

public class CreateEducationDto
{
    public int EmployeeId { get; set; }
    public string Institution { get; set; } = string.Empty;
    public string Degree { get; set; } = string.Empty;
    public string FieldOfStudy { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string Grade { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

