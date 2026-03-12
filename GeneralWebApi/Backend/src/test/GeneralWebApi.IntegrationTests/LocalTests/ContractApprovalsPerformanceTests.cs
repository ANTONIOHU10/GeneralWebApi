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
using GeneralWebApi.DTOs.Contracts.Approvals;
using GeneralWebApi.DTOs.Employee;
using GeneralWebApi.IntegrationTests.Infrastructure;
using Xunit.Abstractions;

namespace GeneralWebApi.IntegrationTests;

/// <summary>
/// Simple performance-oriented integration tests for contract approvals endpoints.
/// These are NOT full load tests, just smoke checks to prevent obvious regressions.
/// </summary>
public class ContractApprovalsPerformanceTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly System.Net.Http.HttpClient _client;
    private readonly ITestOutputHelper _output;
    private const int TIME_THREADSHOULD = 500; // ms
    private const int TREE_THREADSHOULD = 1000; // ms

    public ContractApprovalsPerformanceTests(CustomWebApplicationFactory factory, ITestOutputHelper output)
    {
        _client = factory.CreateClient();
        _output = output;
    }

    /// <summary>
    /// Create a fresh contract that can safely be used for approval tests.
    /// The caller must ensure authentication has already been configured.
    /// </summary>
    private async Task<int> CreateFreshContractAsync()
    {
        // Pick any existing employee to associate contract with
        var employeeResponse = await _client.GetAsync("/api/v1/Employees?api-version=1.0&pageNumber=1&pageSize=1");
        employeeResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var employeeContent = await employeeResponse.Content.ReadAsStringAsync();
        var employeeResult = JsonSerializer.Deserialize<ApiResponse<PagedResult<EmployeeDto>>>(employeeContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        var employeeId = employeeResult?.Data?.Items?.FirstOrDefault()?.Id
                        ?? throw new InvalidOperationException("No employees found for contract creation in approval performance tests.");

        var newContract = new CreateContractDto
        {
            EmployeeId = employeeId,
            ContractType = "FullTime",
            StartDate = DateTime.Today,
            EndDate = DateTime.Today.AddYears(1),
            Status = "Active",
            Salary = 50000m,
            Notes = "Performance test contract for approvals"
        };

        var json = JsonSerializer.Serialize(newContract);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _client.PostAsync("/api/v1/Contracts?api-version=1.0", content);
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var body = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<ContractDto>>(body, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        var contractId = result?.Data?.Id
                         ?? throw new InvalidOperationException("Failed to create contract for approval performance tests.");

        return contractId;
    }

    /// <summary>
    /// Create a fresh contract and immediately submit it for approval.
    /// Returns the created approval DTO so that tests can reuse its identifiers.
    /// </summary>
    private async Task<ContractApprovalDto> CreateContractAndSubmitApprovalAsync(string comments)
    {
        var contractId = await CreateFreshContractAsync();

        var submitRequest = new SubmitApprovalRequest
        {
            Comments = comments,
            ApprovalSteps = null
        };

        var json = JsonSerializer.Serialize(submitRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _client.PostAsync($"/api/v1/contracts/{contractId}/submit-approval?api-version=1.0", content);
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<ContractApprovalDto>>(body, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        var approval = result?.Data
                       ?? throw new InvalidOperationException("Failed to create contract approval for performance tests.");

        return approval;
    }

    private async Task AuthenticateAsAdminAsync()
    {
        var token = await TestAuthHelper.GetAccessTokenAsync(_client, "admin", "Admin@123456");
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);
    }

    [Fact]
    public async Task Get_Pending_Approvals_Should_Be_Fast_Enough()
    {
        // Arrange
        await AuthenticateAsAdminAsync();

        var requestUrl = "/api/v1/contracts/approvals/pending?api-version=1.0&pageNumber=1&pageSize=10";
        var thresholdMs = TREE_THREADSHOULD;

        // Act
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.GetAsync(requestUrl);
        stopwatch.Stop();
        _output.WriteLine($"Get pending approvals request took {stopwatch.ElapsedMilliseconds} ms.");

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<PagedResult<ContractApprovalDto>>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        var pageCount = result?.Data?.Items?.Count ?? 0;
        var totalCount = result?.Data?.TotalCount ?? 0;
        _output.WriteLine($"Pending approvals request returned {pageCount} approvals in page, total {totalCount} approvals.");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(thresholdMs);
    }

    [Fact]
    public async Task Submit_For_Approval_Should_Be_Fast_Enough()
    {
        // Arrange
        await AuthenticateAsAdminAsync();

        // Use a freshly created contract to avoid hitting business rules about existing pending approvals
        var contractId = await CreateFreshContractAsync();

        var requestUrl = $"/api/v1/contracts/{contractId}/submit-approval?api-version=1.0";
        var thresholdMs = TIME_THREADSHOULD;

        var submitRequest = new SubmitApprovalRequest
        {
            Comments = "Performance test submit approval",
            ApprovalSteps = null // Use default workflow
        };

        var json = JsonSerializer.Serialize(submitRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.PostAsync(requestUrl, content);
        stopwatch.Stop();
        _output.WriteLine($"Submit approval request took {stopwatch.ElapsedMilliseconds} ms.");

        var responseBody = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<ContractApprovalDto>>(responseBody, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        result?.Data.Should().NotBeNull("Approval should be created");
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(thresholdMs);
    }

    [Fact]
    public async Task Approve_Approval_Should_Be_Fast_Enough()
    {
        // Arrange
        await AuthenticateAsAdminAsync();

        // Create a fresh contract and submit it for approval to ensure a clean pending approval
        var approval = await CreateContractAndSubmitApprovalAsync("Performance test approval before approve");
        var approvalId = approval.Id;

        var requestUrl = $"/api/v1/contracts/approvals/{approvalId}/approve?api-version=1.0";
        var thresholdMs = TIME_THREADSHOULD;

        var approveRequest = new ApprovalActionRequest
        {
            Comments = "Performance test approve action"
        };
        var json = JsonSerializer.Serialize(approveRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.PutAsync(requestUrl, content);
        stopwatch.Stop();
        _output.WriteLine($"Approve approval request took {stopwatch.ElapsedMilliseconds} ms.");

        var responseBody = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<bool>>(responseBody, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        result?.Data.Should().BeTrue("Approval should be approved");
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(thresholdMs);
    }

    [Fact]
    public async Task Reject_Approval_Should_Be_Fast_Enough()
    {
        // Arrange
        await AuthenticateAsAdminAsync();

        // Create a fresh contract and submit it for approval to ensure a clean pending approval
        var approval = await CreateContractAndSubmitApprovalAsync("Performance test approval before reject");
        var approvalId = approval.Id;

        var requestUrl = $"/api/v1/contracts/approvals/{approvalId}/reject?api-version=1.0";
        var thresholdMs = TIME_THREADSHOULD;

        var rejectRequest = new RejectionActionRequest
        {
            Reason = "Performance test reject action"
        };
        var json = JsonSerializer.Serialize(rejectRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.PutAsync(requestUrl, content);
        stopwatch.Stop();
        _output.WriteLine($"Reject approval request took {stopwatch.ElapsedMilliseconds} ms.");

        var responseBody = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<bool>>(responseBody, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        result?.Data.Should().BeTrue("Approval should be rejected");
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(thresholdMs);
    }

    [Fact]
    public async Task Get_Approval_By_Id_Should_Be_Fast_Enough()
    {
        // Arrange
        await AuthenticateAsAdminAsync();

        // Create a fresh contract and submit it for approval to ensure a clean approval to retrieve
        var approval = await CreateContractAndSubmitApprovalAsync("Performance test approval before get by id");
        var approvalId = approval.Id;

        var requestUrl = $"/api/v1/contracts/approvals/{approvalId}?api-version=1.0";
        var thresholdMs = TIME_THREADSHOULD;

        // Act
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.GetAsync(requestUrl);
        stopwatch.Stop();
        _output.WriteLine($"Get approval by id request took {stopwatch.ElapsedMilliseconds} ms.");

        var responseBody = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<ContractApprovalDto>>(responseBody, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        result?.Data.Should().NotBeNull("Approval details should be returned");
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(thresholdMs);
    }

    [Fact]
    public async Task Get_Approval_History_Should_Be_Fast_Enough()
    {
        // Arrange
        await AuthenticateAsAdminAsync();

        // Create a fresh contract and submit it for approval to ensure there is history for that contract
        var approval = await CreateContractAndSubmitApprovalAsync("Performance test approval before history");
        var contractId = approval.ContractId;

        var requestUrl = $"/api/v1/contracts/{contractId}/approval-history?api-version=1.0";
        var thresholdMs = TREE_THREADSHOULD;

        // Act
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.GetAsync(requestUrl);
        stopwatch.Stop();
        _output.WriteLine($"Get approval history request took {stopwatch.ElapsedMilliseconds} ms.");

        var responseBody = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<List<ContractApprovalStepDto>>>(responseBody, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        var count = result?.Data?.Count ?? 0;
        _output.WriteLine($"Approval history request returned {count} approval steps.");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(thresholdMs);
    }
}

