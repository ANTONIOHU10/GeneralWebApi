using System.Diagnostics;
using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;
using FluentAssertions;
using GeneralWebApi.Common.Helpers;
using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Employee;
using GeneralWebApi.IntegrationTests.Infrastructure;
using Xunit.Abstractions;

namespace GeneralWebApi.IntegrationTests;

/// <summary>
/// Simple performance-oriented integration tests for employee endpoints.
/// These are NOT full load tests, just smoke checks to prevent obvious regressions.
/// </summary>
public class EmployeesPerformanceTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly System.Net.Http.HttpClient _client;
    private readonly ITestOutputHelper _output;

    public EmployeesPerformanceTests(CustomWebApplicationFactory factory, ITestOutputHelper output)
    {
        _client = factory.CreateClient();
        _output = output;
    }

    [Fact]
    public async Task Get_Employees_List_Should_Be_Fast_Enough()
    {
        // Arrange
        var token = await TestAuthHelper.GetAccessTokenAsync(_client, "admin", "Admin@123456");
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var requestUrl = "/api/v1/Employees?api-version=1.0";
        var thresholdMs = 10000; // 10 seconds threshold for basic regression protection

        // Act
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.GetAsync(requestUrl);
        stopwatch.Stop();
        _output.WriteLine($"Single employees list request took {stopwatch.ElapsedMilliseconds} ms.");

        var content = await response.Content.ReadAsStringAsync();
        var singleResult = JsonSerializer.Deserialize<ApiResponse<PagedResult<EmployeeDto>>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        var singlePageCount = singleResult?.Data?.Items?.Count ?? 0;
        var singleTotalCount = singleResult?.Data?.TotalCount ?? 0;
        _output.WriteLine($"Single request returned {singlePageCount} employees in page, total {singleTotalCount} employees.");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(thresholdMs);
    }

    [Fact]
    public async Task Get_Employees_List_Average_Response_Time_Should_Be_Fast_Enough()
    {
        // Arrange
        var token = await TestAuthHelper.GetAccessTokenAsync(_client, "admin", "Admin@123456");
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var requestUrl = "/api/v1/Employees?api-version=1.0";

        var iterations = 5;           // number of measured requests
        var thresholdMs = 10000;      // average threshold in milliseconds
        var warmupRequests = 1;       // warmup calls not included in average

        // Warmup (not measured)
        for (var i = 0; i < warmupRequests; i++)
        {
            var warmupResponse = await _client.GetAsync(requestUrl);
            warmupResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        // Act: multiple measured requests
        long totalElapsedMs = 0;
        int? lastPageCount = null;
        int? lastTotalCount = null;

        for (var i = 0; i < iterations; i++)
        {
            var stopwatch = Stopwatch.StartNew();
            var response = await _client.GetAsync(requestUrl);
            stopwatch.Stop();

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            totalElapsedMs += stopwatch.ElapsedMilliseconds;
            _output.WriteLine($"Iteration {i + 1} took {stopwatch.ElapsedMilliseconds} ms.");

            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<ApiResponse<PagedResult<EmployeeDto>>>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
            lastPageCount = result?.Data?.Items?.Count;
            lastTotalCount = result?.Data?.TotalCount;
        }

        var averageElapsedMs = totalElapsedMs / iterations;
        _output.WriteLine($"Average over {iterations} requests: {averageElapsedMs} ms.");
        if (lastPageCount.HasValue && lastTotalCount.HasValue)
        {
            _output.WriteLine($"Last iteration returned {lastPageCount.Value} employees in page, total {lastTotalCount.Value} employees.");
        }

        // Assert
        averageElapsedMs.Should().BeLessThan(thresholdMs,
            $"Average response time should be less than {thresholdMs} ms but was {averageElapsedMs} ms.");
    }
}

