using System.Diagnostics;
using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using FluentAssertions;
using GeneralWebApi.Common.Helpers;
using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.ContractTemplate;
using GeneralWebApi.IntegrationTests.Infrastructure;
using Xunit.Abstractions;

namespace GeneralWebApi.IntegrationTests;

/// <summary>
/// Simple performance-oriented integration tests for contract templates endpoints.
/// Not full load tests, just smoke checks to prevent obvious regressions.
/// </summary>
public class ContractTemplatesPerformanceTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly System.Net.Http.HttpClient _client;
    private readonly ITestOutputHelper _output;
    private const int TIME_THREADSHOULD = 500; // ms
    private const int TREE_THREADSHOULD = 1000; // ms

    public ContractTemplatesPerformanceTests(CustomWebApplicationFactory factory, ITestOutputHelper output)
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
    public async Task Get_ContractTemplates_List_Should_Be_Fast_Enough()
    {
        // Arrange
        await AuthenticateAsAdminAsync();

        // Use indexed column (Id) for default sort, first page
        var requestUrl = "/api/v1/contract-templates?api-version=1.0&pageNumber=1&pageSize=20&sortBy=CreatedAt&sortDescending=true";
        var thresholdMs = TREE_THREADSHOULD;

        // Act
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.GetAsync(requestUrl);
        stopwatch.Stop();
        _output.WriteLine($"Get contract templates list request took {stopwatch.ElapsedMilliseconds} ms.");

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<PagedResult<ContractTemplateListDto>>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        var pageCount = result?.Data?.Items?.Count ?? 0;
        var totalCount = result?.Data?.TotalCount ?? 0;
        _output.WriteLine($"List request returned {pageCount} templates in page, total {totalCount} templates.");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(thresholdMs);
    }

    [Fact]
    public async Task Get_ContractTemplate_By_Id_Should_Be_Fast_Enough()
    {
        // Arrange
        await AuthenticateAsAdminAsync();

        // Get an existing template id (or create one if list is empty)
        var listResponse = await _client.GetAsync("/api/v1/contract-templates?api-version=1.0&pageNumber=1&pageSize=1&sortBy=Id");
        listResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var listContent = await listResponse.Content.ReadAsStringAsync();
        var listResult = JsonSerializer.Deserialize<ApiResponse<PagedResult<ContractTemplateListDto>>>(listContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        var templateId = listResult?.Data?.Items?.FirstOrDefault()?.Id;
        if (!templateId.HasValue || templateId.Value == 0)
        {
            // No templates yet: create one then get by id
            var createDto = new CreateContractTemplateDto
            {
                Name = "Perf Test Template",
                Description = "For get-by-id performance test",
                ContractType = "FullTime",
                TemplateContent = "Sample content",
                IsActive = true,
                IsDefault = false
            };
            var createJson = JsonSerializer.Serialize(createDto);
            var createContent = new StringContent(createJson, Encoding.UTF8, "application/json");
            var createResponse = await _client.PostAsync("/api/v1/contract-templates?api-version=1.0", createContent);
            createResponse.StatusCode.Should().Be(HttpStatusCode.Created);
            var createBody = await createResponse.Content.ReadAsStringAsync();
            var createResult = JsonSerializer.Deserialize<ApiResponse<ContractTemplateDto>>(createBody, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            templateId = createResult?.Data?.Id ?? throw new InvalidOperationException("Failed to create template for get-by-id test.");
        }

        var requestUrl = $"/api/v1/contract-templates/{templateId}?api-version=1.0";
        var thresholdMs = TIME_THREADSHOULD;

        // Act
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.GetAsync(requestUrl);
        stopwatch.Stop();
        _output.WriteLine($"Get contract template by id request took {stopwatch.ElapsedMilliseconds} ms.");

        var responseBody = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<ContractTemplateDto>>(responseBody, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        result?.Data.Should().NotBeNull("Template details should be returned");
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(thresholdMs);
    }

    [Fact]
    public async Task Search_ContractTemplates_Should_Be_Fast_Enough()
    {
        // Arrange
        await AuthenticateAsAdminAsync();

        var requestUrl = "/api/v1/contract-templates?api-version=1.0&pageNumber=1&pageSize=10&sortBy=Id";
        var thresholdMs = TREE_THREADSHOULD;

        // Act
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.GetAsync(requestUrl);
        stopwatch.Stop();
        _output.WriteLine($"Search contract templates request took {stopwatch.ElapsedMilliseconds} ms.");

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<PagedResult<ContractTemplateListDto>>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        var pageCount = result?.Data?.Items?.Count ?? 0;
        var totalCount = result?.Data?.TotalCount ?? 0;
        _output.WriteLine($"Search returned {pageCount} templates in page, total {totalCount}.");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(thresholdMs);
    }

    [Fact]
    public async Task Create_ContractTemplate_Should_Be_Fast_Enough()
    {
        // Arrange
        await AuthenticateAsAdminAsync();

        var requestUrl = "/api/v1/contract-templates?api-version=1.0";
        // Create involves DB insert + audit; use higher threshold to avoid flakiness
        var thresholdMs = TREE_THREADSHOULD;

        var uniqueName = $"Perf Template {Guid.NewGuid().ToString("N")[..8]}";
        var newTemplate = new CreateContractTemplateDto
        {
            Name = uniqueName,
            Description = "Performance test contract template",
            ContractType = "FullTime",
            TemplateContent = "This is a performance test template content.",
            Variables = "{}",
            Category = "Employment",
            IsActive = true,
            IsDefault = false
        };

        var json = JsonSerializer.Serialize(newTemplate);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.PostAsync(requestUrl, content);
        stopwatch.Stop();
        _output.WriteLine($"Create contract template request took {stopwatch.ElapsedMilliseconds} ms.");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(thresholdMs);
    }
}
