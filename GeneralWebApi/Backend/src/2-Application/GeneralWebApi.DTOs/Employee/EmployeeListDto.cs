namespace GeneralWebApi.DTOs.Employee;
public class EmployeeListDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string EmployeeNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public int? DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public int? PositionId { get; set; }
    public string? PositionTitle { get; set; }
    public int? ManagerId { get; set; }
    public string? ManagerName { get; set; }
    public bool IsManager { get; set; }
    public string EmploymentStatus { get; set; } = string.Empty;
    public string EmploymentType { get; set; } = string.Empty;
    public DateTime HireDate { get; set; }
    public DateTime? TerminationDate { get; set; }
    public DateTime? ContractEndDate { get; set; }
    public string? ContractType { get; set; }
    public decimal? CurrentSalary { get; set; }
    public string? SalaryCurrency { get; set; }
    public int? WorkingHoursPerWeek { get; set; }
    public bool IsActive { get; set; }
    public int SortOrder { get; set; }
}