using System.Diagnostics;
using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using FluentAssertions;
using GeneralWebApi.Common.Helpers;
using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Position;
using GeneralWebApi.IntegrationTests.Infrastructure;
using Xunit.Abstractions;

namespace GeneralWebApi.IntegrationTests;

/// <summary>
/// Simple performance-oriented integration tests for position endpoints.
/// These are NOT full load tests, just smoke checks to prevent obvious regressions.
/// </summary>
public class PositionsPerformanceTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly System.Net.Http.HttpClient _client;
    private readonly ITestOutputHelper _output;
    private const int TIME_THREADSHOULD = 500; // ms
    // Search/list operations over ~900 positions can be heavier; allow a slightly higher threshold
    private const int TREE_THREADSHOULD = 1600; // ms

    public PositionsPerformanceTests(CustomWebApplicationFactory factory, ITestOutputHelper output)
    {
        _client = factory.CreateClient();
        _output = output;
    }

    [Fact]
    public async Task Get_Positions_List_Should_Be_Fast_Enough()
    {
        // Arrange
        var token = await TestAuthHelper.GetAccessTokenAsync(_client, "admin", "Admin@123456");
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        // Use indexed column (Code) for ordering
        var requestUrl = "/api/v1/Positions?api-version=1.0&pageNumber=1&pageSize=20&sortBy=Code";
        var thresholdMs = TIME_THREADSHOULD;

        // Act
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.GetAsync(requestUrl);
        stopwatch.Stop();
        _output.WriteLine($"Single positions list request took {stopwatch.ElapsedMilliseconds} ms.");

        var content = await response.Content.ReadAsStringAsync();
        var singleResult = JsonSerializer.Deserialize<ApiResponse<PagedResult<PositionListDto>>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        var singlePageCount = singleResult?.Data?.Items?.Count ?? 0;
        var singleTotalCount = singleResult?.Data?.TotalCount ?? 0;
        _output.WriteLine($"Single request returned {singlePageCount} positions in page, total {singleTotalCount} positions.");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(thresholdMs);
    }

    [Fact]
    public async Task Get_Position_By_Id_Should_Be_Fast_Enough()
    {
        // Arrange
        var token = await TestAuthHelper.GetAccessTokenAsync(_client, "admin", "Admin@123456");
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        // First, get an existing position id (not measured)
        var listResponse = await _client.GetAsync("/api/v1/Positions?api-version=1.0&pageNumber=1&pageSize=1&sortBy=Code");
        listResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var listContent = await listResponse.Content.ReadAsStringAsync();
        var listResult = JsonSerializer.Deserialize<ApiResponse<PagedResult<PositionListDto>>>(listContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        var positionId = listResult?.Data?.Items?.FirstOrDefault()?.Id
                        ?? throw new InvalidOperationException("No positions found for performance test.");

        var requestUrl = $"/api/v1/Positions/{positionId}?api-version=1.0";
        var thresholdMs = TIME_THREADSHOULD;

        // Act
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.GetAsync(requestUrl);
        stopwatch.Stop();
        _output.WriteLine($"Get position by id request took {stopwatch.ElapsedMilliseconds} ms.");

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<PositionDto>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        result?.Data.Should().NotBeNull("Position details should be returned");
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(thresholdMs);
    }

    [Fact]
    public async Task Search_Positions_Should_Be_Fast_Enough()
    {
        // Arrange
        var token = await TestAuthHelper.GetAccessTokenAsync(_client, "admin", "Admin@123456");
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        // Use indexed column (Code) for ordering and request a single page
        var requestUrl = "/api/v1/Positions/search?api-version=1.0&pageNumber=1&pageSize=10&sortBy=Code";
        var thresholdMs = TREE_THREADSHOULD;

        // Act
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.GetAsync(requestUrl);
        stopwatch.Stop();
        _output.WriteLine($"Search positions request took {stopwatch.ElapsedMilliseconds} ms.");

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<PagedResult<PositionDto>>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        var pageCount = result?.Data?.Items?.Count ?? 0;
        var totalCount = result?.Data?.TotalCount ?? 0;
        _output.WriteLine($"Search request returned {pageCount} positions in page, total {totalCount} positions.");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(thresholdMs);
    }

    [Fact]
    public async Task Get_Positions_By_Department_Should_Be_Fast_Enough()
    {
        // Arrange
        var token = await TestAuthHelper.GetAccessTokenAsync(_client, "admin", "Admin@123456");
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        // Pick any department that has at least one position (using first position's department)
        var listResponse = await _client.GetAsync("/api/v1/Positions?api-version=1.0&pageNumber=1&pageSize=1&sortBy=Code");
        listResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var listContent = await listResponse.Content.ReadAsStringAsync();
        var listResult = JsonSerializer.Deserialize<ApiResponse<PagedResult<PositionListDto>>>(listContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        var departmentId = listResult?.Data?.Items?.FirstOrDefault()?.DepartmentId
                          ?? throw new InvalidOperationException("No positions with department found for performance test.");

        var requestUrl = $"/api/v1/Positions/department/{departmentId}?api-version=1.0";
        var thresholdMs = TREE_THREADSHOULD;

        // Act
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.GetAsync(requestUrl);
        stopwatch.Stop();
        _output.WriteLine($"Get positions by department request took {stopwatch.ElapsedMilliseconds} ms.");

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<List<PositionDto>>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        var count = result?.Data?.Count ?? 0;
        _output.WriteLine($"Positions by department request returned {count} positions.");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(thresholdMs);
    }

    [Fact]
    public async Task Create_Position_Should_Be_Fast_Enough()
    {
        // Arrange
        var token = await TestAuthHelper.GetAccessTokenAsync(_client, "admin", "Admin@123456");
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var requestUrl = "/api/v1/Positions?api-version=1.0";
        var thresholdMs = TIME_THREADSHOULD;

        // Use existing department as parent to avoid FK issues
        var departmentResponse = await _client.GetAsync("/api/v1/Departments?api-version=1.0&pageNumber=1&pageSize=1&sortBy=Code");
        departmentResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var departmentContent = await departmentResponse.Content.ReadAsStringAsync();
        var departmentResult = JsonSerializer.Deserialize<ApiResponse<PagedResult<DTOs.Department.DepartmentListDto>>>(departmentContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        var departmentId = departmentResult?.Data?.Items?.FirstOrDefault()?.Id
                          ?? throw new InvalidOperationException("No departments found for position creation performance test.");

        var guidSuffix = Guid.NewGuid().ToString("N").Substring(0, 8).ToUpperInvariant();

        var newPosition = new CreatePositionDto
        {
            Title = $"Perf Position {guidSuffix}",
            Code = $"POS_{guidSuffix}",
            Description = "Performance test position",
            DepartmentId = departmentId,
            Level = 1,
            IsManagement = false,
            MinSalary = 30000m,
            MaxSalary = 80000m
        };

        var json = JsonSerializer.Serialize(newPosition);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.PostAsync(requestUrl, content);
        stopwatch.Stop();
        _output.WriteLine($"Create position request took {stopwatch.ElapsedMilliseconds} ms.");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(thresholdMs);
    }
}

