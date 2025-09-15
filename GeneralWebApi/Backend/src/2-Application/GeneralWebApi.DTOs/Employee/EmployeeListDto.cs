namespace GeneralWebApi.DTOs.Employee;
public class EmployeeListDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string EmployeeNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? DepartmentName { get; set; }
    public string? PositionTitle { get; set; }
    public string EmploymentStatus { get; set; } = string.Empty;
    public DateTime HireDate { get; set; }
}