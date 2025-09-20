namespace GeneralWebApi.DTOs.Users;

/// <summary>
/// Create User Request DTO
/// </summary>
public class CreateUserRequest
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string Role { get; set; } = "User";

    // Optional employee information
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public int? DepartmentId { get; set; }
    public int? PositionId { get; set; }
}


