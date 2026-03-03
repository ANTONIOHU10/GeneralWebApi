using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using FluentAssertions;
using GeneralWebApi.Common.Helpers;
using GeneralWebApi.Integration.Context;
using GeneralWebApi.Integration.Repository.AuditRepository;
using GeneralWebApi.IntegrationTests.Infrastructure;
using Microsoft.Extensions.DependencyInjection;

namespace GeneralWebApi.IntegrationTests;

/// <summary>
/// Basic audit pipeline integration tests.
/// These tests assume that the real database is available and configured
/// (same connection string as your Development environment).
/// </summary>
public class AuditIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;
    private readonly System.Net.Http.HttpClient _client;

    public AuditIntegrationTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CreateEmployee_Should_Write_AuditLog_Record()
    {
        // NOTE:
        // This test assumes:
        // - A test database with migrations applied
        // - The admin account (admin / Admin@123456) exists

        // Arrange: authenticate as admin
        var token = await TestAuthHelper.GetAccessTokenAsync(_client, "admin", "Admin@123456");
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Prepare a minimal valid employee payload
        var uniqueSuffix = Guid.NewGuid().ToString("N").Substring(0, 4);
        var email = $"audit.employee+{uniqueSuffix}@example.com";
        var taxCode = $"AUDIT-TAX-{uniqueSuffix}";

        var employeePayload = new
        {
            FirstName = "Audit",
            LastName = "Employee",
            Email = email,
            PhoneNumber = "+10000000000",
            DepartmentId = (int?)null,
            PositionId = (int?)null,
            ManagerId = (int?)null,
            HireDate = DateTime.UtcNow.Date,
            EmploymentStatus = "Active",
            EmploymentType = "FullTime",
            IsManager = false,
            CurrentSalary = 50000m,
            SalaryCurrency = "USD",
            Address = "Audit Street 1",
            City = "Audit City",
            PostalCode = "00000",
            Country = "Audit Country",
            EmergencyContactName = "Audit Contact",
            EmergencyContactPhone = "+19999999999",
            EmergencyContactRelation = "Friend",
            TaxCode = taxCode,
            Avatar = (string?)null
        };

        var jsonBody = JsonSerializer.Serialize(employeePayload);
        var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");
        var request = new HttpRequestMessage(HttpMethod.Post, "/api/v1/Employees?api-version=1.0")
        {
            Content = content
        };

        // Act: send the request that should trigger audit logging
        var response = await _client.SendAsync(request);
        response.StatusCode.Should().Be(HttpStatusCode.Created);

        // Assert: inspect audit logs in the database
        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var auditRepository = scope.ServiceProvider.GetRequiredService<IAuditLogRepository>();

        dbContext.Should().NotBeNull();
        auditRepository.Should().NotBeNull();

        var auditLogs = await auditRepository.GetByActionAsync("Create");
        auditLogs.Should().NotBeEmpty("creating an employee should produce an audit log entry");
        auditLogs.Any(log => log.EntityType == "Employees" || log.EntityType == "Employee")
                  .Should().BeTrue("audit log should reflect Employee entity type for the create operation");
    }
}

