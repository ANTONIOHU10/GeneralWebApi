namespace GeneralWebApi.DTOs.Users;

/// <summary>
/// User with Employee information DTO
/// </summary>
public class UserWithEmployeeDto
{
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string Role { get; set; } = string.Empty;
    public int? EmployeeId { get; set; }
    public string? EmployeeName { get; set; }
    public string? EmployeeNumber { get; set; }
    public string? DepartmentName { get; set; }
    public string? PositionName { get; set; }
    public DateTime CreatedAt { get; set; }
}


