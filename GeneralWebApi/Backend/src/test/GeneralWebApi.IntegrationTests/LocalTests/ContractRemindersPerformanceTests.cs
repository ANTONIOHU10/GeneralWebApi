using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using FluentAssertions;
using GeneralWebApi.Common.Helpers;
using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Contract;
using GeneralWebApi.IntegrationTests.Infrastructure;
using Xunit.Abstractions;

namespace GeneralWebApi.IntegrationTests;

/// <summary>
/// Simple performance-oriented and behavior integration tests
/// for contract reminder / renewal endpoints.
/// </summary>
public class ContractRemindersPerformanceTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly System.Net.Http.HttpClient _client;
    private readonly ITestOutputHelper _output;

    public ContractRemindersPerformanceTests(CustomWebApplicationFactory factory, ITestOutputHelper output)
    {
        _client = factory.CreateClient();
        _output = output;
    }

    private async Task AuthenticateAsAdminAsync()
    {
        var token = await TestAuthHelper.GetAccessTokenAsync(_client, "admin", "Admin@123456");
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);
    }

    [Fact]
    public async Task Renew_Expiring_Contract_Should_Update_EndDate_And_Reminder()
    {
        await AuthenticateAsAdminAsync();

        // Arrange: create a contract that will expire soon
        // Reuse a real employee from the system to satisfy FK constraints
        var employeeResponse = await _client.GetAsync("/api/v1/Employees?api-version=1.0&pageNumber=1&pageSize=1");
        employeeResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var employeeContent = await employeeResponse.Content.ReadAsStringAsync();
        var employeeResult = JsonSerializer.Deserialize<ApiResponse<PagedResult<DTOs.Employee.EmployeeDto>>>(employeeContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        var employeeId = employeeResult?.Data?.Items?.FirstOrDefault()?.Id
                        ?? throw new InvalidOperationException("No employees found for contract reminder test.");

        var today = DateTime.Today;
        var initialEndDate = today.AddDays(10);
        var initialReminderDate = initialEndDate.AddDays(-5);

        var createDto = new CreateContractDto
        {
            EmployeeId = employeeId,
            ContractType = "FullTime",
            StartDate = today,
            EndDate = initialEndDate,
            Status = "Active",
            Salary = 50000m,
            Notes = "Integration test contract for renewal",
            RenewalReminderDate = initialReminderDate
        };

        var createJson = JsonSerializer.Serialize(createDto);
        var createContent = new StringContent(createJson, Encoding.UTF8, "application/json");
        var createResponse = await _client.PostAsync("/api/v1/Contracts?api-version=1.0", createContent);
        createResponse.StatusCode.Should().Be(HttpStatusCode.Created);

        var createBody = await createResponse.Content.ReadAsStringAsync();
        var created = JsonSerializer.Deserialize<ApiResponse<ContractDto>>(createBody, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        created.Should().NotBeNull();
        created!.Data.Should().NotBeNull();

        var contractId = created.Data!.Id;

        // Act: call renew endpoint
        var stopwatch = System.Diagnostics.Stopwatch.StartNew();
        var renewResponse = await _client.PostAsync($"/api/v1/Contracts/{contractId}/renew?api-version=1.0", content: null);
        stopwatch.Stop();

        _output.WriteLine($"Renew expiring contract request took {stopwatch.ElapsedMilliseconds} ms.");

        renewResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var renewBody = await renewResponse.Content.ReadAsStringAsync();
        var renewed = JsonSerializer.Deserialize<ApiResponse<ContractDto>>(renewBody, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        renewed.Should().NotBeNull();
        renewed!.Data.Should().NotBeNull();

        var renewedContract = renewed.Data!;

        // Assert: end date is extended by about one year from initial end date
        renewedContract.EndDate.Should().NotBeNull();
        var expectedEndDate = initialEndDate.AddYears(1);

        _output.WriteLine($"Initial end date: {initialEndDate:yyyy-MM-dd}, renewed end date: {renewedContract.EndDate:yyyy-MM-dd}");

        renewedContract.EndDate!.Value.Date.Should().Be(expectedEndDate.Date);
        renewedContract.Status.Should().Be("Active");

        // Reminder should be 30 days before new end date
        renewedContract.RenewalReminderDate.Should().NotBeNull();
        var expectedReminderDate = expectedEndDate.AddDays(-30);
        _output.WriteLine($"Expected reminder date: {expectedReminderDate:yyyy-MM-dd}, actual: {renewedContract.RenewalReminderDate:yyyy-MM-dd}");
        renewedContract.RenewalReminderDate!.Value.Date.Should().Be(expectedReminderDate.Date);
    }

    [Fact]
    public async Task Renew_Expired_Contract_Should_Reactivate_And_Set_Reminder()
    {
        await AuthenticateAsAdminAsync();

        // Arrange: create an already expired contract
        // Reuse a real employee from the system to satisfy FK constraints
        var employeeResponse = await _client.GetAsync("/api/v1/Employees?api-version=1.0&pageNumber=1&pageSize=1");
        employeeResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var employeeContent = await employeeResponse.Content.ReadAsStringAsync();
        var employeeResult = JsonSerializer.Deserialize<ApiResponse<PagedResult<DTOs.Employee.EmployeeDto>>>(employeeContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        var employeeId = employeeResult?.Data?.Items?.FirstOrDefault()?.Id
                        ?? throw new InvalidOperationException("No employees found for contract reminder test.");

        var today = DateTime.Today;
        var initialEndDate = today.AddDays(-5);

        var createDto = new CreateContractDto
        {
            EmployeeId = employeeId,
            ContractType = "FullTime",
            StartDate = today.AddYears(-1),
            EndDate = initialEndDate,
            Status = "Expired",
            Salary = 40000m,
            Notes = "Integration test expired contract for renewal"
        };

        var createJson = JsonSerializer.Serialize(createDto);
        var createContent = new StringContent(createJson, Encoding.UTF8, "application/json");
        var createResponse = await _client.PostAsync("/api/v1/Contracts?api-version=1.0", createContent);
        createResponse.StatusCode.Should().Be(HttpStatusCode.Created);

        var createBody = await createResponse.Content.ReadAsStringAsync();
        var created = JsonSerializer.Deserialize<ApiResponse<ContractDto>>(createBody, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        created.Should().NotBeNull();
        created!.Data.Should().NotBeNull();

        var contractId = created.Data!.Id;

        // Act: renew
        var stopwatch = System.Diagnostics.Stopwatch.StartNew();
        var renewResponse = await _client.PostAsync($"/api/v1/Contracts/{contractId}/renew?api-version=1.0", content: null);
        stopwatch.Stop();

        _output.WriteLine($"Renew expired contract request took {stopwatch.ElapsedMilliseconds} ms.");

        renewResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var renewBody = await renewResponse.Content.ReadAsStringAsync();
        var renewed = JsonSerializer.Deserialize<ApiResponse<ContractDto>>(renewBody, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        renewed.Should().NotBeNull();
        renewed!.Data.Should().NotBeNull();

        var renewedContract = renewed.Data!;

        // Assert: end date is at least one year from today and status is Active
        renewedContract.EndDate.Should().NotBeNull();
        var minExpectedEndDate = today.AddYears(1);
        renewedContract.EndDate!.Value.Date.Should().Be(minExpectedEndDate.Date);
        renewedContract.Status.Should().Be("Active");

        renewedContract.RenewalReminderDate.Should().NotBeNull();
        var expectedReminderDate = minExpectedEndDate.AddDays(-30);
        renewedContract.RenewalReminderDate!.Value.Date.Should().Be(expectedReminderDate.Date);
    }
}

