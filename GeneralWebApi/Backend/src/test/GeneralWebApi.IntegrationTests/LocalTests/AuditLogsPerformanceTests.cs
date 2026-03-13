using System.Diagnostics;
using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;
using FluentAssertions;
using GeneralWebApi.Common.Helpers;
using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Audit;
using GeneralWebApi.IntegrationTests.Infrastructure;
using Xunit.Abstractions;

namespace GeneralWebApi.IntegrationTests;

/// <summary>
/// Simple performance-oriented integration tests for audit logs endpoints.
/// These are NOT full load tests, just smoke checks to prevent obvious regressions.
/// </summary>
public class AuditLogsPerformanceTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly System.Net.Http.HttpClient _client;
    private readonly ITestOutputHelper _output;
    private const int TIME_THREADSHOULD = 500; // ms
    private const int TREE_THREADSHOULD = 1500; // ms

    public AuditLogsPerformanceTests(CustomWebApplicationFactory factory, ITestOutputHelper output)
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

    /// <summary>
    /// Ensure there is at least one audit log by triggering a simple request.
    /// </summary>
    private async Task EnsureAuditActivityAsync()
    {
        // Make a simple authenticated request that will pass through the audit middleware
        await AuthenticateAsAdminAsync();
        var response = await _client.GetAsync("/api/v1/Employees?api-version=1.0&pageNumber=1&pageSize=1");
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Get_AuditLogs_List_Should_Be_Fast_Enough()
    {
        // Arrange
        await EnsureAuditActivityAsync();

        var requestUrl = "/api/v1/AuditLogs?api-version=1.0&pageNumber=1&pageSize=20";
        var thresholdMs = TREE_THREADSHOULD;

        // Act
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.GetAsync(requestUrl);
        stopwatch.Stop();
        _output.WriteLine($"Get audit logs list request took {stopwatch.ElapsedMilliseconds} ms.");

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<PagedResult<AuditLogDto>>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        var pageCount = result?.Data?.Items?.Count ?? 0;
        var totalCount = result?.Data?.TotalCount ?? 0;
        _output.WriteLine($"Audit logs list request returned {pageCount} logs in page, total {totalCount} logs.");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(thresholdMs);
    }

    [Fact]
    public async Task Get_AuditLog_By_Id_Should_Be_Fast_Enough()
    {
        // Arrange
        await EnsureAuditActivityAsync();

        // First, get an existing audit log id
        var listResponse = await _client.GetAsync("/api/v1/AuditLogs?api-version=1.0&pageNumber=1&pageSize=1");
        listResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var listContent = await listResponse.Content.ReadAsStringAsync();
        var listResult = JsonSerializer.Deserialize<ApiResponse<PagedResult<AuditLogDto>>>(listContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        var auditId = listResult?.Data?.Items?.FirstOrDefault()?.Id
                      ?? throw new InvalidOperationException("No audit logs found for performance test.");

        var requestUrl = $"/api/v1/AuditLogs/{auditId}?api-version=1.0";
        var thresholdMs = TIME_THREADSHOULD;

        // Act
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.GetAsync(requestUrl);
        stopwatch.Stop();
        _output.WriteLine($"Get audit log by id request took {stopwatch.ElapsedMilliseconds} ms.");

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<AuditLogDto>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        result?.Data.Should().NotBeNull("Audit log details should be returned");
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(thresholdMs);
    }

    [Fact]
    public async Task Get_AuditLog_Statistics_Should_Be_Fast_Enough()
    {
        // Arrange
        await EnsureAuditActivityAsync();

        var requestUrl = "/api/v1/AuditLogs/statistics?api-version=1.0";
        var thresholdMs = TREE_THREADSHOULD;

        // Act
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.GetAsync(requestUrl);
        stopwatch.Stop();
        _output.WriteLine($"Get audit log statistics request took {stopwatch.ElapsedMilliseconds} ms.");

        var content = await response.Content.ReadAsStringAsync();
        // We do not strongly type statistics here; just ensure it is valid JSON and non-empty
        using var doc = JsonDocument.Parse(content);
        doc.RootElement.GetProperty("data").ValueKind.Should().NotBe(JsonValueKind.Undefined);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(thresholdMs);
    }
}

