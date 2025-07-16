using GeneralWebApi.Domain.Entities.Base;

namespace GeneralWebApi.Domain.Entities;

public class User : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }

    // navigation property
    public ICollection<Product> Products { get; set; } = new List<Product>();


}