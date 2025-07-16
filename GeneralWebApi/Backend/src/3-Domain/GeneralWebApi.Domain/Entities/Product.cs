using GeneralWebApi.Domain.Entities.Base;

namespace GeneralWebApi.Domain.Entities;

public class Product : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }

    // foreign key
    public int UserId { get; set; }

    // navigation property
    public User User { get; set; } = new User();

}