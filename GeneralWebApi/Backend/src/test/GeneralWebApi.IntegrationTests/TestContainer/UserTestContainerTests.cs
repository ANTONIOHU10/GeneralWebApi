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

    // Make sure the docker desktop is running

    [Fact]
    public async Task Seeded_Users_Should_Exist_In_Container_Database()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlServer(_dbFixture.ConnectionString)
            .Options;

        await using var db = new ApplicationDbContext(options);

        // search admin user by name
        var adminUser = await db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Name == "admin");

        Assert.NotNull(adminUser);
        Assert.Equal("admin@generalwebapi.com", adminUser!.Email);
        Assert.Equal("Admin", adminUser.Role);      // Role.Admin.ToString()
        Assert.True(adminUser.IsActive);
    }

    [Fact]
    public async Task Seeded_Manager_Should_Exist_In_Container_Database()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlServer(_dbFixture.ConnectionString)
            .Options;

        await using var db = new ApplicationDbContext(options);

        // search manager user by name
        var managerUser = await db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Name == "manager");

        Assert.NotNull(managerUser);
        Assert.Equal("manager@generalwebapi.com", managerUser!.Email);
        Assert.Equal("Manager", managerUser.Role);
        Assert.True(managerUser.IsActive);
    }

    [Fact]
    public async Task Seeded_Regular_User_Should_Exist_In_Container_Database()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlServer(_dbFixture.ConnectionString)
            .Options;

        await using var db = new ApplicationDbContext(options);

        // search regular user by name
        var regularUser = await db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Name == "user");

        Assert.NotNull(regularUser);
        Assert.Equal("user@generalwebapi.com", regularUser!.Email);
        Assert.Equal("User", regularUser.Role);
        Assert.True(regularUser.IsActive);
    }
}