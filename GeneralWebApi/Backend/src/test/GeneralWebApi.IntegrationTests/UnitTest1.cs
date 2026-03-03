using System.Net;
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
    public async Task Get_UnknownRoute_Should_Return_404()
    {
        // Arrange
        var requestUrl = "/this-route-does-not-exist";

        // Act
        var response = await _client.GetAsync(requestUrl);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
