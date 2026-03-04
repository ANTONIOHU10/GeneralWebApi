using System.Linq;
using System.Threading.Tasks;
using GeneralWebApi.Integration.Context;
using GeneralWebApi.IntegrationTests.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace GeneralWebApi.IntegrationTests;

[Collection("Testcontainers")]
public class UserTestContainerTests
{
    private readonly SqlServerTestcontainerFixture _dbFixture;

    public UserTestContainerTests(SqlServerTestcontainerFixture dbFixture)
    {
        _dbFixture = dbFixture;
    }

    [Fact]
    public async Task Seeded_Users_Should_Exist_In_Container_Database()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlServer(_dbFixture.ConnectionString)
            .Options;

        await using var db = new ApplicationDbContext(options);

        // serach user by name
        var adminUser = await db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Name == "admin");

        Assert.NotNull(adminUser);
        Assert.Equal("admin@generalwebapi.com", adminUser!.Email);
        Assert.Equal("Admin", adminUser.Role);      // Role.Admin.ToString()
        Assert.True(adminUser.IsActive);
    }
}