namespace GeneralWebApi.DTOs.Employee;

/// <summary>
/// Lightweight DTO for manager lookup (dropdowns and selectors).
/// </summary>
public class ManagerLookupDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? EmployeeNumber { get; set; }
}

