using System.Diagnostics;
using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using FluentAssertions;
using GeneralWebApi.Common.Helpers;
using GeneralWebApi.Contracts.Common;
using GeneralWebApi.DTOs.Permissions;
using GeneralWebApi.IntegrationTests.Infrastructure;
using Xunit.Abstractions;

namespace GeneralWebApi.IntegrationTests;

/// <summary>
/// Simple performance-oriented integration tests for role endpoints.
/// These are NOT full load tests, just smoke checks to prevent obvious regressions.
/// </summary>
public class RolesPerformanceTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly System.Net.Http.HttpClient _client;
    private readonly ITestOutputHelper _output;
    private const int TIME_THREADSHOULD = 500; // ms
    // Roles listing involves includes and per-role employee count, allow a higher threshold
    private const int TREE_THREADSHOULD = 2000; // ms

    public RolesPerformanceTests(CustomWebApplicationFactory factory, ITestOutputHelper output)
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
    public async Task Get_Roles_List_Should_Be_Fast_Enough()
    {
        // Arrange
        await AuthenticateAsAdminAsync();

        var requestUrl = "/api/v1/Roles?api-version=1.0";
        var thresholdMs = TREE_THREADSHOULD;

        // Act
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.GetAsync(requestUrl);
        stopwatch.Stop();
        _output.WriteLine($"Get roles list request took {stopwatch.ElapsedMilliseconds} ms.");

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<List<RoleListDto>>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        var count = result?.Data?.Count ?? 0;
        _output.WriteLine($"Roles list request returned {count} roles.");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(thresholdMs);
    }

    [Fact]
    public async Task Get_Role_By_Id_Should_Be_Fast_Enough()
    {
        // Arrange
        await AuthenticateAsAdminAsync();

        // First, get a role id
        var listResponse = await _client.GetAsync("/api/v1/Roles?api-version=1.0");
        listResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var listContent = await listResponse.Content.ReadAsStringAsync();
        var listResult = JsonSerializer.Deserialize<ApiResponse<List<RoleListDto>>>(listContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        var roleId = listResult?.Data?.FirstOrDefault()?.Id
                     ?? throw new InvalidOperationException("No roles found for performance test.");

        var requestUrl = $"/api/v1/Roles/{roleId}?api-version=1.0";
        var thresholdMs = TIME_THREADSHOULD;

        // Act
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.GetAsync(requestUrl);
        stopwatch.Stop();
        _output.WriteLine($"Get role by id request took {stopwatch.ElapsedMilliseconds} ms.");

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<RoleDto>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        result?.Data.Should().NotBeNull("Role details should be returned");
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(thresholdMs);
    }

    [Fact]
    public async Task Create_Role_Should_Be_Fast_Enough()
    {
        // Arrange
        await AuthenticateAsAdminAsync();

        var requestUrl = "/api/v1/Roles?api-version=1.0";
        var thresholdMs = TREE_THREADSHOULD;

        var uniqueName = $"PerfRole_{Guid.NewGuid().ToString("N")[..8]}";
        var newRole = new CreateRoleDto
        {
            Name = uniqueName,
            Description = "Performance test role"
        };

        var json = JsonSerializer.Serialize(newRole);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.PostAsync(requestUrl, content);
        stopwatch.Stop();
        _output.WriteLine($"Create role request took {stopwatch.ElapsedMilliseconds} ms.");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(thresholdMs);
    }
}

