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
/// Simple performance-oriented integration tests for permission endpoints.
/// These are NOT full load tests, just smoke checks to prevent obvious regressions.
/// </summary>
public class PermissionsPerformanceTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly System.Net.Http.HttpClient _client;
    private readonly ITestOutputHelper _output;
    // Allow some buffer for permission detail queries on your environment
    private const int TIME_THREADSHOULD = 1000; // ms
    private const int TREE_THREADSHOULD = 1500; // ms

    public PermissionsPerformanceTests(CustomWebApplicationFactory factory, ITestOutputHelper output)
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
    public async Task Get_Permissions_List_Should_Be_Fast_Enough()
    {
        // Arrange
        await AuthenticateAsAdminAsync();

        var requestUrl = "/api/v1/Permissions?api-version=1.0";
        var thresholdMs = TREE_THREADSHOULD;

        // Act
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.GetAsync(requestUrl);
        stopwatch.Stop();
        _output.WriteLine($"Get permissions list request took {stopwatch.ElapsedMilliseconds} ms.");

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<List<PermissionListDto>>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        var count = result?.Data?.Count ?? 0;
        _output.WriteLine($"Permissions list request returned {count} permissions.");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(thresholdMs);
    }

    [Fact]
    public async Task Get_Permission_By_Id_Should_Be_Fast_Enough()
    {
        // Arrange
        await AuthenticateAsAdminAsync();

        // First, get a permission id
        var listResponse = await _client.GetAsync("/api/v1/Permissions?api-version=1.0");
        listResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var listContent = await listResponse.Content.ReadAsStringAsync();
        var listResult = JsonSerializer.Deserialize<ApiResponse<List<PermissionListDto>>>(listContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        var permissionId = listResult?.Data?.FirstOrDefault()?.Id
                           ?? throw new InvalidOperationException("No permissions found for performance test.");

        var requestUrl = $"/api/v1/Permissions/{permissionId}?api-version=1.0";
        var thresholdMs = TIME_THREADSHOULD;

        // Act
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.GetAsync(requestUrl);
        stopwatch.Stop();
        _output.WriteLine($"Get permission by id request took {stopwatch.ElapsedMilliseconds} ms.");

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<PermissionDto>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        result?.Data.Should().NotBeNull("Permission details should be returned");
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(thresholdMs);
    }

    [Fact]
    public async Task Create_Permission_Should_Be_Fast_Enough()
    {
        // Arrange
        await AuthenticateAsAdminAsync();

        var requestUrl = "/api/v1/Permissions?api-version=1.0";
        var thresholdMs = TREE_THREADSHOULD;

        var uniqueSuffix = Guid.NewGuid().ToString("N")[..8];
        var uniqueName = $"PerfPermission_{uniqueSuffix}";
        var newPermission = new CreatePermissionDto
        {
            Name = uniqueName,
            Description = "Performance test permission",
            Resource = $"PerfResource_{uniqueSuffix}",
            Action = $"PerfAction_{uniqueSuffix}",
            Category = $"PerfCategory_{uniqueSuffix}"
        };

        var json = JsonSerializer.Serialize(newPermission);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.PostAsync(requestUrl, content);
        stopwatch.Stop();
        _output.WriteLine($"Create permission request took {stopwatch.ElapsedMilliseconds} ms.");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(thresholdMs);
    }
}

