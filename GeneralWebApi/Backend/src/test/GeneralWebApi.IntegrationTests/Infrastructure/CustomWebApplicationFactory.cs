using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace GeneralWebApi.IntegrationTests.Infrastructure;

/// <summary>
/// Shared WebApplicationFactory for integration tests.
/// Uses the real Program startup, but can be customized for tests.
/// </summary>
public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // Ensure we run with Development settings (appsettings.Development.json, etc.)
        builder.UseEnvironment("Development");

        // You can customize services for tests here later (e.g. in‑memory DB, fake auth, etc.)
        // builder.ConfigureServices(services => { ... });
    }
}

