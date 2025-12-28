namespace GeneralWebApi.DTOs.Employee;
public class CreateEmployeeDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    // Optional: if not provided, the system will generate a unique employee number
    public string? EmployeeNumber { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public int? DepartmentId { get; set; }
    public int? PositionId { get; set; }
    public int? ManagerId { get; set; }
    public DateTime HireDate { get; set; }
    public string EmploymentStatus { get; set; } = string.Empty;
    public string EmploymentType { get; set; } = string.Empty;
    public decimal? CurrentSalary { get; set; }
    public string? SalaryCurrency { get; set; }
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string EmergencyContactName { get; set; } = string.Empty;
    public string EmergencyContactPhone { get; set; } = string.Empty;
    public string EmergencyContactRelation { get; set; } = string.Empty;
    // Required: Tax code (fiscal code) - database column does not allow NULL
    public string TaxCode { get; set; } = string.Empty;
    // Optional: Avatar URL for employee profile picture
    public string? Avatar { get; set; }
}