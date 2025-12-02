namespace GeneralWebApi.DTOs.Users;

/// <summary>
/// Update User Request DTO
/// </summary>
public class UpdateUserRequest
{
    public string? Username { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Role { get; set; }

    // Optional employee information
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public int? DepartmentId { get; set; }
    public int? PositionId { get; set; }
}

