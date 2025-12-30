namespace GeneralWebApi.DTOs.Employee;

/// <summary>
/// DTO for employee hierarchy tree structure
/// </summary>
public class EmployeeHierarchyDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string EmployeeNumber { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? PositionTitle { get; set; }
    public string? DepartmentName { get; set; }
    public string? Avatar { get; set; }
    public bool IsManager { get; set; }
    public string EmploymentStatus { get; set; } = string.Empty;
    
    /// <summary>
    /// Manager information (upward relationship)
    /// </summary>
    public EmployeeHierarchyDto? Manager { get; set; }
    
    /// <summary>
    /// Subordinates list (downward relationships)
    /// </summary>
    public List<EmployeeHierarchyDto> Subordinates { get; set; } = new();
    
    /// <summary>
    /// Full name for display
    /// </summary>
    public string FullName => $"{FirstName} {LastName}";
}

