using System.Diagnostics;
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
/// Simple performance-oriented integration tests for contract endpoints.
/// These are NOT full load tests, just smoke checks to prevent obvious regressions.
/// </summary>
public class ContractsPerformanceTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly System.Net.Http.HttpClient _client;
    private readonly ITestOutputHelper _output;
    private const int TIME_THREADSHOULD = 500; // ms
    private const int TREE_THREADSHOULD = 1000; // ms

    public ContractsPerformanceTests(CustomWebApplicationFactory factory, ITestOutputHelper output)
    {
        _client = factory.CreateClient();
        _output = output;
    }

    [Fact]
    public async Task Get_Contracts_List_Should_Be_Fast_Enough()
    {
        // Arrange
        var token = await TestAuthHelper.GetAccessTokenAsync(_client, "admin", "Admin@123456");
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        // Use indexed column (CreatedAt) via default sorting, take first page
        var requestUrl = "/api/v1/Contracts?api-version=1.0&pageNumber=1&pageSize=20&sortBy=CreatedAt&sortDescending=true";
        var thresholdMs = TIME_THREADSHOULD;

        // Act
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.GetAsync(requestUrl);
        stopwatch.Stop();
        _output.WriteLine($"Single contracts list request took {stopwatch.ElapsedMilliseconds} ms.");

        var content = await response.Content.ReadAsStringAsync();
        var singleResult = JsonSerializer.Deserialize<ApiResponse<PagedResult<ContractListDto>>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        var singlePageCount = singleResult?.Data?.Items?.Count ?? 0;
        var singleTotalCount = singleResult?.Data?.TotalCount ?? 0;
        _output.WriteLine($"Single request returned {singlePageCount} contracts in page, total {singleTotalCount} contracts.");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(thresholdMs);
    }

    [Fact]
    public async Task Get_Contract_By_Id_Should_Be_Fast_Enough()
    {
        // Arrange
        var token = await TestAuthHelper.GetAccessTokenAsync(_client, "admin", "Admin@123456");
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        // First, get an existing contract id (not measured)
        var listResponse = await _client.GetAsync("/api/v1/Contracts?api-version=1.0&pageNumber=1&pageSize=1&sortBy=CreatedAt&sortDescending=true");
        listResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var listContent = await listResponse.Content.ReadAsStringAsync();
        var listResult = JsonSerializer.Deserialize<ApiResponse<PagedResult<ContractListDto>>>(listContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        var contractId = listResult?.Data?.Items?.FirstOrDefault()?.Id
                        ?? throw new InvalidOperationException("No contracts found for performance test.");

        var requestUrl = $"/api/v1/Contracts/{contractId}?api-version=1.0";
        var thresholdMs = TIME_THREADSHOULD;

        // Act
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.GetAsync(requestUrl);
        stopwatch.Stop();
        _output.WriteLine($"Get contract by id request took {stopwatch.ElapsedMilliseconds} ms.");

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<ContractDto>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        result?.Data.Should().NotBeNull("Contract details should be returned");
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(thresholdMs);
    }

    [Fact]
    public async Task Get_Contracts_By_Employee_Should_Be_Fast_Enough()
    {
        // Arrange
        var token = await TestAuthHelper.GetAccessTokenAsync(_client, "admin", "Admin@123456");
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        // Get an employee id that has at least one contract (use first contract's employee)
        var listResponse = await _client.GetAsync("/api/v1/Contracts?api-version=1.0&pageNumber=1&pageSize=1&sortBy=CreatedAt&sortDescending=true");
        listResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var listContent = await listResponse.Content.ReadAsStringAsync();
        var listResult = JsonSerializer.Deserialize<ApiResponse<PagedResult<ContractListDto>>>(listContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        var employeeId = listResult?.Data?.Items?.FirstOrDefault()?.EmployeeId
                        ?? throw new InvalidOperationException("No contracts with employee found for performance test.");

        var requestUrl = $"/api/v1/Contracts/employee/{employeeId}?api-version=1.0";
        var thresholdMs = TREE_THREADSHOULD;

        // Act
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.GetAsync(requestUrl);
        stopwatch.Stop();
        _output.WriteLine($"Get contracts by employee request took {stopwatch.ElapsedMilliseconds} ms.");

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<List<ContractDto>>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        var count = result?.Data?.Count ?? 0;
        _output.WriteLine($"Contracts by employee request returned {count} contracts.");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(thresholdMs);
    }

    [Fact]
    public async Task Get_Expiring_Contracts_Should_Be_Fast_Enough()
    {
        // Arrange
        var token = await TestAuthHelper.GetAccessTokenAsync(_client, "admin", "Admin@123456");
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var requestUrl = "/api/v1/Contracts/expiring?api-version=1.0&daysFromNow=30";
        var thresholdMs = TREE_THREADSHOULD;

        // Act
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.GetAsync(requestUrl);
        stopwatch.Stop();
        _output.WriteLine($"Get expiring contracts request took {stopwatch.ElapsedMilliseconds} ms.");

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<List<ContractDto>>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        var count = result?.Data?.Count ?? 0;
        _output.WriteLine($"Expiring contracts request returned {count} contracts.");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(thresholdMs);
    }

    [Fact]
    public async Task Get_Expired_Contracts_Should_Be_Fast_Enough()
    {
        // Arrange
        var token = await TestAuthHelper.GetAccessTokenAsync(_client, "admin", "Admin@123456");
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var requestUrl = "/api/v1/Contracts/expired?api-version=1.0";
        var thresholdMs = TREE_THREADSHOULD;

        // Act
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.GetAsync(requestUrl);
        stopwatch.Stop();
        _output.WriteLine($"Get expired contracts request took {stopwatch.ElapsedMilliseconds} ms.");

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<List<ContractDto>>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        var count = result?.Data?.Count ?? 0;
        _output.WriteLine($"Expired contracts request returned {count} contracts.");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(thresholdMs);
    }

    [Fact]
    public async Task Get_Contracts_By_Status_Should_Be_Fast_Enough()
    {
        // Arrange
        var token = await TestAuthHelper.GetAccessTokenAsync(_client, "admin", "Admin@123456");
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        const string status = "Active";
        var requestUrl = $"/api/v1/Contracts/status/{status}?api-version=1.0";
        var thresholdMs = TREE_THREADSHOULD;

        // Act
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.GetAsync(requestUrl);
        stopwatch.Stop();
        _output.WriteLine($"Get contracts by status request took {stopwatch.ElapsedMilliseconds} ms.");

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<List<ContractDto>>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        var count = result?.Data?.Count ?? 0;
        _output.WriteLine($"Contracts by status request returned {count} contracts.");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(thresholdMs);
    }

    [Fact]
    public async Task Create_Contract_Should_Be_Fast_Enough()
    {
        // Arrange
        var token = await TestAuthHelper.GetAccessTokenAsync(_client, "admin", "Admin@123456");
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var requestUrl = "/api/v1/Contracts?api-version=1.0";
        var thresholdMs = TIME_THREADSHOULD;

        // Pick any existing employee to associate contract with
        var employeeResponse = await _client.GetAsync("/api/v1/Employees?api-version=1.0&pageNumber=1&pageSize=1");
        employeeResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var employeeContent = await employeeResponse.Content.ReadAsStringAsync();
        var employeeResult = JsonSerializer.Deserialize<ApiResponse<PagedResult<DTOs.Employee.EmployeeDto>>>(employeeContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        var employeeId = employeeResult?.Data?.Items?.FirstOrDefault()?.Id
                        ?? throw new InvalidOperationException("No employees found for contract creation performance test.");

        var newContract = new CreateContractDto
        {
            EmployeeId = employeeId,
            ContractType = "FullTime",
            StartDate = DateTime.Today,
            EndDate = DateTime.Today.AddYears(1),
            Status = "Active",
            Salary = 50000m,
            Notes = "Performance test contract"
        };

        var json = JsonSerializer.Serialize(newContract);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.PostAsync(requestUrl, content);
        stopwatch.Stop();
        _output.WriteLine($"Create contract request took {stopwatch.ElapsedMilliseconds} ms.");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(thresholdMs);
    }

    [Fact]
    public async Task Renew_Contract_Should_Be_Fast_Enough()
    {
        // Arrange
        var token = await TestAuthHelper.GetAccessTokenAsync(_client, "admin", "Admin@123456");
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        // First, get an existing contract id (not measured)
        var listResponse = await _client.GetAsync("/api/v1/Contracts?api-version=1.0&pageNumber=1&pageSize=1&sortBy=CreatedAt&sortDescending=true");
        listResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var listContent = await listResponse.Content.ReadAsStringAsync();
        var listResult = JsonSerializer.Deserialize<ApiResponse<PagedResult<ContractListDto>>>(listContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        var contractId = listResult?.Data?.Items?.FirstOrDefault()?.Id
                        ?? throw new InvalidOperationException("No contracts found for renew performance test.");

        var requestUrl = $"/api/v1/Contracts/{contractId}/renew?api-version=1.0";
        var thresholdMs = TREE_THREADSHOULD;

        // Act
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.PostAsync(requestUrl, content: null);
        stopwatch.Stop();
        _output.WriteLine($"Renew contract request took {stopwatch.ElapsedMilliseconds} ms.");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(thresholdMs);
    }
}

