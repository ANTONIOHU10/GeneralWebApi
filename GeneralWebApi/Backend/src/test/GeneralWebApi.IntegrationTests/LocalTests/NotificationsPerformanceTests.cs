using System.Diagnostics;
using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using FluentAssertions;
using GeneralWebApi.Common.Helpers;
using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Notification;
using GeneralWebApi.DTOs.Users;
using GeneralWebApi.IntegrationTests.Infrastructure;
using Xunit.Abstractions;

namespace GeneralWebApi.IntegrationTests;

/// <summary>
/// Simple performance-oriented integration tests for notification endpoints.
/// These are NOT full load tests, just smoke checks to prevent obvious regressions.
/// </summary>
public class NotificationsPerformanceTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly System.Net.Http.HttpClient _client;
    private readonly ITestOutputHelper _output;
    private const int TIME_THREADSHOULD = 800; // ms
    private const int TREE_THREADSHOULD = 1500; // ms

    public NotificationsPerformanceTests(CustomWebApplicationFactory factory, ITestOutputHelper output)
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
    public async Task Get_Notifications_List_Should_Be_Fast_Enough()
    {
        // Arrange
        await AuthenticateAsAdminAsync();

        var requestUrl = "/api/v1/Notifications?api-version=1.0&pageNumber=1&pageSize=20&includeExpired=false";
        var thresholdMs = TREE_THREADSHOULD;

        // Act
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.GetAsync(requestUrl);
        stopwatch.Stop();
        _output.WriteLine($"Get notifications list request took {stopwatch.ElapsedMilliseconds} ms.");

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<PagedResult<NotificationListDto>>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        var pageCount = result?.Data?.Items?.Count ?? 0;
        var totalCount = result?.Data?.TotalCount ?? 0;
        _output.WriteLine($"Notifications list request returned {pageCount} in page, total {totalCount}.");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(thresholdMs);
    }

    [Fact]
    public async Task Get_Unread_Count_Should_Be_Fast_Enough()
    {
        // Arrange
        await AuthenticateAsAdminAsync();

        var requestUrl = "/api/v1/Notifications/unread-count?api-version=1.0";
        var thresholdMs = TIME_THREADSHOULD;

        // Act
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.GetAsync(requestUrl);
        stopwatch.Stop();
        _output.WriteLine($"Get unread count request took {stopwatch.ElapsedMilliseconds} ms.");

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<int>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        _output.WriteLine($"Unread count: {result?.Data ?? 0}.");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(thresholdMs);
    }

    [Fact]
    public async Task Get_Notification_By_Id_Should_Be_Fast_Enough()
    {
        // Arrange
        await AuthenticateAsAdminAsync();

        // Get an existing notification id, or create one if list is empty
        var listResponse = await _client.GetAsync("/api/v1/Notifications?api-version=1.0&pageNumber=1&pageSize=1&includeExpired=false");
        listResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var listContent = await listResponse.Content.ReadAsStringAsync();
        var listResult = JsonSerializer.Deserialize<ApiResponse<PagedResult<NotificationListDto>>>(listContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        var notificationId = listResult?.Data?.Items?.FirstOrDefault()?.Id;

        if (!notificationId.HasValue || notificationId.Value == 0)
        {
            // No notifications: get current user id and create one
            var usersResponse = await _client.GetAsync("/api/v1/Users/with-employee?api-version=1.0");
            usersResponse.StatusCode.Should().Be(HttpStatusCode.OK);
            var usersContent = await usersResponse.Content.ReadAsStringAsync();
            var usersResult = JsonSerializer.Deserialize<ApiResponse<List<UserWithEmployeeDto>>>(usersContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
            var userId = usersResult?.Data?.FirstOrDefault()?.UserId
                         ?? throw new InvalidOperationException("No users found for notification creation.");

            var createDto = new CreateNotificationDto
            {
                UserId = userId.ToString(),
                Type = "System",
                Priority = "medium",
                Title = "Perf test notification",
                Message = "Created for get-by-id performance test"
            };
            var createJson = JsonSerializer.Serialize(createDto);
            var createContent = new StringContent(createJson, Encoding.UTF8, "application/json");
            var createResponse = await _client.PostAsync("/api/v1/Notifications?api-version=1.0", createContent);
            createResponse.StatusCode.Should().Be(HttpStatusCode.Created);
            var createBody = await createResponse.Content.ReadAsStringAsync();
            var createResult = JsonSerializer.Deserialize<ApiResponse<NotificationDto>>(createBody, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
            notificationId = createResult?.Data?.Id ?? throw new InvalidOperationException("Failed to create notification for get-by-id test.");
        }

        var requestUrl = $"/api/v1/Notifications/{notificationId}?api-version=1.0";
        var thresholdMs = TIME_THREADSHOULD;

        // Act
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.GetAsync(requestUrl);
        stopwatch.Stop();
        _output.WriteLine($"Get notification by id request took {stopwatch.ElapsedMilliseconds} ms.");

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ApiResponse<NotificationDto>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        result?.Data.Should().NotBeNull("Notification details should be returned");
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(thresholdMs);
    }

    [Fact]
    public async Task Create_Notification_Should_Be_Fast_Enough()
    {
        // Arrange
        await AuthenticateAsAdminAsync();

        var usersResponse = await _client.GetAsync("/api/v1/Users/with-employee?api-version=1.0");
        usersResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var usersContent = await usersResponse.Content.ReadAsStringAsync();
        var usersResult = JsonSerializer.Deserialize<ApiResponse<List<UserWithEmployeeDto>>>(usersContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        var userId = usersResult?.Data?.FirstOrDefault()?.UserId
                     ?? throw new InvalidOperationException("No users found for notification creation.");

        var requestUrl = "/api/v1/Notifications?api-version=1.0";
        var thresholdMs = TREE_THREADSHOULD;

        var uniqueSuffix = Guid.NewGuid().ToString("N")[..8];
        var createDto = new CreateNotificationDto
        {
            UserId = userId.ToString(),
            Type = "System",
            Priority = "medium",
            Title = $"Perf notification {uniqueSuffix}",
            Message = "Performance test notification"
        };

        var json = JsonSerializer.Serialize(createDto);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.PostAsync(requestUrl, content);
        stopwatch.Stop();
        _output.WriteLine($"Create notification request took {stopwatch.ElapsedMilliseconds} ms.");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(thresholdMs);
    }
}
