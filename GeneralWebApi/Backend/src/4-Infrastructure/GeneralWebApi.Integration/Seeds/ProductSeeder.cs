using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Domain.Enums;
using GeneralWebApi.Integration.Context;
using Microsoft.EntityFrameworkCore;

namespace GeneralWebApi.Integration.Seeds;

public class ProductSeeder
{
    public static async Task SeedAsync(ApplicationDbContext dbContext)
    {
        if (!dbContext.Products.Any())
        {

            var products = new List<Product>
            {
                new Product {Name="Profume", Description="Dior Thierry Mugler", Price=50, CreatedAt=DateTime.UtcNow,CreatedBy="System",IsActive=true,IsDeleted=false,Version=1,SortOrder=1},
                new Product {Name="Watch", Description="Rolex", Price=100, CreatedAt=DateTime.UtcNow,CreatedBy="System",IsActive=true,IsDeleted=false,Version=1,SortOrder=2},
                new Product {Name="Bag", Description="Louis Vuitton", Price=500, CreatedAt=DateTime.UtcNow,CreatedBy="System",IsActive=true,IsDeleted=false,Version=1,SortOrder=3},
            };

            await dbContext.Products.AddRangeAsync(products);
            await dbContext.SaveChangesAsync();
        }
    }
}