using System.Diagnostics;
using System.Net;
using System.Net.Http.Headers;
using System.Text;
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
    private const int TIME_THREADSHOULD = 500; // ms
    private const int TREE_THREADSHOULD = 1000; // ms

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
        var thresholdMs = TIME_THREADSHOULD;

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

    // [Fact]
    // public async Task Get_Employees_List_Average_Response_Time_Should_Be_Fast_Enough()
    // {
    //     // Arrange
    //     var token = await TestAuthHelper.GetAccessTokenAsync(_client, "admin", "Admin@123456");
    //     _client.DefaultRequestHeaders.Authorization =
    //         new AuthenticationHeaderValue("Bearer", token);

    //     var requestUrl = "/api/v1/Employees?api-version=1.0";

    //     var iterations = 5;           // number of measured requests
    //     var thresholdMs = TIME_THREADSHOULD;      // average threshold in milliseconds
    //     var warmupRequests = 1;       // warmup calls not included in average

    //     // Warmup (not measured)
    //     for (var i = 0; i < warmupRequests; i++)
    //     {
    //         var warmupResponse = await _client.GetAsync(requestUrl);
    //         warmupResponse.StatusCode.Should().Be(HttpStatusCode.OK);
    //     }

    //     // Act: multiple measured requests
    //     long totalElapsedMs = 0;
    //     int? lastPageCount = null;
    //     int? lastTotalCount = null;

    //     for (var i = 0; i < iterations; i++)
    //     {
    //         var stopwatch = Stopwatch.StartNew();
    //         var response = await _client.GetAsync(requestUrl);
    //         stopwatch.Stop();

    //         response.StatusCode.Should().Be(HttpStatusCode.OK);
    //         totalElapsedMs += stopwatch.ElapsedMilliseconds;
    //         _output.WriteLine($"Iteration {i + 1} took {stopwatch.ElapsedMilliseconds} ms.");

    //         var content = await response.Content.ReadAsStringAsync();
    //         var result = JsonSerializer.Deserialize<ApiResponse<PagedResult<EmployeeDto>>>(content, new JsonSerializerOptions
    //         {
    //             PropertyNameCaseInsensitive = true
    //         });
    //         lastPageCount = result?.Data?.Items?.Count;
    //         lastTotalCount = result?.Data?.TotalCount;
    //     }

    //     var averageElapsedMs = totalElapsedMs / iterations;
    //     _output.WriteLine($"Average over {iterations} requests: {averageElapsedMs} ms.");
    //     if (lastPageCount.HasValue && lastTotalCount.HasValue)
    //     {
    //         _output.WriteLine($"Last iteration returned {lastPageCount.Value} employees in page, total {lastTotalCount.Value} employees.");
    //     }

    //     // Assert
    //     averageElapsedMs.Should().BeLessThan(thresholdMs,
    //         $"Average response time should be less than {thresholdMs} ms but was {averageElapsedMs} ms.");
    // }

    [Fact]
    public async Task Get_Employee_By_Id_Should_Be_Fast_Enough()
    {
        // Arrange
        var token = await TestAuthHelper.GetAccessTokenAsync(_client, "admin", "Admin@123456");
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        // First, get an existing employee id (not measured)
        var listResponse = await _client.GetAsync("/api/v1/Employees?api-version=1.0&pageNumber=1&pageSize=1");
        listResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var listContent = await listResponse.Content.ReadAsStringAsync();
        var listResult = JsonSerializer.Deserialize<ApiResponse<PagedResult<EmployeeDto>>>(listContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        var employeeId = listResult?.Data?.Items?.FirstOrDefault()?.Id ?? throw new InvalidOperationException("No employees found for performance test.");

        var requestUrl = $"/api/v1/Employees/{employeeId}?api-version=1.0";
        var thresholdMs = TIME_THREADSHOULD;

        // Act
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.GetAsync(requestUrl);
        stopwatch.Stop();
        _output.WriteLine($"Get employee by id request took {stopwatch.ElapsedMilliseconds} ms.");

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<EmployeeDto>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        result?.Data.Should().NotBeNull("Employee details should be returned");
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(thresholdMs);
    }

    [Fact]
    public async Task Search_Employees_Should_Be_Fast_Enough()
    {
        // Arrange
        var token = await TestAuthHelper.GetAccessTokenAsync(_client, "admin", "Admin@123456");
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        // Simple search without filters to exercise the search pipeline
        var requestUrl = "/api/v1/Employees/search?api-version=1.0&pageNumber=1&pageSize=10";
        var thresholdMs = TIME_THREADSHOULD;

        // Act
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.GetAsync(requestUrl);
        stopwatch.Stop();
        _output.WriteLine($"Search employees request took {stopwatch.ElapsedMilliseconds} ms.");

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<PagedResult<EmployeeDto>>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        var count = result?.Data?.Items?.Count ?? 0;
        _output.WriteLine($"Search request returned {count} employees.");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(thresholdMs);
    }

    [Fact]
    public async Task Get_Employee_Hierarchy_Should_Be_Fast_Enough()
    {
        // Arrange
        var token = await TestAuthHelper.GetAccessTokenAsync(_client, "admin", "Admin@123456");
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        // First, get an existing employee id (not measured)
        var listResponse = await _client.GetAsync("/api/v1/Employees?api-version=1.0&pageNumber=1&pageSize=1");
        listResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var listContent = await listResponse.Content.ReadAsStringAsync();
        var listResult = JsonSerializer.Deserialize<ApiResponse<PagedResult<EmployeeDto>>>(listContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        var employeeId = listResult?.Data?.Items?.FirstOrDefault()?.Id ?? throw new InvalidOperationException("No employees found for hierarchy performance test.");

        var requestUrl = $"/api/v1/Employees/{employeeId}/hierarchy?api-version=1.0";
        var thresholdMs = TREE_THREADSHOULD;

        // Act
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.GetAsync(requestUrl);
        stopwatch.Stop();
        _output.WriteLine($"Get employee hierarchy request took {stopwatch.ElapsedMilliseconds} ms.");

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<EmployeeHierarchyDto>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        result?.Data.Should().NotBeNull("Employee hierarchy should be returned");
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(thresholdMs);
    }

    [Fact]
    public async Task Get_Managers_Should_Be_Fast_Enough()
    {
        // Arrange
        var token = await TestAuthHelper.GetAccessTokenAsync(_client, "admin", "Admin@123456");
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var requestUrl = "/api/v1/Employees/managers?api-version=1.0&pageNumber=1&pageSize=100";
        var thresholdMs = TREE_THREADSHOULD;

        // Act
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.GetAsync(requestUrl);
        stopwatch.Stop();
        _output.WriteLine($"Get managers request took {stopwatch.ElapsedMilliseconds} ms.");

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<List<EmployeeDto>>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        var count = result?.Data?.Count ?? 0;
        _output.WriteLine($"Managers request returned {count} managers.");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(thresholdMs);
    }

    [Fact]
    public async Task Create_Employee_Should_Be_Fast_Enough()
    {
        var token = await TestAuthHelper.GetAccessTokenAsync(_client, "admin", "Admin@123456");
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var requestUrl = "/api/v1/Employees?api-version=1.0";
        var thresholdMs = TIME_THREADSHOULD; // 或稍微放宽一点，比如 1000

        var newEmployee = new CreateEmployeeDto
        {
            FirstName = "Perf",
            LastName = "Test",
            Email = $"perftest_{Guid.NewGuid():N}@example.com",
            TaxCode = Guid.NewGuid().ToString("N").Substring(0, 16),
            EmploymentStatus = "Active",
            EmploymentType = "FullTime",
            HireDate = DateTime.UtcNow.Date,
            // 其他必填字段补齐
        };

        var json = JsonSerializer.Serialize(newEmployee);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var stopwatch = Stopwatch.StartNew();
        var response = await _client.PostAsync(requestUrl, content);
        stopwatch.Stop();
        _output.WriteLine($"Create employee request took {stopwatch.ElapsedMilliseconds} ms.");

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(thresholdMs);
    }
}

