using System;
using System.Threading.Tasks;
using DotNet.Testcontainers.Builders;
using DotNet.Testcontainers.Containers;
using GeneralWebApi.Integration.Context;
using GeneralWebApi.Integration.Seeds;
using Microsoft.EntityFrameworkCore;
using Testcontainers.MsSql;
using Xunit;

namespace GeneralWebApi.IntegrationTests.Infrastructure;

public sealed class SqlServerTestcontainerFixture : IAsyncLifetime
{
    private readonly MsSqlContainer _container;

    public string ConnectionString => _container.GetConnectionString();

    public SqlServerTestcontainerFixture()
    {
        // note: the password must meet the SQL Server strong password requirements
        _container = new MsSqlBuilder()
            .WithImage("mcr.microsoft.com/mssql/server:2022-latest")
            .WithPassword("Your_strong!Password1")
            .WithCleanUp(true)           // automatically clean up after tests
            .Build();
    }

    public async Task InitializeAsync()
    {
        await _container.StartAsync();

        // after the container is started, run migrations + seed
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlServer(ConnectionString)
            .Options;

        using var db = new ApplicationDbContext(options);

        // if you are using Migrations in Program, you can directly:
        await db.Database.MigrateAsync();
        await UserSeeder.SeedAsync(db);

        // if the seed is done in OnModelCreating or Migration, this step is enough.
        // if you have extra custom seed (like manually Add users), you can do it here:
        // await EnsureTestUsersSeededAsync(db);
    }

    public async Task DisposeAsync()
    {
        await _container.StopAsync();
    }
}