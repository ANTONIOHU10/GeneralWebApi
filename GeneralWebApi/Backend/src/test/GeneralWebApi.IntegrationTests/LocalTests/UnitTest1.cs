using System.Net;
using System.Text.Json;
using FluentAssertions;
using GeneralWebApi.IntegrationTests.Infrastructure;

namespace GeneralWebApi.IntegrationTests;

public class TestControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly System.Net.Http.HttpClient _client;

    public TestControllerTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Get_UnknownRoute_Should_Return_400()
    {
        // Arrange
        var requestUrl = "/this-route-does-not-exist";

        // Act
        var response = await _client.GetAsync(requestUrl);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Get_TestEndpoint_Should_Return_SomeStatus()
    {
        // Arrange
        var requestUrl = "/api/v1/Test/test?api-version=1.0";

        // Act
        var response = await _client.GetAsync(requestUrl);

        // Assert
        response.StatusCode.Should().NotBe(HttpStatusCode.InternalServerError);
    }

    [Fact]
    public async Task Get_DocumentFiles_Should_Not_Return_500()
    {
        // Arrange
        var requestUrl = "/api/v1/Document/files?api-version=1.0";

        // Act
        var response = await _client.GetAsync(requestUrl);

        // Assert
        response.StatusCode.Should().NotBe(HttpStatusCode.InternalServerError);
    }

    [Fact]
    public async Task ValidationException_Should_Be_Mapped_To_400_With_Standard_Error_Response()
    {
        // Arrange
        var requestUrl = "/api/v1/Test/throw-validation?api-version=1.0";

        // Act
        var response = await _client.GetAsync(requestUrl);
        var content = await response.Content.ReadAsStringAsync();

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        using var json = JsonDocument.Parse(content);
        var root = json.RootElement;

        root.GetProperty("success").GetBoolean().Should().BeFalse();
        root.GetProperty("statusCode").GetInt32().Should().Be(400);
        root.GetProperty("error").GetString().Should().Be("Validation failed");
        root.GetProperty("message").GetString().Should().Contain("One or more validation errors occurred");
    }

    [Fact]
    public async Task BusinessException_Should_Be_Mapped_To_400_With_Standard_Error_Response()
    {
        // Arrange
        var requestUrl = "/api/v1/Test/throw-business?api-version=1.0";

        // Act
        var response = await _client.GetAsync(requestUrl);
        var content = await response.Content.ReadAsStringAsync();

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        using var json = JsonDocument.Parse(content);
        var root = json.RootElement;

        root.GetProperty("success").GetBoolean().Should().BeFalse();
        root.GetProperty("statusCode").GetInt32().Should().Be(400);
        root.GetProperty("error").GetString().Should().Be("Business rule violation");
        root.GetProperty("message").GetString().Should().Contain("The operation violates a business rule");
    }

    [Fact]
    public async Task UnhandledException_Should_Be_Mapped_To_500_With_InternalServerError_Response()
    {
        // Arrange
        var requestUrl = "/api/v1/Test/throw-unhandled?api-version=1.0";

        // Act
        var response = await _client.GetAsync(requestUrl);
        var content = await response.Content.ReadAsStringAsync();

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.InternalServerError);

        using var json = JsonDocument.Parse(content);
        var root = json.RootElement;

        root.GetProperty("success").GetBoolean().Should().BeFalse();
        root.GetProperty("statusCode").GetInt32().Should().Be(500);
        root.GetProperty("error").GetString().Should().Be("Internal server error");
    }
}
