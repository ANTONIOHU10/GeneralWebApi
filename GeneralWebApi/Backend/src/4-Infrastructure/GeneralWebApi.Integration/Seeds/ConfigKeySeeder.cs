using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Integration.Context;

namespace GeneralWebApi.Integration.Seeds;

public class ConfigKeySeeder
{
    public static async Task SeedAsync(ApplicationDbContext dbContext)
    {
        if (!dbContext.ConfigKeys.Any())
        {
            var configKeys = new List<ConfigKey>
            {
                new() {
                    Value = "",
                    Type = "JWT",
                    Description = "JWT 32 bytes Secret Key"
                }
            };

            await dbContext.ConfigKeys.AddRangeAsync(configKeys);
            await dbContext.SaveChangesAsync();
        }
    }
}