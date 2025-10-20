namespace GeneralWebApi.DTOs.Users;

/// <summary>
/// User DTO
/// </summary>
public class UserDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string Role { get; set; } = string.Empty;
    public int? EmployeeId { get; set; }
    public string? EmployeeName { get; set; } // Employee full name
    public DateTime CreatedAt { get; set; }
}
