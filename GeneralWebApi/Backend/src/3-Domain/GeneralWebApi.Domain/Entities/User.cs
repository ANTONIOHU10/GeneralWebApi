using GeneralWebApi.Domain.Entities.Base;
using GeneralWebApi.Domain.Enums;
using GeneralWebApi.Domain.Entities.Anagraphy;

namespace GeneralWebApi.Domain.Entities;

public class User : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string Role { get; set; } = string.Empty;

    // 新增：关联到 Employee
    public int? EmployeeId { get; set; }
    public Employee? Employee { get; set; }

    // 保留原有的导航属性
    public ICollection<Product> Products { get; set; } = new List<Product>();
}