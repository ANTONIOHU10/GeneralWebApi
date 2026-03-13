using System.Diagnostics;
using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using FluentAssertions;
using GeneralWebApi.Common.Helpers;
using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Users;
using GeneralWebApi.IntegrationTests.Infrastructure;
using Xunit.Abstractions;

namespace GeneralWebApi.IntegrationTests;

/// <summary>
/// Simple performance-oriented integration tests for user endpoints.
/// These are NOT full load tests, just smoke checks to prevent obvious regressions.
/// </summary>
public class UsersPerformanceTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly System.Net.Http.HttpClient _client;
    private readonly ITestOutputHelper _output;
    private const int TIME_THREADSHOULD = 500; // ms
    private const int TREE_THREADSHOULD = 1500; // ms

    public UsersPerformanceTests(CustomWebApplicationFactory factory, ITestOutputHelper output)
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
    public async Task Get_Users_With_Employee_Should_Be_Fast_Enough()
    {
        // Arrange
        await AuthenticateAsAdminAsync();

        var requestUrl = "/api/v1/Users/with-employee?api-version=1.0";
        var thresholdMs = TREE_THREADSHOULD;

        // Act
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.GetAsync(requestUrl);
        stopwatch.Stop();
        _output.WriteLine($"Get users with employee request took {stopwatch.ElapsedMilliseconds} ms.");

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<List<UserWithEmployeeDto>>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        var count = result?.Data?.Count ?? 0;
        _output.WriteLine($"Users with employee request returned {count} users.");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(thresholdMs);
    }

    [Fact]
    public async Task Get_User_With_Employee_By_Id_Should_Be_Fast_Enough()
    {
        // Arrange
        await AuthenticateAsAdminAsync();

        // First, get a user id
        var listResponse = await _client.GetAsync("/api/v1/Users/with-employee?api-version=1.0");
        listResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var listContent = await listResponse.Content.ReadAsStringAsync();
        var listResult = JsonSerializer.Deserialize<ApiResponse<List<UserWithEmployeeDto>>>(listContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        var userId = listResult?.Data?.FirstOrDefault()?.UserId
                     ?? throw new InvalidOperationException("No users found for performance test.");

        var requestUrl = $"/api/v1/Users/{userId}/with-employee?api-version=1.0";
        var thresholdMs = TIME_THREADSHOULD;

        // Act
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.GetAsync(requestUrl);
        stopwatch.Stop();
        _output.WriteLine($"Get user with employee by id request took {stopwatch.ElapsedMilliseconds} ms.");

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<UserWithEmployeeDto>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        result?.Data.Should().NotBeNull("User with employee details should be returned");
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(thresholdMs);
    }

    [Fact]
    public async Task Create_User_Should_Be_Fast_Enough()
    {
        // Arrange
        await AuthenticateAsAdminAsync();

        var requestUrl = "/api/v1/Users?api-version=1.0";
        var thresholdMs = TREE_THREADSHOULD;

        var uniqueSuffix = Guid.NewGuid().ToString("N")[..8];
        var newUser = new CreateUserRequest
        {
            Username = $"perfuser_{uniqueSuffix}",
            Email = $"perfuser_{uniqueSuffix}@example.com",
            Password = "PerfUser@123456",
            Role = "User"
        };

        var json = JsonSerializer.Serialize(newUser);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.PostAsync(requestUrl, content);
        stopwatch.Stop();
        _output.WriteLine($"Create user request took {stopwatch.ElapsedMilliseconds} ms.");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(thresholdMs);
    }
}

