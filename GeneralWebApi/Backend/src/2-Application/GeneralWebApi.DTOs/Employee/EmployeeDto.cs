namespace GeneralWebApi.DTOs.Employee;
public class EmployeeDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string EmployeeNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public int? DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public int? PositionId { get; set; }
    public string? PositionTitle { get; set; }
    public int? ManagerId { get; set; }
    public string? ManagerName { get; set; }
    public DateTime HireDate { get; set; }
    public DateTime? TerminationDate { get; set; }
    public string EmploymentStatus { get; set; } = string.Empty;
    public string EmploymentType { get; set; } = string.Empty;
    public bool IsManager { get; set; }
    public int? WorkingHoursPerWeek { get; set; }
    public decimal? CurrentSalary { get; set; }
    public string? SalaryCurrency { get; set; }
    public DateTime? LastSalaryIncreaseDate { get; set; }
    public DateTime? NextSalaryIncreaseDate { get; set; }
    public DateTime? ContractEndDate { get; set; }
    public string? ContractType { get; set; }
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string EmergencyContactName { get; set; } = string.Empty;
    public string EmergencyContactPhone { get; set; } = string.Empty;
    public string EmergencyContactRelation { get; set; } = string.Empty;
    public string TaxCode { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
    public bool IsActive { get; set; }
    public int Version { get; set; }
    public int SortOrder { get; set; }
    public string? Remarks { get; set; }
}